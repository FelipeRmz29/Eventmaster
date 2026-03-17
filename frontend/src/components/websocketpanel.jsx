import { useEffect, useRef, useState } from "react";

export default function WebSocketPanel() {
  const socketRef = useRef(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState("Connecting...");

  useEffect(() => {
    const socket = new window.WebSocket("ws://localhost:8080");
    socketRef.current = socket;

    socket.onopen = () => setStatus("Online");
    socket.onmessage = (event) => {
      setMessages((prev) => [
        ...prev,
        { type: "received", text: event.data },
      ]);
    };

    socket.onerror = () => setStatus("Error");
    socket.onclose = () => setStatus("Offline");

    return () => socket.close();
  }, []);

  const sendMessage = () => {
    if (!message.trim()) return;

    socketRef.current.send(message);

    setMessages((prev) => [
      ...prev,
      { type: "sent", text: message },
    ]);

    setMessage("");
  };

  return (
    <section className="rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
      
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
        <h3 className="font-semibold">💬 Soporte en vivo</h3>
        <span className="text-xs text-emerald-400">{status}</span>
      </div>

      {/* CHAT */}
      <div className="h-64 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 && (
          <p className="text-xs text-slate-500">
            Sin mensajes aún...
          </p>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
              msg.type === "sent"
                ? "ml-auto bg-blue-600"
                : "bg-slate-800"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      {/* INPUT */}
      <div className="flex gap-2 border-t border-slate-800 p-3">
        <input
          className="flex-1 rounded-lg bg-slate-800 px-3 py-2 text-sm outline-none"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Escribe un mensaje..."
        />

        <button
          onClick={sendMessage}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm hover:bg-blue-700"
        >
          Enviar
        </button>
      </div>
    </section>
  );
}