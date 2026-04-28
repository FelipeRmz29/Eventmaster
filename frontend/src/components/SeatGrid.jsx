import Seat from "./Seat";

function SeatGrid({ grid, onSeatClick }) {
  if (!grid.length) {
    return <p className="empty-state">Aún no se ha generado un layout.</p>;
  }

  return (
    <div className="seat-grid-wrapper">
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