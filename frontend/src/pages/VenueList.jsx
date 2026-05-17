import { useEffect, useState } from "react";
import { Button, ButtonLink, Card, EmptyState, SectionHeader, StatCard } from "../components/ui.jsx";
import { eliminarRecinto as deleteRecinto, getRecintos } from "../services/api";

function VenueList() {
  const [venues, setVenues] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;

    getRecintos()
      .then((data) => {
        if (!isActive) return;
        setVenues(data);
        setStatus("ready");
      })
      .catch((requestError) => {
        if (!isActive) return;
        setError(requestError.message);
        setStatus("error");
      });

    return () => {
      isActive = false;
    };
  }, []);

  const handleDelete = async (id) => {
    setError("");

    try {
      await deleteRecinto(id);
      setVenues((current) => current.filter((venue) => venue.id !== id));
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <main className="page-container admin-page">
      <SectionHeader
        eyebrow="Inventario"
        title="Recintos"
        description="Recintos cargados desde backend."
        actions={<ButtonLink to="/admin/create">Crear recinto</ButtonLink>}
      />

      {status === "loading" && <p className="loading-state">Cargando recintos...</p>}
      {status === "error" && (
        <EmptyState title="No se pudieron cargar los recintos." description={error} />
      )}
      {status === "ready" && !venues.length && (
        <EmptyState
          title="No hay recintos registrados."
          description="Crea un recinto para generar asientos."
          action={<ButtonLink to="/admin/create">Crear recinto</ButtonLink>}
        />
      )}

      {venues.length > 0 && (
        <>
          <div className="metrics-grid">
            <StatCard label="Recintos" value={venues.length} helper="Registrados" />
            <StatCard
              label="Capacidad total"
              value={venues.reduce((total, venue) => total + Number(venue.capacidad || 0), 0)}
              helper="Asientos"
              tone="success"
            />
          </div>

          <Card className="venue-note">
            <div className="event-table">
              {venues.map((venue) => (
                <div key={venue.id} className="event-row">
                  <div>
                    <strong>{venue.nombre}</strong>
                    <span>{venue.direccion || "Sin direccion"}</span>
                  </div>
                  <span>{venue.capacidad || 0} asientos</span>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(venue.id)}>
                    Eliminar
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}

      {error && status !== "error" && <p className="form-note">{error}</p>}
    </main>
  );
}

export default VenueList;
