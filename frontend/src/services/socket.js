let socket = null;
const pendingMessages = [];

const getSocketUrl = () => {
  const host = window.location.hostname;
  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  return `${protocol}://${host}:3000`;
};

const createClientId = () => {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `client-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const flushPendingMessages = () => {
  while (socket?.readyState === WebSocket.OPEN && pendingMessages.length) {
    socket.send(pendingMessages.shift());
  }
};

export const connectSocket = () => {
  if (!socket || socket.readyState === WebSocket.CLOSED || socket.readyState === WebSocket.CLOSING) {
    socket = new WebSocket(getSocketUrl());
    socket.addEventListener("open", flushPendingMessages);
  }

  return socket;
};

export const getSocket = () => socket;

export const getClientId = () => {
  const savedClientId = sessionStorage.getItem("eventmaster_client_id");

  if (savedClientId) return savedClientId;

  const nextClientId = createClientId();
  sessionStorage.setItem("eventmaster_client_id", nextClientId);
  return nextClientId;
};

export const sendSocketMessage = (message) => {
  const activeSocket = connectSocket();
  const payload = typeof message === "string" ? message : JSON.stringify(message);

  if (activeSocket.readyState === WebSocket.OPEN) {
    activeSocket.send(payload);
    return;
  }

  pendingMessages.push(payload);
};
