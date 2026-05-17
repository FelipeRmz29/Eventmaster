import Seat from "./Seat";
import { EmptyState } from "./ui.jsx";

function SeatGrid({ grid, onSeatClick, clientId, editable = false }) {
  if (!grid.length) {
    return (
      <EmptyState
        title="Aun no hay layout."
        description="Genera un mapa para visualizar los asientos del recinto."
      />
    );
  }

  return (
    <div className="seat-map-viewport">
      <div className="seat-grid-wrapper" aria-label="Mapa de asientos">
        {grid.map((row, rowIndex) => (
          <div key={rowIndex} className="seat-row-shell">
            <span className="seat-row-label">{String.fromCharCode(65 + rowIndex)}</span>
            <div className="seat-row">
              {row.map((seat) => (
                <Seat
                  key={seat.id}
                  seat={seat}
                  onClick={onSeatClick}
                  clientId={clientId}
                  editable={editable}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SeatLegend() {
  return (
    <div className="legend-row">
      <div className="legend-item">
        <span className="legend-color available" />
        Disponible
      </div>
      <div className="legend-item">
        <span className="legend-color selected" />
        En seleccion
      </div>
      <div className="legend-item">
        <span className="legend-color occupied" />
        Ocupado
      </div>
      <div className="legend-item">
        <span className="legend-color reserved" />
        Reservado
      </div>
    </div>
  );
}

export function SeatStats({ grid }) {
  const seats = grid.flat();
  const stats = [
    ["Disponibles", seats.filter((seat) => seat.status === "available").length, "available"],
    ["En seleccion", seats.filter((seat) => seat.status === "selected").length, "selected"],
    ["Reservados", seats.filter((seat) => seat.status === "reserved").length, "reserved"],
    ["Ocupados", seats.filter((seat) => seat.status === "occupied").length, "occupied"],
  ];

  return (
    <div className="seat-stats-strip">
      {stats.map(([label, value, status]) => (
        <div key={status} className={`seat-stat seat-stat-${status}`}>
          <span>{label}</span>
          <strong>{value}</strong>
        </div>
      ))}
    </div>
  );
}

export default SeatGrid;
