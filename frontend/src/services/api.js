const API_BASE = 'http://localhost:3000';

const authHeaders = () => {
  const token = localStorage.getItem('adminToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// ── Eventos (públicos) ────────────────────────────────────
export const getEventos = async () => {
  const res = await fetch(`${API_BASE}/eventos`);
  if (!res.ok) throw new Error('Error al cargar eventos');
  return res.json();
};

export const getEventoPorId = async (id) => {
  const res = await fetch(`${API_BASE}/eventos/${id}`);
  if (!res.ok) throw new Error('Evento no encontrado');
  return res.json();
};

// ── Eventos (admin) ───────────────────────────────────────
export const getEventosAdmin = async () => {
  const res = await fetch(`${API_BASE}/eventos/admin/all`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Error al cargar eventos');
  return res.json();
};

export const actualizarEvento = async (id, cambios) => {
  const res = await fetch(`${API_BASE}/eventos/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(cambios),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al actualizar evento');
  return data;
};

export const crearEvento = async ({ nombre, fecha, recinto_id }) => {
  const res = await fetch(`${API_BASE}/eventos`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ nombre, fecha, recinto_id }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al crear evento');
  return data;
};

export const eliminarEvento = async (id) => {
  const res = await fetch(`${API_BASE}/eventos/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Error al eliminar evento');
  }
  return res.json();
};

// ── Recintos ──────────────────────────────────────────────
export const getRecintos = async () => {
  const res = await fetch(`${API_BASE}/recintos`);
  if (!res.ok) throw new Error('Error al cargar recintos');
  return res.json();
};

export const crearRecinto = async ({ nombre, direccion, filas, columnas, filasVIP, precio_general, precio_vip }) => {
  const res = await fetch(`${API_BASE}/recintos`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ nombre, direccion, filas, columnas, filasVIP, precio_general, precio_vip }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al crear recinto');
  return data;
};

export const eliminarRecinto = async (id) => {
  const res = await fetch(`${API_BASE}/recintos/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Error al eliminar recinto');
  }
  return res.json();
};

// ── Asientos ──────────────────────────────────────────────
export const getAsientosPorRecinto = async (recintoId) => {
  const res = await fetch(`${API_BASE}/asientos/${recintoId}`);
  if (!res.ok) throw new Error('Error al cargar asientos');
  return res.json();
};

// ── Tickets ───────────────────────────────────────────────
// asientos: [{ asiento_id, precio }] — máximo 2
export const confirmarCompra = async ({ nombre, email, evento_id, asientos }) => {
  const res = await fetch(`${API_BASE}/tickets/confirmar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, email, evento_id, asientos }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Error al procesar la compra');
  }

  const ticketIds = res.headers.get('X-Ticket-Ids');
  const referenciaPago = res.headers.get('X-Referencia-Pago');
  const blob = await res.blob();
  return { blob, ticketIds, referenciaPago };
};
