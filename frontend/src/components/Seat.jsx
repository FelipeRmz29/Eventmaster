import {
  getSeatLabel,
  isSeatLockedForClient,
  isSeatOwnedByClient,
} from "../data/seats";

function Seat({ seat, onClick, clientId, editable = false }) {
  const isOwnSelection = isSeatOwnedByClient(seat, clientId);
  const isLocked = !editable && isSeatLockedForClient(seat, clientId);
  const statusLabel = getSeatLabel(seat, clientId);
  const zona = (seat.zona || seat.zone || "").toLowerCase();
  const className = [
    "seat",
    seat.status,
    `seat-${seat.status}`,
    zona ? `seat-zona-${zona}` : "",
    isOwnSelection ? "seat-owned" : "",
    isLocked ? "seat-locked" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      className={className}
      onClick={() => onClick?.(seat)}
      disabled={isLocked}
      aria-label={`Asiento ${seat.label} - ${statusLabel}`}
      aria-pressed={isOwnSelection}
      title={`Asiento ${seat.label} - ${statusLabel}`}
    >
      <span className="seat-chair-back" aria-hidden="true" />
      <span className="seat-chair-cushion">
        <span className="seat-label">{seat.label}</span>
      </span>
      <span className="seat-chair-base" aria-hidden="true" />
      <span className="seat-status-dot" aria-hidden="true" />
    </button>
  );
}

export default Seat;
