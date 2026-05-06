function Seat({ seat, onClick }) {
  const getClassByStatus = () => {
    if (seat.status === "occupied") return "seat occupied seat-occupied";
    if (seat.status === "reserved") return "seat reserved seat-reserved";
    if (seat.status === "selected") return "seat selected seat-selected";
    return "seat available seat-available";
  };

  const isLocked = seat.status === "occupied" || seat.status === "reserved";

  return (
    <button
      className={getClassByStatus()}
      onClick={() => onClick(seat)}
      disabled={isLocked}
      title={`Asiento ${seat.label} - ${seat.status}`}
    >
      {seat.label}
    </button>
  );
}

export default Seat;
