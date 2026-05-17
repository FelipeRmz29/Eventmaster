import { useEffect, useMemo, useState } from "react";
import SeatGrid, { SeatLegend, SeatStats } from "../components/SeatGrid";
import { Button, ButtonLink, Card, Input, SectionHeader } from "../components/ui.jsx";
import { loadMapFromLocalStorage, saveMapToLocalStorage } from "../data/storage";
import { connectSocket, getClientId, sendSocketMessage } from "../services/socket";
import {
  EDITABLE_SEAT_STATUSES,
  applySeatUpdates,
  cleanSeatLayoutForStorage,
  createSocketSeat,
} from "../data/seats";

function VenueCreator() {
  const savedGrid = useMemo(() => loadMapFromLocalStorage(), []);
  const [clientId] = useState(() => getClientId());
  const [rows, setRows] = useState(savedGrid?.length || 6);
  const [cols, setCols] = useState(savedGrid?.[0]?.length || 8);
  const [grid, setGrid] = useState(() => savedGrid || []);
  const [paintStatus, setPaintStatus] = useState("available");
  const [saveStatus, setSaveStatus] = useState("");
  const activeStatusLabel =
    EDITABLE_SEAT_STATUSES.find((status) => status.value === paintStatus)?.label || "Disponible";

  useEffect(() => {
    const socket = connectSocket();

    const handleSocketMessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "seat_update") {
          setGrid((prevGrid) => applySeatUpdates(prevGrid, [data.seat]));
        }

        if (data.type === "seat_snapshot" && Array.isArray(data.seats)) {
          setGrid((prevGrid) => applySeatUpdates(prevGrid, data.seats));
        }
      } catch (error) {
        console.error("Mensaje WebSocket no valido:", error);
      }
    };

    socket.addEventListener("message", handleSocketMessage);

    return () => {
      socket.removeEventListener("message", handleSocketMessage);
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
    const cleanGrid = cleanSeatLayoutForStorage(grid);

    saveMapToLocalStorage(cleanGrid);
    setGrid(cleanGrid);
    setSaveStatus("Configuracion del recinto guardada correctamente.");
  };

  const handleSeatClick = (clickedSeat) => {
    const nextStatus =
      clickedSeat.status === paintStatus && paintStatus !== "available"
        ? "available"
        : paintStatus;
    const updatedSeat = {
      ...clickedSeat,
      status: nextStatus,
      lockedBy: undefined,
    };

    setGrid((prevGrid) => applySeatUpdates(prevGrid, [updatedSeat]));
    sendSocketMessage({ type: "seat_update", seat: createSocketSeat(updatedSeat) });
    setSaveStatus("");
  };

  return (
    <main className="page-container admin-page">
      <SectionHeader
        eyebrow="Recintos"
        title="Disenador de asientos"
        description="Define filas, columnas y disponibilidad visual para la experiencia de compra."
        actions={<ButtonLink to="/admin/venues" variant="ghost">Ver recintos</ButtonLink>}
      />

      <div className="creator-layout">
        <Card className="creator-controls">
          <h2>Configuracion</h2>
          <div className="form-row">
            <Input
              label="Filas"
              type="number"
              min="1"
              max="26"
              value={rows}
              onChange={(event) => setRows(Number(event.target.value))}
            />
            <Input
              label="Columnas"
              type="number"
              min="1"
              max="24"
              value={cols}
              onChange={(event) => setCols(Number(event.target.value))}
            />
          </div>

          <div className="seat-toolbox" role="group" aria-label="Estado para pintar butacas">
            {EDITABLE_SEAT_STATUSES.map((status) => (
              <button
                key={status.value}
                type="button"
                className={`seat-tool seat-tool-${status.value} ${
                  paintStatus === status.value ? "active" : ""
                }`}
                onClick={() => setPaintStatus(status.value)}
              >
                <span className="seat-tool-swatch" aria-hidden="true" />
                <strong>{status.label}</strong>
                <small>{status.helper}</small>
              </button>
            ))}
          </div>

          <div className="button-group">
            <Button onClick={generateGrid}>Generar mapa</Button>
            <Button onClick={handleSave} variant="secondary" disabled={!grid.length}>
              Guardar configuracion
            </Button>
          </div>
          {saveStatus && <p className="success-note">{saveStatus}</p>}
        </Card>

        <Card className="seat-map-card enhanced-seat-map-card">
          <div className="seat-map-topbar">
            <span className="seat-editor-mode">Pintando: {activeStatusLabel}</span>
            <SeatStats grid={grid} />
          </div>
          <div className="stage-banner">ESCENARIO</div>
          <SeatGrid
            grid={grid}
            onSeatClick={handleSeatClick}
            clientId={clientId}
            editable
          />
          <SeatLegend />
        </Card>
      </div>
    </main>
  );
}

export default VenueCreator;
