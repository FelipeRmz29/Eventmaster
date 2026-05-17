const getApiBaseUrl = () => import.meta.env.VITE_API_URL ?? '';

// Mapeo de respuesta del backend al formato que usa TicketVerifier
const mapResultado = (data) => {
  if (data.resultado === 'VALIDO') {
    return { status: 'valid', ticket: data.ticket };
  }
  if (data.resultado === 'YA_USADO') {
    const cuando = data.usado_en
      ? new Date(data.usado_en).toLocaleString('es-MX')
      : 'fecha desconocida';
    return {
      status: 'used',
      message: `Este boleto ya fue usado el ${cuando}.`,
      ticket: data.ticket,
    };
  }
  return { status: 'invalid' };
};

export const verifyTicket = async (tokenQR) => {
  if (!tokenQR || tokenQR.length > 2048) {
    throw new Error('El código QR no tiene un formato válido.');
  }

  const adminToken = localStorage.getItem('adminToken');
  if (!adminToken) {
    throw new Error('No hay sesión activa. Inicia sesión como admin primero.');
  }

  let response;
  try {
    response = await fetch(`${getApiBaseUrl()}/tickets/validar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ ticket_id: tokenQR.trim() }),
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor.');
  }

  const data = await response.json().catch(() => null);

  if (response.status === 401) {
    throw new Error('Sesión expirada. Vuelve a iniciar sesión.');
  }
  if (!response.ok) {
    throw new Error(data?.error || 'No se pudo verificar el boleto.');
  }

  return mapResultado(data);
};
