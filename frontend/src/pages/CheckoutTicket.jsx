import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Badge, Button, ButtonLink, Card, Input, SectionHeader } from "../components/ui.jsx";
import { formatCurrency, getEventBySlug } from "../data/events";
import { applySeatUpdates, createSocketSeat } from "../data/seats";
import { sendSocketMessage } from "../services/socket";

function CheckoutTicket() {
  const { eventSlug } = useParams();
  const event = getEventBySlug(eventSlug);
  const storedSeats = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("eventmaster_selected_seats") || "[]");
    } catch {
      return [];
    }
  }, []);

  const [buyer, setBuyer] = useState({ name: "", email: "" });
  const [ticket, setTicket] = useState(null);
  const subtotal = storedSeats.length * event.priceFrom;
  const serviceFee = Math.round(subtotal * 0.1);
  const total = subtotal + serviceFee;

  const handleConfirm = (eventForm) => {
    eventForm.preventDefault();

    const occupiedSeats = storedSeats.map((seat) => ({
      ...seat,
      status: "occupied",
      lockedBy: undefined,
    }));
    const token = `EM-${event.id}-${Date.now().toString(36).toUpperCase()}`;
    const nextTicket = {
      token,
      buyer,
      eventTitle: event.title,
      eventDate: `${event.dateLabel} - ${event.timeLabel}`,
      venue: `${event.venue} - ${event.city}`,
      seats: occupiedSeats,
      status: "Activo",
    };

    try {
      const savedMap = JSON.parse(localStorage.getItem("eventmaster_map") || "null");

      if (savedMap) {
        localStorage.setItem(
          "eventmaster_map",
          JSON.stringify(applySeatUpdates(savedMap, occupiedSeats))
        );
      }
    } catch {
      localStorage.removeItem("eventmaster_map");
    }

    occupiedSeats.forEach((seat) => {
      sendSocketMessage({ type: "seat_update", seat: createSocketSeat(seat) });
    });

    localStorage.setItem("eventmaster_last_ticket", JSON.stringify(nextTicket));
    localStorage.removeItem("eventmaster_selected_seats");
    setTicket(nextTicket);
  };

  const handleShare = async () => {
    if (!ticket || !navigator.share) return;

    await navigator.share({
      title: ticket.eventTitle,
      text: `Boleto EventMaster ${ticket.token}`,
    });
  };

  return (
    <main className="page-container checkout-page">
      <SectionHeader
        eyebrow="Checkout"
        title={ticket ? "Boleto digital generado" : "Completa tu compra"}
        description="Confirma tus datos y conserva el boleto digital para el acceso al evento."
      />

      <div className="checkout-layout">
        <Card className="checkout-form-card">
          <div className="stepper">
            {["Resumen", "Datos", "Confirmacion", "Boleto"].map((step, index) => (
              <span key={step} className={ticket || index < 2 ? "active" : ""}>
                {index + 1}. {step}
              </span>
            ))}
          </div>

          {!ticket ? (
            <form onSubmit={handleConfirm} className="checkout-form">
              <Input
                label="Nombre completo"
                value={buyer.name}
                onChange={(eventInput) =>
                  setBuyer((current) => ({ ...current, name: eventInput.target.value }))
                }
                placeholder="Nombre del comprador"
                required
              />
              <Input
                label="Correo electronico"
                type="email"
                value={buyer.email}
                onChange={(eventInput) =>
                  setBuyer((current) => ({ ...current, email: eventInput.target.value }))
                }
                placeholder="correo@ejemplo.com"
                required
              />
              <Button disabled={!storedSeats.length}>
                Confirmar compra
              </Button>
              <span className="secure-badge">Pago seguro - SSL - Boleto digital con QR</span>
              {!storedSeats.length && (
                <p className="form-note">Selecciona al menos un asiento antes de confirmar.</p>
              )}
            </form>
          ) : (
            <div className="digital-ticket">
              <div className="digital-ticket-header">
                <img src="/brand/logo-eventmaster-white.svg" alt="EventMaster" />
                <Badge tone="success">BOLETO</Badge>
              </div>
              <div className="ticket-main-info">
                <h3>{ticket.eventTitle}</h3>
                <p>{ticket.eventDate}</p>
                <p>{ticket.venue}</p>
              </div>
              <div className="ticket-seat-line">
                <strong>
                  {ticket.seats.length
                    ? ticket.seats.map((seat) => seat.label).join(" - ")
                    : "General"}
                </strong>
              </div>
              <div className="ticket-qr" aria-label="Vista previa QR">
                <span>{ticket.token.slice(-6)}</span>
              </div>
              <code>ID: {ticket.token}</code>
              <div className="ticket-actions">
                <Button variant="secondary" onClick={() => window.print()}>Descargar boleto</Button>
                <Button variant="ghost" onClick={handleShare}>Compartir</Button>
                <Button variant="ghost" as="a" href={`mailto:${ticket.buyer.email}`}>Enviar por correo</Button>
              </div>
            </div>
          )}
        </Card>

        <Card className="order-summary">
          <img src={event.image} alt={event.title} />
          <h3>{event.title}</h3>
          <p>{event.dateLabel} - {event.venue}</p>
          <div className="summary-row">
            <span>Asientos</span>
            <strong>{storedSeats.length || 0}</strong>
          </div>
          <div className="summary-row">
            <span>Subtotal</span>
            <strong>{formatCurrency(subtotal)}</strong>
          </div>
          <div className="summary-row">
            <span>Cargo servicio</span>
            <strong>{formatCurrency(serviceFee)}</strong>
          </div>
          <div className="summary-row summary-total">
            <span>Total</span>
            <strong>{formatCurrency(total)}</strong>
          </div>
          <ButtonLink to={`/buy?event=${event.slug}`} variant="ghost">
            Cambiar asientos
          </ButtonLink>
        </Card>
      </div>
    </main>
  );
}

export default CheckoutTicket;
