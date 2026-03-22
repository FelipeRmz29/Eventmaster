import { useEffect, useState } from "react";
import SeatGrid from "../components/SeatGrid";
import { loadMapFromLocalStorage } from "../data/storage";
import { connectSocket } from "../services/socket";

function BuyerView() {
  const [grid, setGrid] = useState(() => loadMapFromLocalStorage() || []);

  useEffect(() => {
    const socket = connectSocket();

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "seat_update") {
          setGrid((prevGrid) =>
            prevGrid.map((row) =>
              row.map((seat) =>
                seat.id === data.seat.id
                  ? { ...seat, status: data.seat.status }
                  : seat
              )
            )
          );
        }
      } catch (error) {
        console.error("Mensaje WebSocket no válido:", error);
      }
    };
  }, []);

  const handleSeatClick = (clickedSeat) => {
    if (clickedSeat.status === "occupied") return;

    const updatedSeat = {
      ...clickedSeat,
      status: clickedSeat.status === "available" ? "selected" : "available",
    };

    setGrid((prevGrid) =>
      prevGrid.map((row) =>
        row.map((seat) =>
          seat.id === clickedSeat.id ? updatedSeat : seat
        )
      )
    );

    const socket = connectSocket();

    if (socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          type: "seat_update",
          seat: updatedSeat,
        })
      );
    }
  };

  return (
    <div className="page-container">
      <div className="brand-block">
        <h1>
          Compra tus <span className="brand-highlight">boletos</span>
        </h1>
        <p>
          Selecciona tus asientos disponibles y vive una experiencia premium con
          EventMaster.
        </p>
      </div>

      <div className="form-card">
        <h2 className="section-title">Selecciona tus asientos</h2>
        <p className="section-subtitle">
          Elige tu lugar dentro del recinto en tiempo real.
        </p>

        <div className="venue-layout">
          <div className="stage-banner">ESCENARIO</div>
          <SeatGrid grid={grid} onSeatClick={handleSeatClick} />

          <div className="legend-row">
            <div className="legend-item">
              <span className="legend-color available"></span>
              Disponible
            </div>
            <div className="legend-item">
              <span className="legend-color selected"></span>
              Seleccionado
            </div>
            <div className="legend-item">
              <span className="legend-color occupied"></span>
              Ocupado
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BuyerView;