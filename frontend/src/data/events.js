export const events = [
  {
    id: "em-101",
    slug: "summit-tecnologia-2026",
    title: "EventMaster Tech Summit",
    category: "Conferencia",
    image: "/events/summit-tecnologia-2026.png",
    dateLabel: "18 May 2026",
    timeLabel: "19:00",
    venue: "Auditorio Central",
    city: "Ciudad de Mexico",
    priceFrom: 650,
    status: "Disponible",
    availability: "Alta",
    description:
      "Una noche de charlas, demos y networking para equipos que construyen experiencias digitales de alto volumen.",
  },
  {
    id: "em-204",
    slug: "neon-nights-live",
    title: "Neon Nights Live",
    category: "Concierto",
    image: "/events/neon-nights-live.png",
    dateLabel: "24 May 2026",
    timeLabel: "21:00",
    venue: "Foro Norte",
    city: "Monterrey",
    priceFrom: 890,
    status: "Ultimos lugares",
    availability: "Media",
    description:
      "Produccion inmersiva, audio envolvente y acceso digital para una experiencia de concierto sin friccion.",
  },
  {
    id: "em-318",
    slug: "final-universitaria",
    title: "Final Universitaria",
    category: "Deportes",
    image: "/events/final-universitaria.png",
    dateLabel: "31 May 2026",
    timeLabel: "17:30",
    venue: "Estadio Metropolitano",
    city: "Guadalajara",
    priceFrom: 420,
    status: "Disponible",
    availability: "Alta",
    description:
      "Acceso rapido por QR y seleccion de asientos en vivo para el partido mas esperado de la temporada.",
  },
  {
    id: "em-422",
    slug: "festival-aurora",
    title: "Festival Aurora",
    category: "Festival",
    image: "/events/festival-aurora.png",
    dateLabel: "07 Jun 2026",
    timeLabel: "16:00",
    venue: "Parque Bicentenario",
    city: "Puebla",
    priceFrom: 740,
    status: "Preventa",
    availability: "Alta",
    description:
      "Un dia completo de musica, food trucks y activaciones con boletos digitales listos para celular.",
  },
];

export const getEventBySlug = (slug) =>
  events.find((event) => event.slug === slug) || events[0];

export const formatCurrency = (value) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(value);

export const createDefaultSeatGrid = () => {
  const occupiedSeats = new Set(["0-4", "0-5", "1-2", "2-7", "3-1", "5-8"]);
  const reservedSeats = new Set(["1-7", "2-2", "4-5", "6-3"]);

  return Array.from({ length: 8 }, (_, rowIndex) =>
    Array.from({ length: 10 }, (_, colIndex) => {
      const id = `${rowIndex}-${colIndex}`;

      return {
        id,
        label: `${String.fromCharCode(65 + rowIndex)}${colIndex + 1}`,
        status: occupiedSeats.has(id)
          ? "occupied"
          : reservedSeats.has(id)
            ? "reserved"
            : "available",
      };
    })
  );
};
