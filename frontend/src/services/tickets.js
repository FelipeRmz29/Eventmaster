const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;

  const protocol = window.location.protocol === "https:" ? "https:" : "http:";
  return `${protocol}//${window.location.hostname}:3000`;
};

export const verifyTicket = async (token, accessCode) => {
  let response;

  try {
    response = await fetch(`${getApiBaseUrl()}/api/tickets/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, accessCode }),
    });
  } catch {
    throw new Error("No se pudo conectar con el servidor de verificación.");
  }

  const data = await response.json().catch(() => ({
    status: "error",
    message: "No se pudo verificar el boleto.",
  }));

  if (!response.ok) {
    throw new Error(data.message || "No se pudo verificar el boleto.");
  }

  return data;
};
