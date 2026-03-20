import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SeatGrid from "../components/SeatGrid";
import {
  saveMapToLocalStorage,
  loadMapFromLocalStorage,
} from "../data/storage";
import { connectSocket } from "../services/socket";

function VenueCreator() {
  const [rows, setRows] = useState(6);
  const [cols, setCols] = useState(8);
  const [grid, setGrid] = useState(() => loadMapFromLocalStorage() || []);

  useEffect(() => {
    const socket = connectSocket();

    socket.onopen = () => {
      console.log("Conectado al WebSocket");
    };

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

    socket.onerror = () => {
      console.error("Error en WebSocket");
    };

    socket.onclose = () => {
      console.log("WebSocket desconectado");
    };
  }, []);

  const generateGrid = () => {
    const newGrid = [];

    for (let i = 0; i < rows; i++) {
      const row = [];

      for (let j = 0; j < cols; j++) {
        row.push({
          id: `${i}-${j}`,
          label: `${String.fromCharCode(65 + i)}${j + 1}`,
          status: "available",
        });
      }

      newGrid.push(row);
    }

    setGrid(newGrid);
  };

  const handleSave = () => {
    saveMapToLocalStorage(grid);
    alert("Configuración del recinto guardada correctamente.");
  };

  const handleSeatClick = (clickedSeat) => {
    if (clickedSeat.status === "occupied") return;

    const newStatus =
      clickedSeat.status === "available" ? "selected" : "available";

    const updatedSeat = {
      ...clickedSeat,
      status: newStatus,
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
          Diseñador de <span className="brand-highlight">recintos</span>
        </h1>
        <p>
          Configura el layout de asientos para ofrecer una experiencia de compra
          profesional en EventMaster.
        </p>
      </div>

      <div className="form-card">
        <h2 className="section-title">Configuración del venue</h2>
        <p className="section-subtitle">
          Define el tamaño del recinto y genera el mapa visual de asientos.
        </p>

        <div className="form-row">
          <div className="form-group">
            <label>Filas</label>
            <input
              type="number"
              min="1"
              value={rows}
              onChange={(e) => setRows(Number(e.target.value))}
            />
          </div>

          <div className="form-group">
            <label>Columnas</label>
            <input
              type="number"
              min="1"
              value={cols}
              onChange={(e) => setCols(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="button-group">
          <button className="main-button" onClick={generateGrid}>
            Generar layout
          </button>

          <button className="main-button secondary" onClick={handleSave}>
            Guardar configuración
          </button>

          <Link to="/admin/venues" className="main-button ghost">
            Ver recintos
          </Link>
        </div>

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

export default VenueCreator;