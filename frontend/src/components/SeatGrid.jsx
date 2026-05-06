import Seat from "./Seat";
import { EmptyState } from "./ui.jsx";

function SeatGrid({ grid, onSeatClick }) {
  if (!grid.length) {
    return (
      <EmptyState
        title="Aún no hay layout."
        description="Genera un mapa para visualizar los asientos del recinto."
      />
    );
  }

  return (
    <div className="seat-grid-wrapper" aria-label="Mapa de asientos">
      {grid.map((row, rowIndex) => (
        <div key={rowIndex} className="seat-row">
          {row.map((seat) => (
            <Seat key={seat.id} seat={seat} onClick={onSeatClick} />
          ))}
        </div>
      ))}
    </div>
  );
}

export default SeatGrid;
