import { useEffect, useState } from "react";
import SeatGrid from "../components/SeatGrid";
import { Button, ButtonLink, Card, Input, SectionHeader } from "../components/ui.jsx";
import { saveMapToLocalStorage, loadMapFromLocalStorage } from "../data/storage";
import { connectSocket } from "../services/socket";

function VenueCreator() {
  const [rows, setRows] = useState(6);
  const [cols, setCols] = useState(8);
  const [grid, setGrid] = useState(() => loadMapFromLocalStorage() || []);
  const [saveStatus, setSaveStatus] = useState("");

  useEffect(() => {
    const socket = connectSocket();

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "seat_update") {
          setGrid((prevGrid) =>
            prevGrid.map((row) =>
              row.map((seat) =>
                seat.id === data.seat.id ? { ...seat, status: data.seat.status } : seat
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
  }, []);

  const generateGrid = () => {
    const newGrid = [];

    for (let i = 0; i < rows; i += 1) {
      const row = [];

      for (let j = 0; j < cols; j += 1) {
        row.push({
          id: `${i}-${j}`,
          label: `${String.fromCharCode(65 + i)}${j + 1}`,
          status: "available",
        });
      }

      newGrid.push(row);
    }

    setGrid(newGrid);
    setSaveStatus("");
  };

  const handleSave = () => {
    saveMapToLocalStorage(grid);
    setSaveStatus("Configuración del recinto guardada correctamente.");
  };

  const handleSeatClick = (clickedSeat) => {
    if (clickedSeat.status === "occupied") return;

    const updatedSeat = {
      ...clickedSeat,
      status: clickedSeat.status === "available" ? "selected" : "available",
    };

    setGrid((prevGrid) =>
      prevGrid.map((row) =>
        row.map((seat) => (seat.id === clickedSeat.id ? updatedSeat : seat))
      )
    );

    const socket = connectSocket();

    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: "seat_update", seat: updatedSeat }));
    }
  };

  return (
    <main className="page-container admin-page">
      <SectionHeader
        eyebrow="Recintos"
        title="Diseñador de asientos"
        description="Define filas, columnas y disponibilidad visual para la experiencia de compra."
        actions={<ButtonLink to="/admin/venues" variant="ghost">Ver recintos</ButtonLink>}
      />

      <div className="creator-layout">
        <Card className="creator-controls">
          <h2>Configuración</h2>
          <div className="form-row">
            <Input
              label="Filas"
              type="number"
              min="1"
              value={rows}
              onChange={(event) => setRows(Number(event.target.value))}
            />
            <Input
              label="Columnas"
              type="number"
              min="1"
              value={cols}
              onChange={(event) => setCols(Number(event.target.value))}
            />
          </div>

          <div className="button-group">
            <Button onClick={generateGrid}>Generar layout</Button>
            <Button onClick={handleSave} variant="secondary" disabled={!grid.length}>
              Guardar configuración
            </Button>
          </div>
          {saveStatus && <p className="success-note">{saveStatus}</p>}
        </Card>

        <Card className="seat-map-card">
          <div className="stage-banner">ESCENARIO</div>
          <SeatGrid grid={grid} onSeatClick={handleSeatClick} />
          <div className="legend-row">
            <div className="legend-item"><span className="legend-color available" />Disponible</div>
            <div className="legend-item"><span className="legend-color selected" />Seleccionado</div>
            <div className="legend-item"><span className="legend-color occupied" />Ocupado</div>
            <div className="legend-item"><span className="legend-color reserved" />Reservado</div>
          </div>
        </Card>
      </div>
    </main>
  );
}

export default VenueCreator;
