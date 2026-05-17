import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Badge, Button, ButtonLink, Card } from "../components/ui.jsx";
import { formatCurrency, getEventBySlug } from "../data/events";

function EventDetail() {
  const { eventSlug } = useParams();
  const event = getEventBySlug(eventSlug);
  const [activeTab, setActiveTab] = useState("Info");
  const [shareMessage, setShareMessage] = useState("");

  const countdown = "Proximo evento";

  const handleShare = async () => {
    const shareData = {
      title: event.title,
      text: `${event.title} en ${event.venue}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setShareMessage("Link copiado al portapapeles.");
      }
    } catch {
      setShareMessage("No se pudo compartir el evento.");
    }
  };

  const tabs = {
    Info: event.description,
    Recinto: `${event.venue}, ${event.city}. Acceso con boleto digital y QR desde celular.`,
    Artistas: "Lineup y talento por confirmar para esta demo comercial.",
    Restricciones: "Revisa edad minima, objetos permitidos y horarios antes de comprar.",
  };

  return (
    <main className="event-detail-page">
      <nav className="page-container breadcrumb">
        <Link to="/">Inicio</Link>
        <span>/</span>
        <Link to="/events">{event.category}</Link>
        <span>/</span>
        <strong>{event.title}</strong>
      </nav>

      <section className="event-hero-detail" style={{ backgroundImage: `url(${event.image})` }}>
        <div className="event-hero-overlay">
          <div className="page-container detail-hero-content">
            <Badge tone="success">{event.status}</Badge>
            <h1>{event.title}</h1>
            <p>{event.description}</p>
            <div className="detail-hero-meta">
              <span>{event.dateLabel} · {event.timeLabel}</span>
              <span>{event.venue} · {event.city}</span>
              <span>Comienza en {countdown}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="page-container detail-layout">
        <div className="detail-main">
          <Card>
            <h2>Informacion del evento</h2>
            <div className="detail-facts">
              <div>
                <span>Fecha</span>
                <strong>{event.dateLabel}</strong>
              </div>
              <div>
                <span>Hora</span>
                <strong>{event.timeLabel}</strong>
              </div>
              <div>
                <span>Recinto</span>
                <strong>{event.venue}</strong>
              </div>
              <div>
                <span>Ciudad</span>
                <strong>{event.city}</strong>
              </div>
            </div>
          </Card>

          <Card>
            <div className="detail-tabs">
              {Object.keys(tabs).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={activeTab === tab ? "active" : ""}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
            <p className="detail-copy">{tabs[activeTab]}</p>
          </Card>

          <Card className="venue-map-card">
            <h2>Recinto</h2>
            <div className="venue-map-preview">
              <span>ESCENARIO</span>
              <div />
            </div>
          </Card>
        </div>

        <aside className="detail-aside">
          <Card className="purchase-panel">
            <span>Boletos desde</span>
            <strong>{formatCurrency(event.priceFrom)}</strong>
            <p>Disponibilidad actual: {event.availability}</p>
            <ButtonLink to={`/buy?event=${event.slug}`}>Seleccionar asientos</ButtonLink>
            <Button variant="ghost" onClick={handleShare}>Compartir evento</Button>
            {shareMessage && <small>{shareMessage}</small>}
          </Card>
        </aside>
      </section>

      <div className="mobile-buy-bar">
        <strong>{formatCurrency(event.priceFrom)}</strong>
        <ButtonLink to={`/buy?event=${event.slug}`} size="sm">
          Comprar
        </ButtonLink>
      </div>
    </main>
  );
}

export default EventDetail;
