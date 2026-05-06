require("dotenv").config();
const crypto = require("crypto");
const express = require("express");
const cors = require("cors");
const http = require("http");
const WebSocket = require("ws");
const supabase = require("./src/services/supabase");

const app = express();
const server = http.createServer(app);
app.disable("x-powered-by");
app.set("trust proxy", 1);

const isProduction = process.env.NODE_ENV === "production";
const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const isOriginAllowed = (origin) => {
  if (!origin) return !isProduction;
  if (!isProduction && allowedOrigins.length === 0) return true;

  return allowedOrigins.includes(origin);
};

const wss = new WebSocket.Server({
  server,
  verifyClient: ({ origin }, done) => {
    if (isOriginAllowed(origin)) {
      done(true);
      return;
    }

    done(false, 403, "Origen no permitido");
  },
});

// Prueba de conexión a Supabase
supabase
  .from("usuarios")
  .select("id")
  .limit(1)
  .then(({ error }) => {
    if (error) console.error("Error de conexión:", error.message);
    else console.log("Supabase conectado ✓");
  });

app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, isOriginAllowed(origin));
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "X-Verifier-Access-Code"],
    maxAge: 600,
  })
);
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  next();
});
app.use(express.json({ limit: "16kb", strict: true }));
app.use((error, req, res, next) => {
  if (error?.type === "entity.too.large") {
    return res.status(413).json({
      status: "error",
      message: "La solicitud excede el tamaño permitido.",
    });
  }

  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res.status(400).json({
      status: "error",
      message: "Solicitud JSON invalida.",
    });
  }

  return next(error);
});

app.get("/", (req, res) => {
  res.json({ message: "EventMaster API running" });
});

const MAX_RAW_TOKEN_LENGTH = 2048;
const MAX_TICKET_TOKEN_LENGTH = 255;
const VERIFY_RATE_LIMIT_WINDOW_MS = 60 * 1000;
const VERIFY_RATE_LIMIT_MAX_ATTEMPTS = 30;
const verifyAttempts = new Map();

const safeCompare = (providedValue, expectedValue) => {
  if (typeof providedValue !== "string" || typeof expectedValue !== "string") {
    return false;
  }

  const provided = Buffer.from(providedValue);
  const expected = Buffer.from(expectedValue);

  if (provided.length !== expected.length) return false;

  return crypto.timingSafeEqual(provided, expected);
};

const isRateLimited = (req) => {
  const forwardedFor = req.headers["x-forwarded-for"];
  const ip = Array.isArray(forwardedFor)
    ? forwardedFor[0]
    : String(forwardedFor || req.ip || req.socket.remoteAddress || "unknown").split(",")[0];
  const key = ip.trim();
  const now = Date.now();
  const current = verifyAttempts.get(key);

  if (!current || now - current.startedAt > VERIFY_RATE_LIMIT_WINDOW_MS) {
    verifyAttempts.set(key, { count: 1, startedAt: now });
    return false;
  }

  current.count += 1;
  return current.count > VERIFY_RATE_LIMIT_MAX_ATTEMPTS;
};

const isValidTicketToken = (token) =>
  typeof token === "string" &&
  token.length > 0 &&
  token.length <= MAX_TICKET_TOKEN_LENGTH &&
  /^[A-Za-z0-9._~:-]+$/.test(token);

const extractTicketToken = (value) => {
  const rawToken = typeof value === "string" ? value.trim() : "";

  if (!rawToken) return "";
  if (rawToken.length > MAX_RAW_TOKEN_LENGTH) return "";

  try {
    const url = new URL(rawToken);
    return (
      url.searchParams.get("token") ||
      url.searchParams.get("qr_token") ||
      url.searchParams.get("ticket") ||
      rawToken
    ).trim();
  } catch {
    return rawToken;
  }
};

const buildSafeTicket = (ticket) => ({
  id: ticket.id,
  evento_id: ticket.evento_id,
  asiento_id: ticket.asiento_id,
  status: ticket.status,
  used_at: ticket.used_at,
});

