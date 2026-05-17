import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Badge, Card, EmptyState, SectionHeader } from "../components/ui.jsx";
import { normalizeEvents } from "../data/events";
import { getEventos } from "../services/api";

function AdminEventos() {
  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    getEventos()
      .then((data) => {
        setEvents(normalizeEvents(data));
        setStatus("ready");
      })
      .catch((requestError) => {
        setError(requestError.message);
        setStatus("error");
      });
  }, []);

  return (
    <main className="page-container admin-page">
      <SectionHeader
        eyebrow="Admin"
        title="Eventos"
        description="Listado conectado a la tabla eventos del backend."
      />

      {status === "loading" && <p className="loading-state">Cargando eventos...</p>}
      {status === "error" && (
        <EmptyState title="No se pudieron cargar los eventos." description={error} />
      )}
      {status === "ready" && !events.length && (
        <EmptyState title="No hay eventos registrados." description="Agrega eventos desde backend." />
      )}

      {events.length > 0 && (
        <Card className="admin-table-card">
          <div className="event-table">
            {events.map((event) => (
              <Link key={event.id} to={`/events/${event.id}`} className="event-row">
                <div>
                  <strong>{event.title}</strong>
                  <span>{event.venue} - {event.dateLabel}</span>
                </div>
                <Badge tone="info">{event.status}</Badge>
                <span>{event.id}</span>
              </Link>
            ))}
          </div>
        </Card>
      )}
    </main>
  );
}

export default AdminEventos;
