const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 8080 });

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.send("Connection established with the server");

  ws.on("message", (message) => {
    const text = message.toString();
    console.log("Received:", text);
    ws.send(`Server received: ${text}`);
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

console.log("WebSocket server running on ws://localhost:8080");