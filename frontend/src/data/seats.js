export const SEAT_STATUS_LABELS = {
  available: "Disponible",
  selected: "En seleccion",
  reserved: "Reservado",
  occupied: "Ocupado",
};

export const EDITABLE_SEAT_STATUSES = [
  {
    value: "available",
    label: "Disponible",
    helper: "Libre",
  },
  {
    value: "reserved",
    label: "Reservado",
    helper: "Apartado",
  },
  {
    value: "occupied",
    label: "Ocupado",
    helper: "Vendido",
  },
];

export const normalizeSeatUpdate = (seat) => {
  if (!seat || typeof seat !== "object") return null;

  const status = String(seat.status || "available");

  if (!SEAT_STATUS_LABELS[status]) return null;

  return {
    id: String(seat.id || ""),
    label: String(seat.label || ""),
    status,
    lockedBy: status === "selected" ? String(seat.lockedBy || "") : undefined,
  };
};

export const applySeatUpdates = (grid, updates) => {
  const normalizedUpdates = updates.map(normalizeSeatUpdate).filter(Boolean);

  if (!normalizedUpdates.length) return grid;

  const updateMap = new Map(normalizedUpdates.map((seat) => [seat.id, seat]));

  return grid.map((row) =>
    row.map((seat) => {
      const updatedSeat = updateMap.get(seat.id);

      if (!updatedSeat) return seat;

      return {
        ...seat,
        status: updatedSeat.status,
        lockedBy: updatedSeat.lockedBy,
      };
    })
  );
};

export const createSocketSeat = (seat) => ({
  id: seat.id,
  label: seat.label,
  status: seat.status,
  lockedBy: seat.status === "selected" ? seat.lockedBy : undefined,
});

export const isSeatOwnedByClient = (seat, clientId) =>
  seat.status === "selected" && Boolean(clientId) && seat.lockedBy === clientId;

export const isSeatLockedForClient = (seat, clientId) =>
  seat.status === "occupied" ||
  seat.status === "reserved" ||
  (seat.status === "selected" && seat.lockedBy !== clientId);

export const getSeatLabel = (seat, clientId) => {
  if (isSeatOwnedByClient(seat, clientId)) return "Tu seleccion";
  return SEAT_STATUS_LABELS[seat.status] || SEAT_STATUS_LABELS.available;
};

export const cleanSeatLayoutForStorage = (grid) =>
  grid.map((row) =>
    row.map((seat) => {
      const cleanSeat = { ...seat };
      delete cleanSeat.lockedBy;

      return {
        ...cleanSeat,
        status: cleanSeat.status === "selected" ? "available" : cleanSeat.status,
      };
    })
  );
