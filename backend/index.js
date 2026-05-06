require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const WebSocket = require("ws");
const supabase = require("./src/services/supabase");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Prueba de conexión a Supabase
supabase
  .from("usuarios")
  .select("*")
  .limit(1)
  .then(({ error }) => {
    if (error) console.error("Error de conexión:", error.message);
    else console.log("Supabase conectado ✓");
  });

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "EventMaster API running" });
});

const extractTicketToken = (value) => {
  const rawToken = typeof value === "string" ? value.trim() : "";

  if (!rawToken) return "";

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
  const { token, accessCode } = req.body || {};

  if (!expectedAccessCode) {
    console.error("VERIFIER_ACCESS_CODE no está configurado.");
    return res.status(500).json({
      status: "error",
      message: "No se pudo verificar el boleto.",
    });
  }

  if (accessCode !== expectedAccessCode) {
    return res.status(401).json({
      status: "error",
      message: "Código de acceso incorrecto.",
    });
  }

  const qrToken = extractTicketToken(token);

  if (!qrToken) {
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

// WebSocket
wss.on("connection", (ws) => {
  console.log("Cliente conectado al WebSocket");

  ws.on("message", (message) => {
    console.log("Mensaje recibido:", message.toString());

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message.toString());
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
