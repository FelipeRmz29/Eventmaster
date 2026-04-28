function Seat({ seat, onClick }) {
  const getClassByStatus = () => {
    if (seat.status === "occupied") return "seat occupied";
    if (seat.status === "selected") return "seat selected";
    return "seat available";
  };

  return (
    <button className={getClassByStatus()} onClick={() => onClick(seat)}>
      {seat.label}
    </button>
  );
}

export default Seat;