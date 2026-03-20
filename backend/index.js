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