const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;

  const protocol = window.location.protocol === "https:" ? "https:" : "http:";
  return `${protocol}//${window.location.hostname}:3000`;
};

const buildHeaders = () => {
  const token = localStorage.getItem("adminToken");
  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

const request = async (path, options = {}) => {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...options,
    headers: {
      ...buildHeaders(),
      ...options.headers,
    },
  });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error || data?.message || "No se pudo completar la solicitud.");
  }

  return data;
};

export const loginAdmin = ({ email, password }) =>
  request("/api/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

export const getEventos = () => request("/eventos");

export const getEvento = (id) => request(`/eventos/${id}`);

export const getAsientos = (recintoId) => request(`/asientos/${recintoId}`);

export const getRecintos = () => request("/recintos");

export const createRecinto = (recinto) =>
  request("/recintos", {
    method: "POST",
    body: JSON.stringify(recinto),
  });

export const deleteRecinto = (id) =>
  request(`/recintos/${id}`, {
    method: "DELETE",
  });

export const confirmarTicket = (ticket) =>
  request("/tickets/confirmar", {
    method: "POST",
    body: JSON.stringify(ticket),
  });