app.post("/api/tickets/verify", async (req, res) => {
  const expectedAccessCode = process.env.VERIFIER_ACCESS_CODE;
  const { token } = req.body || {};
  const accessCode = req.get("X-Verifier-Access-Code") || req.body?.accessCode;

  if (isRateLimited(req)) {
    return res.status(429).json({
      status: "error",
      message: "Demasiados intentos de verificacion. Intenta de nuevo en un minuto.",
    });
  }

  if (!expectedAccessCode) {
    console.error("VERIFIER_ACCESS_CODE no está configurado.");
    return res.status(500).json({
      status: "error",
      message: "No se pudo verificar el boleto.",
    });
  }

  if (!safeCompare(accessCode, expectedAccessCode)) {
    return res.status(401).json({
      status: "error",
      message: "Código de acceso incorrecto.",
    });
  }

  const qrToken = extractTicketToken(token);

  if (!isValidTicketToken(qrToken)) {
    return res.status(400).json({
      status: "error",
      message: "No se pudo verificar el boleto.",
    });
  }

  try {
    const usedAt = new Date().toISOString();
    const safeColumns = "id, evento_id, asiento_id, status, used_at";

    const { data: updatedTicket, error: updateError } = await supabase
      .from("tickets")
      .update({ status: "used", used_at: usedAt })
      .eq("qr_token", qrToken)
      .eq("status", "valid")
      .select(safeColumns)
      .maybeSingle();

    if (updateError) throw updateError;

    if (updatedTicket) {
      return res.json({
        status: "valid",
        message: "Boleto válido. Acceso permitido.",
        ticket: buildSafeTicket(updatedTicket),
      });
    }

    const { data: existingTicket, error: selectError } = await supabase
      .from("tickets")
      .select(safeColumns)
      .eq("qr_token", qrToken)
      .maybeSingle();

    if (selectError) throw selectError;

    if (!existingTicket || existingTicket.status === "cancelled") {
      return res.json({
        status: "invalid",
        message: "Boleto inválido o no encontrado.",
      });
    }

    if (existingTicket.status === "used") {
      return res.json({
        status: "used",
        message: "Este boleto ya fue usado.",
        ticket: buildSafeTicket(existingTicket),
      });
    }

    return res.json({
      status: "invalid",
      message: "Boleto inválido o no encontrado.",
    });
  } catch (error) {
    console.error("Error al verificar boleto:", error.message);
    return res.status(500).json({
      status: "error",
      message: "No se pudo verificar el boleto.",
    });
  }
});

const MAX_WS_MESSAGE_LENGTH = 2048;
const allowedSeatStatuses = new Set(["available", "selected", "reserved", "occupied"]);

const sanitizeWsMessage = (message) => {
  const text = message.toString();

  if (text.length > MAX_WS_MESSAGE_LENGTH) return null;

  try {
    const data = JSON.parse(text);

    if (data?.type !== "seat_update" || typeof data.seat !== "object") {
      return null;
    }

    const seat = {
      id: String(data.seat.id || "").slice(0, 40),
      label: String(data.seat.label || "").slice(0, 20),
      status: String(data.seat.status || ""),
    };

    if (!seat.id || !seat.label || !allowedSeatStatuses.has(seat.status)) {
      return null;
    }

    return JSON.stringify({ type: "seat_update", seat });
  } catch {
    return text;
  }
};

// WebSocket
wss.on("connection", (ws) => {
  console.log("Cliente conectado al WebSocket");

  ws.on("message", (message) => {
    const sanitizedMessage = sanitizeWsMessage(message);

    if (!sanitizedMessage) {
      ws.send(JSON.stringify({ type: "error", message: "Mensaje WebSocket no valido." }));
      return;
    }

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(sanitizedMessage);
      }
    });
  });

  ws.on("close", () => {
    console.log("Cliente desconectado del WebSocket");
  });

  ws.on("error", (error) => {
    console.error("Error en WebSocket:", error.message);
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server on port ${PORT}`);
});
