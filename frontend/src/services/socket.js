let socket = null;

const getSocketUrl = () => {
  const host = window.location.hostname;
  return `ws://${host}:3000`;
};

export const connectSocket = () => {
  if (!socket || socket.readyState === WebSocket.CLOSED) {
    socket = new WebSocket(getSocketUrl());
  }
  return socket;
};

export const getSocket = () => socket;