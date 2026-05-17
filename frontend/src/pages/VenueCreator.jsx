import { useMemo, useState } from "react";
import SeatGrid, { SeatLegend, SeatStats } from "../components/SeatGrid";
import { Button, ButtonLink, Card, Input, SectionHeader } from "../components/ui.jsx";
import { createRecinto } from "../services/api";

const buildPreviewGrid = (rows, cols) =>
  Array.from({ length: rows }, (_, rowIndex) =>
    Array.from({ length: cols }, (_, colIndex) => ({
      id: `${rowIndex}-${colIndex}`,
      label: `${String.fromCharCode(65 + rowIndex)}${colIndex + 1}`,
      status: "available",
    }))
  );

function VenueCreator() {
  const [form, setForm] = useState({
    nombre: "",
    direccion: "",
    filas: 6,
    columnas: 8,
    filasVIP: 0,
  });
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const grid = useMemo(
    () => buildPreviewGrid(Number(form.filas || 0), Number(form.columnas || 0)),
    [form.columnas, form.filas]
  );

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setStatus("");
    setError("");
  };

  const handleSave = async () => {
    setIsSaving(true);
    setStatus("");
    setError("");

    try {
      const recinto = await createRecinto({
        nombre: form.nombre.trim(),
        direccion: form.direccion.trim(),
        filas: Number(form.filas),
        columnas: Number(form.columnas),
        filasVIP: Number(form.filasVIP || 0),
      });

      setStatus(`Recinto creado: ${recinto.nombre}`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="page-container admin-page">
      <SectionHeader
        eyebrow="Recintos"
        title="Crear recinto"
        description="Crea el recinto y genera sus asientos en backend."
        actions={<ButtonLink to="/admin/venues" variant="ghost">Ver recintos</ButtonLink>}
      />

      <div className="creator-layout">
        <Card className="creator-controls">
          <h2>Configuracion</h2>
          <Input
            label="Nombre"
            value={form.nombre}
            onChange={(event) => updateField("nombre", event.target.value)}
            placeholder="Auditorio principal"
          />
          <Input
            label="Direccion"
            value={form.direccion}
            onChange={(event) => updateField("direccion", event.target.value)}
            placeholder="Direccion del recinto"
          />
          <div className="form-row">
            <Input
              label="Filas"
              type="number"
              min="1"
              max="26"
              value={form.filas}
              onChange={(event) => updateField("filas", event.target.value)}
            />
            <Input
              label="Columnas"
              type="number"
              min="1"
              max="24"
              value={form.columnas}
              onChange={(event) => updateField("columnas", event.target.value)}
            />
          </div>
          <Input
            label="Filas VIP"
            type="number"
            min="0"
            max={form.filas}
            value={form.filasVIP}
            onChange={(event) => updateField("filasVIP", event.target.value)}
          />

          <div className="button-group">
            <Button
              onClick={handleSave}
              loading={isSaving}
              disabled={isSaving || !form.nombre || !form.direccion}
            >
              Guardar recinto
            </Button>
          </div>
          {status && <p className="success-note">{status}</p>}
          {error && <p className="form-note">{error}</p>}
        </Card>

        <Card className="seat-map-card enhanced-seat-map-card">
          <div className="seat-map-topbar">
            <span className="seat-editor-mode">Vista previa</span>
            <SeatStats grid={grid} />
          </div>
          <div className="stage-banner">ESCENARIO</div>
          <SeatGrid grid={grid} editable />
          <SeatLegend />
        </Card>
      </div>
    </main>
  );
}

export default VenueCreator;
