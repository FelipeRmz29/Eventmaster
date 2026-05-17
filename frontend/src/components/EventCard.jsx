import { Link } from "react-router-dom";
import { Badge, ButtonLink, Card } from "./ui.jsx";
import { formatCurrency } from "../data/events";

const categoryTone = {
  Concierto: "info",
  Deportes: "success",
  Festival: "warning",
  Conferencia: "info",
  Teatro: "warning",
};

function EventCard({ event, compact = false, className = "" }) {
  const isSoldOut = event.availability === "Agotado" || event.status === "Agotado";
  const tone = isSoldOut ? "danger" : categoryTone[event.category] || "info";

  return (
    <Card className={`event-card premium-event-card ${compact ? "compact-card" : ""} ${className}`}>
      <Link to={`/events/${event.slug}`} className="event-card-media" aria-label={event.title}>
        <img src={event.image} alt={event.title} />
        <Badge tone={tone}>{isSoldOut ? "Agotado" : event.category}</Badge>
        <span className="event-date-chip">{event.dateLabel}</span>
        {isSoldOut && <span className="sold-out-overlay">AGOTADO</span>}
      </Link>

      <div className="event-card-body">
        <span>{event.venue} · {event.city}</span>
        <h3>{event.title}</h3>
        <p>{event.dateLabel} · {event.timeLabel}</p>

        <div className="event-card-footer">
          <strong>Desde {formatCurrency(event.priceFrom)}</strong>
          <ButtonLink
            to={`/events/${event.slug}`}
            size="sm"
            disabled={isSoldOut}
          >
            Comprar
          </ButtonLink>
        </div>
      </div>
    </Card>
  );
}

export default EventCard;
