const WebSocket = require("ws");

const MAX_MESSAGE_LENGTH = 2048;
const wss = new WebSocket.Server({
  host: "127.0.0.1",
  port: 8080,
});

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.send("Connection established with the server");

  ws.on("message", (message) => {
    const text = message.toString();

    if (text.length > MAX_MESSAGE_LENGTH) {
      ws.send("Message too large");
      return;
    }

    ws.send(`Server received: ${text}`);
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

console.log("WebSocket server running on ws://127.0.0.1:8080");
