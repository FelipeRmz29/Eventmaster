import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import SeatGrid, { SeatLegend, SeatStats } from "../components/SeatGrid";
import { Badge, Button, Card, EmptyState } from "../components/ui.jsx";
import { formatCurrency, normalizeEvent } from "../data/events";
import {
  applySeatUpdates,
  buildSeatGridFromBackend,
  isSeatLockedForClient,
  isSeatOwnedByClient,
} from "../data/seats";
import { confirmarTicket, getAsientos, getEvento } from "../services/api";
import { getClientId } from "../services/socket";

const DEFAULT_USER_ID = 1;

function EventDetail() {
  const { eventSlug } = useParams();
  const [clientId] = useState(() => getClientId());
  const [event, setEvent] = useState(null);
  const [grid, setGrid] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [purchaseStatus, setPurchaseStatus] = useState("");
  const [isBuying, setIsBuying] = useState(false);

  const selectedSeats = useMemo(
    () => grid.flat().filter((seat) => isSeatOwnedByClient(seat, clientId)),
    [clientId, grid]
  );

  useEffect(() => {
    setStatus("loading");
    setError("");

    getEvento(eventSlug)
      .then((data) => {
        const normalizedEvent = normalizeEvent(data);
        setEvent(normalizedEvent);

        if (!normalizedEvent.recintoId) {
          setGrid([]);
          setStatus("ready");
          return null;
        }

        return getAsientos(normalizedEvent.recintoId).then((seats) => {
          setGrid(buildSeatGridFromBackend(seats));
          setStatus("ready");
          return null;
        });
      })
      .catch((requestError) => {
        setError(requestError.message);
        setStatus("error");
      });
  }, [eventSlug]);

  const handleSeatClick = (clickedSeat) => {
    if (isSeatLockedForClient(clickedSeat, clientId)) return;

    const isCurrentSelection = isSeatOwnedByClient(clickedSeat, clientId);
    const updatedSeat = {
      ...clickedSeat,
      status: isCurrentSelection ? "available" : "selected",
      lockedBy: isCurrentSelection ? undefined : clientId,
    };

    setPurchaseStatus("");
    setGrid((currentGrid) => applySeatUpdates(currentGrid, [updatedSeat]));
  };

  const handlePurchase = async () => {
    if (!event || !selectedSeats.length) return;

    setIsBuying(true);
    setError("");
    setPurchaseStatus("");

    try {
      const tickets = [];

      for (const seat of selectedSeats) {
        const response = await confirmarTicket({
          usuario_id: DEFAULT_USER_ID,
          evento_id: event.id,
          asiento_id: Number(seat.id),
          precio: event.priceFrom,
        });

        tickets.push(response.ticket);
      }

      const occupiedSeats = selectedSeats.map((seat) => ({
        ...seat,
        status: "occupied",
        lockedBy: undefined,
      }));

      setGrid((currentGrid) => applySeatUpdates(currentGrid, occupiedSeats));
      setPurchaseStatus(`${tickets.length} boleto(s) confirmado(s).`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsBuying(false);
    }
  };

  const handleShare = async () => {
    if (!event) return;

    const shareData = {
      title: event.title,
      text: `${event.title} en ${event.venue}`,
      url: window.location.href,
    };

    if (navigator.share) {
      await navigator.share(shareData);
      return;
    }

    await navigator.clipboard.writeText(window.location.href);
    setPurchaseStatus("Link copiado.");
  };

  if (status === "loading") {
    return <main className="page-container"><p className="loading-state">Cargando evento...</p></main>;
  }

  if (status === "error" || !event) {
    return (
      <main className="page-container">
        <EmptyState title="No se pudo cargar el evento." description={error} />
      </main>
    );
  }

  return (
    <main className="event-detail-page">
      <nav className="page-container breadcrumb">
        <Link to="/">Inicio</Link>
        <span>/</span>
        <Link to="/events">Eventos</Link>
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
              <span>{event.dateLabel} - {event.timeLabel}</span>
              <span>{event.venue}</span>
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
                <span>Direccion</span>
                <strong>{event.city || "Por confirmar"}</strong>
              </div>
            </div>
          </Card>

          <Card className="seat-map-card enhanced-seat-map-card">
            <div className="seat-map-topbar">
              <Badge tone="info">{selectedSeats.length} seleccionados</Badge>
              <SeatStats grid={grid} />
            </div>
            <div className="stage-banner">ESCENARIO</div>
            {grid.length ? (
              <>
                <SeatGrid grid={grid} onSeatClick={handleSeatClick} clientId={clientId} />
                <SeatLegend />
              </>
            ) : (
              <EmptyState title="Este evento no tiene asientos cargados." />
            )}
          </Card>
        </div>

        <aside className="detail-aside">
          <Card className="purchase-panel">
            <span>Precio por asiento</span>
            <strong>{formatCurrency(event.priceFrom)}</strong>
            <p>{selectedSeats.length ? `${selectedSeats.length} asiento(s) seleccionados` : "Selecciona asientos disponibles."}</p>
            <div className="selected-seat-list">
              {selectedSeats.length ? (
                selectedSeats.map((seat) => <span key={seat.id}>{seat.label}</span>)
              ) : (
                <small>Sin asientos seleccionados</small>
              )}
            </div>
            <div className="summary-row summary-total">
              <span>Total</span>
              <strong>{formatCurrency(selectedSeats.length * event.priceFrom)}</strong>
            </div>
            <Button onClick={handlePurchase} disabled={!selectedSeats.length || isBuying} loading={isBuying}>
              Confirmar compra
            </Button>
            <Button variant="ghost" onClick={handleShare}>Compartir evento</Button>
            {purchaseStatus && <small className="secure-badge">{purchaseStatus}</small>}
            {error && <small className="form-note">{error}</small>}
          </Card>
        </aside>
      </section>
    </main>
  );
}

export default EventDetail;
