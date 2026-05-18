import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Badge, ButtonLink, Card, EmptyState, SectionHeader } from "../components/ui.jsx";
import { normalizeEvents } from "../data/events";
import { getEventos, getRecintos } from "../services/api";

function AdminPanel() {
  const [events, setEvents] = useState([]);
  const [venues, setVenues] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getEventos(), getRecintos()])
      .then(([eventsData, venuesData]) => {
        setEvents(normalizeEvents(eventsData));
        setVenues(venuesData);
      })
      .catch((requestError) => {
        setError(requestError.message);
      });
  }, []);

  return (
    <main className="page-container admin-page">
      <div className="admin-shell">
        <aside className="admin-sidebar">
          <img src="/brand/logo-eventmaster-white.svg" alt="EventMaster" />
          <nav>
            <Link to="/admin" className="active">Overview</Link>
            <Link to="/admin/eventos">Eventos</Link>
            <Link to="/admin/venues">Recintos</Link>
            <Link to="/verificar">Verificar QR</Link>
          </nav>
        </aside>

        <section className="admin-content">
          <SectionHeader
            eyebrow="Admin"
            title="Centro de control EventMaster"
            description="Opera eventos, recintos y accesos."
            actions={<ButtonLink to="/verificar">Verificar QR</ButtonLink>}
          />

          {error && <EmptyState title="No se pudieron cargar los datos." description={error} />}

          <div className="admin-layout">
            <Card className="admin-table-card">
              <div className="table-header">
                <div>
                  <h2>Eventos registrados</h2>
                  <p>{events.length} eventos conectados al backend.</p>
                </div>
                <ButtonLink to="/admin/eventos" size="sm">Ver eventos</ButtonLink>
              </div>

              <div className="event-table">
                {events.slice(0, 5).map((event) => (
                  <Link key={event.id} to={`/events/${event.id}`} className="event-row">
                    <div>
                      <strong>{event.title}</strong>
                      <span>{event.venue} - {event.dateLabel}</span>
                    </div>
                    <Badge tone="info">{event.status}</Badge>
                    <span>{event.id}</span>
                  </Link>
                ))}
                {!events.length && <p className="loading-state">Sin eventos registrados.</p>}
              </div>
            </Card>

            <Card className="admin-actions-card">
              <h2>Accesos rapidos</h2>
              <p>{venues.length} recintos registrados.</p>
              <ButtonLink to="/admin/create">Crear recinto</ButtonLink>
              <ButtonLink to="/admin/venues" variant="secondary">Ver recintos</ButtonLink>
            </Card>
          </div>
        </section>
      </div>
    </main>
  );
}

export default AdminPanel;
