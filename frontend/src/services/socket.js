let socket = null;

export const connectSocket = () => {
  if (!socket) {
    socket = new WebSocket("ws://localhost:3000");
  }
  return socket;
};

export const getSocket = () => socket;