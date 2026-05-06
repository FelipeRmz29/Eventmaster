import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import SeatGrid from "../components/SeatGrid";
import { Badge, Button, ButtonLink, Card, SectionHeader } from "../components/ui.jsx";
import { loadMapFromLocalStorage } from "../data/storage";
import { connectSocket } from "../services/socket";
import { createDefaultSeatGrid, formatCurrency, getEventBySlug } from "../data/events";

const RESERVATION_SECONDS = 600;

function BuyerView() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const event = getEventBySlug(searchParams.get("event"));
  const [grid, setGrid] = useState(() => loadMapFromLocalStorage() || createDefaultSeatGrid());
  const [secondsLeft, setSecondsLeft] = useState(RESERVATION_SECONDS);

  const selectedSeats = useMemo(
    () => grid.flat().filter((seat) => seat.status === "selected"),
    [grid]
  );
  const timerProgress = Math.max(0, (secondsLeft / RESERVATION_SECONDS) * 100);
  const timerMinutes = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const timerSeconds = String(secondsLeft % 60).padStart(2, "0");

  useEffect(() => {
    const socket = connectSocket();

    socket.onmessage = (eventMessage) => {
      try {
        const data = JSON.parse(eventMessage.data);

        if (data.type === "seat_update") {
          setGrid((prevGrid) =>
            prevGrid.map((row) =>
              row.map((seat) =>
                seat.id === data.seat.id
                  ? { ...seat, status: data.seat.status }
                  : seat
              )
            )
          );
        }
      } catch (error) {
        console.error("Mensaje WebSocket no válido:", error);
      }
    };
  }, []);

  useEffect(() => {
    if (!selectedSeats.length) {
      return undefined;
    }

    const timerId = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [selectedSeats.length]);

  const handleSeatClick = (clickedSeat) => {
    if (clickedSeat.status === "occupied" || clickedSeat.status === "reserved") return;

    const updatedSeat = {
      ...clickedSeat,
      status: clickedSeat.status === "available" ? "selected" : "available",
    };

    if (!selectedSeats.length && updatedSeat.status === "selected") {
      setSecondsLeft(RESERVATION_SECONDS);
    }

    setGrid((prevGrid) =>
      prevGrid.map((row) =>
        row.map((seat) => (seat.id === clickedSeat.id ? updatedSeat : seat))
      )
    );

    const socket = connectSocket();

    if (socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          type: "seat_update",
          seat: updatedSeat,
        })
      );
    }
  };

  const goToCheckout = () => {
    localStorage.setItem("eventmaster_selected_seats", JSON.stringify(selectedSeats));
    navigate(`/checkout/${event.slug}`);
  };

  return (
    <main className="page-container buyer-page">
      <SectionHeader
        eyebrow="Seleccion de asientos"
        title={event.title}
        description={`${event.dateLabel} · ${event.timeLabel} · ${event.venue}`}
        actions={<ButtonLink to={`/events/${event.slug}`} variant="ghost">Detalles</ButtonLink>}
      />

      <div className="buyer-layout">
        <Card className="seat-map-card">
          <div className="stage-banner">ESCENARIO</div>
          <SeatGrid grid={grid} onSeatClick={handleSeatClick} />

          <div className="legend-row">
            <div className="legend-item"><span className="legend-color available" />Disponible</div>
            <div className="legend-item"><span className="legend-color selected" />Seleccionado</div>
            <div className="legend-item"><span className="legend-color occupied" />Ocupado</div>
            <div className="legend-item"><span className="legend-color reserved" />Reservado</div>
          </div>
        </Card>

        <aside className="seat-summary">
          <Card>
            <Badge tone="info">Compra segura</Badge>
            <h2>Resumen</h2>
            <p>{selectedSeats.length ? "Asientos seleccionados" : "Selecciona tus asientos disponibles."}</p>

            {selectedSeats.length > 0 && (
              <div className="reservation-timer">
                <div>
                  <span>Tu seleccion expira en</span>
                  <strong>{timerMinutes}:{timerSeconds}</strong>
                </div>
                <div className="timer-track">
                  <span style={{ width: `${timerProgress}%` }} />
                </div>
              </div>
            )}

            <div className="selected-seat-list">
              {selectedSeats.length ? (
                selectedSeats.map((seat) => (
                  <span key={seat.id}>{seat.label}</span>
                ))
              ) : (
                <small>Ningun asiento seleccionado</small>
              )}
            </div>

            <div className="summary-row">
              <span>Precio por asiento</span>
              <strong>{formatCurrency(event.priceFrom)}</strong>
            </div>
            <div className="summary-row">
              <span>Total</span>
              <strong>{formatCurrency(selectedSeats.length * event.priceFrom)}</strong>
            </div>

            <Button onClick={goToCheckout} disabled={!selectedSeats.length}>
              Continuar al checkout
            </Button>
          </Card>
        </aside>
      </div>
    </main>
  );
}

export default BuyerView;
