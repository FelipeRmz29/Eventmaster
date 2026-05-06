const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;

  const protocol = window.location.protocol === "https:" ? "https:" : "http:";
  return `${protocol}//${window.location.hostname}:3000`;
};

export const verifyTicket = async (token, accessCode) => {
  const cleanToken = typeof token === "string" ? token.trim() : "";
  const cleanAccessCode = typeof accessCode === "string" ? accessCode.trim() : "";
  let response;

  if (!cleanToken || cleanToken.length > 2048) {
    throw new Error("El codigo QR no tiene un formato valido.");
  }

  try {
    response = await fetch(`${getApiBaseUrl()}/api/tickets/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Verifier-Access-Code": cleanAccessCode,
      },
      body: JSON.stringify({ token: cleanToken }),
    });
  } catch {
    throw new Error("No se pudo conectar con el servidor de verificacion.");
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
