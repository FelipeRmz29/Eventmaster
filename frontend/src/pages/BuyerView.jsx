import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import SeatGrid, { SeatLegend, SeatStats } from "../components/SeatGrid";
import { Badge, Button, ButtonLink, Card, SectionHeader } from "../components/ui.jsx";
import { loadMapFromLocalStorage } from "../data/storage";
import { connectSocket, getClientId, sendSocketMessage } from "../services/socket";
import { createDefaultSeatGrid, formatCurrency, getEventBySlug } from "../data/events";
import {
  applySeatUpdates,
  createSocketSeat,
  isSeatLockedForClient,
  isSeatOwnedByClient,
} from "../data/seats";

const RESERVATION_SECONDS = 600;

function BuyerView() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const event = getEventBySlug(searchParams.get("event"));
  const [clientId] = useState(() => getClientId());
  const [grid, setGrid] = useState(() => loadMapFromLocalStorage() || createDefaultSeatGrid());
  const [secondsLeft, setSecondsLeft] = useState(RESERVATION_SECONDS);
  const selectedSeatsRef = useRef([]);

  const selectedSeats = useMemo(
    () => grid.flat().filter((seat) => isSeatOwnedByClient(seat, clientId)),
    [clientId, grid]
  );
  const lockedByOthers = useMemo(
    () =>
      grid
        .flat()
        .filter((seat) => seat.status === "selected" && !isSeatOwnedByClient(seat, clientId))
        .length,
    [clientId, grid]
  );
  const timerProgress = Math.max(0, (secondsLeft / RESERVATION_SECONDS) * 100);
  const timerMinutes = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const timerSeconds = String(secondsLeft % 60).padStart(2, "0");

  const releaseSelectedSeats = useCallback(() => {
    const releasedSeats = selectedSeatsRef.current.map((seat) => ({
      ...seat,
      status: "available",
      lockedBy: undefined,
    }));

    if (!releasedSeats.length) return;

    setGrid((prevGrid) => applySeatUpdates(prevGrid, releasedSeats));
    releasedSeats.forEach((seat) => {
      sendSocketMessage({ type: "seat_update", seat: createSocketSeat(seat) });
    });
  }, []);

  useEffect(() => {
    const socket = connectSocket();

    const handleSocketMessage = (eventMessage) => {
      try {
        const data = JSON.parse(eventMessage.data);

        if (data.type === "seat_update") {
          setGrid((prevGrid) => applySeatUpdates(prevGrid, [data.seat]));
        }

        if (data.type === "seat_snapshot" && Array.isArray(data.seats)) {
          setGrid((prevGrid) => applySeatUpdates(prevGrid, data.seats));
        }
      } catch (error) {
        console.error("Mensaje WebSocket no valido:", error);
      }
    };

    socket.addEventListener("message", handleSocketMessage);

    return () => {
      socket.removeEventListener("message", handleSocketMessage);
    };
  }, []);

  useEffect(() => {
    selectedSeatsRef.current = selectedSeats;
  }, [selectedSeats]);

  useEffect(() => {
    if (!selectedSeats.length) {
      return undefined;
    }

    const timerId = window.setInterval(() => {
      setSecondsLeft((current) => {
        const nextValue = Math.max(0, current - 1);

        if (current > 0 && nextValue === 0) {
          window.setTimeout(releaseSelectedSeats, 0);
        }

        return nextValue;
      });
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [releaseSelectedSeats, selectedSeats.length]);

  const handleSeatClick = (clickedSeat) => {
    if (isSeatLockedForClient(clickedSeat, clientId)) return;

    const isCurrentSelection = isSeatOwnedByClient(clickedSeat, clientId);
    const updatedSeat = {
      ...clickedSeat,
      status: isCurrentSelection ? "available" : "selected",
      lockedBy: isCurrentSelection ? undefined : clientId,
    };

    if (!selectedSeats.length && updatedSeat.status === "selected") {
      setSecondsLeft(RESERVATION_SECONDS);
    }

    setGrid((prevGrid) => applySeatUpdates(prevGrid, [updatedSeat]));
    sendSocketMessage({ type: "seat_update", seat: createSocketSeat(updatedSeat) });
  };

  const goToCheckout = () => {
    localStorage.setItem(
      "eventmaster_selected_seats",
      JSON.stringify(
        selectedSeats.map((seat) => ({
          id: seat.id,
          label: seat.label,
          status: seat.status,
        }))
      )
    );
    navigate(`/checkout/${event.slug}`);
  };

  return (
    <main className="page-container buyer-page">
      <SectionHeader
        eyebrow="Seleccion de asientos"
        title={event.title}
        description={`${event.dateLabel} - ${event.timeLabel} - ${event.venue}`}
        actions={<ButtonLink to={`/events/${event.slug}`} variant="ghost">Detalles</ButtonLink>}
      />

      <div className="buyer-layout">
        <Card className="seat-map-card enhanced-seat-map-card">
          <div className="seat-map-topbar">
            <Badge tone={lockedByOthers ? "warning" : "success"}>
              {lockedByOthers ? `${lockedByOthers} bloqueados` : "En vivo"}
            </Badge>
            <SeatStats grid={grid} />
          </div>
          <div className="stage-banner">ESCENARIO</div>
          <SeatGrid grid={grid} onSeatClick={handleSeatClick} clientId={clientId} />
          <SeatLegend />
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
