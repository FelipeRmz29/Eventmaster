import { Link } from "react-router-dom";
import { Badge, ButtonLink, Card, SectionHeader, StatCard } from "../components/ui.jsx";
import { events, formatCurrency } from "../data/events";
import { loadMapFromLocalStorage } from "../data/storage";

function AdminPanel() {
  const map = loadMapFromLocalStorage();
  const totalSeats = map ? map.length * (map[0]?.length || 0) : 80;
  const occupiedSeats = map
    ? map.flat().filter((seat) => seat.status === "occupied").length
    : 18;
  const estimatedRevenue = events.reduce((total, event) => total + event.priceFrom * 42, 0);

  return (
    <main className="page-container admin-page">
      <div className="admin-shell">
        <aside className="admin-sidebar">
          <img src="/brand/logo-eventmaster-white.svg" alt="EventMaster" />
          <nav>
            <Link to="/admin" className="active">Overview</Link>
            <Link to="/events">Eventos</Link>
            <Link to="/admin/venues">Recintos</Link>
            <Link to="/verificar">QR Check</Link>
            <Link to="/websocket">Realtime</Link>
          </nav>
        </aside>

        <section className="admin-content">
          <SectionHeader
            eyebrow="Admin"
            title="Centro de control EventMaster"
            description="Opera eventos, recintos, venta de boletos y acceso QR desde una vista ejecutiva."
            actions={<ButtonLink to="/verificar">Verificar QR</ButtonLink>}
          />

          <div className="metrics-grid">
            <StatCard label="Eventos activos" value={events.length} helper="+12% vs ayer" />
            <StatCard label="Boletos vendidos" value="168" helper="Estimado demo" tone="success" />
            <StatCard label="Ingresos estimados" value={formatCurrency(estimatedRevenue)} helper="Venta bruta demo" />
            <StatCard label="Asientos ocupados" value={`${occupiedSeats}/${totalSeats}`} helper="Mapa actual" tone="warning" />
          </div>

          <div className="admin-layout">
            <Card className="admin-table-card">
              <div className="table-header">
                <div>
                  <h2>Eventos recientes</h2>
                  <p>Listado operativo para administracion comercial.</p>
                </div>
                <ButtonLink to="/admin/create" size="sm">Crear evento</ButtonLink>
              </div>

              <div className="event-table">
                {events.map((event) => (
                  <Link key={event.id} to={`/events/${event.slug}`} className="event-row">
                    <div>
                      <strong>{event.title}</strong>
                      <span>{event.venue} · {event.dateLabel}</span>
                    </div>
                    <Badge tone={event.availability === "Media" ? "warning" : "success"}>
                      {event.status}
                    </Badge>
                    <span>{formatCurrency(event.priceFrom)}</span>
                  </Link>
                ))}
              </div>
            </Card>

            <Card className="admin-actions-card">
              <h2>Accesos rapidos</h2>
              <ButtonLink to="/admin/create">Disenar recinto</ButtonLink>
              <ButtonLink to="/admin/venues" variant="secondary">Ver recintos</ButtonLink>
              <ButtonLink to="/websocket" variant="ghost">Probar realtime</ButtonLink>
            </Card>
          </div>
        </section>
      </div>
    </main>
  );
}

export default AdminPanel;
