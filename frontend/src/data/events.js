const FALLBACK_EVENT_IMAGE = "/hero/eventmaster-hero.jpg";

const formatDate = (value) => {
  if (!value) return "Fecha por confirmar";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const formatTime = (value) => {
  if (!value) return "Hora por confirmar";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export const normalizeEvent = (event) => {
  const recinto = event.recintos || event.recinto || {};
  const eventDate = event.fecha || event.date || event.created_at;
  const title = event.nombre || event.title || "Evento sin nombre";

  return {
    id: event.id,
    slug: String(event.id),
    title,
    category: event.categoria || event.category || "Evento",
    image: event.imagen_url || event.image || FALLBACK_EVENT_IMAGE,
    dateLabel: formatDate(eventDate),
    timeLabel: formatTime(eventDate),
    venue: recinto.nombre || event.venue || "Recinto por confirmar",
    city: recinto.direccion || event.city || "",
    recintoId: event.recinto_id || event.recintoId || recinto.id,
    priceFrom: Number(event.precio || event.precio_base || event.priceFrom || 0),
    status: event.estado || event.status || "Disponible",
    availability: event.disponibilidad || event.availability || "Disponible",
    description:
      event.descripcion ||
      event.description ||
      `${title} en ${recinto.nombre || "recinto por confirmar"}.`,
    raw: event,
  };
};

export const normalizeEvents = (events = []) => events.map(normalizeEvent);

export const formatCurrency = (value) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
