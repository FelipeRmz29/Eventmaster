import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import EventCard from "../components/EventCard";
import { Badge, ButtonLink, EmptyState, SectionHeader } from "../components/ui.jsx";
import { normalizeEvents } from "../data/events";
import { getEventos } from "../services/api";

const heroImage = "/hero/eventmaster-hero.jpg";

function Home() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    getEventos()
      .then((data) => setEvents(normalizeEvents(data).slice(0, 4)))
      .catch((requestError) => setError(requestError.message));
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    const trimmedQuery = query.trim();

    navigate(trimmedQuery ? `/events?q=${encodeURIComponent(trimmedQuery)}` : "/events");
  };

  return (
    <main className="home-page">
      <section className="home-hero premium-hero">
        <img className="hero-background" src={heroImage} alt="" aria-hidden="true" />
        <div className="hero-overlay" />
        <div className="page-container hero-content">
          <Badge tone="info">EventMaster</Badge>
          <h1>Boletos digitales para tus eventos.</h1>
          <p>
            Consulta eventos, elige asientos disponibles y valida accesos por QR.
          </p>

          <form className="hero-search" onSubmit={handleSearch}>
            <input
              value={query}
              onChange={(eventInput) => setQuery(eventInput.target.value)}
              placeholder="Buscar eventos"
            />
            <button type="submit">Buscar</button>
          </form>

          <div className="hero-actions">
            <ButtonLink to="/events">Ver eventos</ButtonLink>
            <ButtonLink to="/admin" variant="secondary">Panel admin</ButtonLink>
            <ButtonLink to="/verificar" variant="ghost">Verificar boleto</ButtonLink>
          </div>
        </div>
      </section>

      <section className="page-container">
        <SectionHeader
          eyebrow="Eventos"
          title="Disponibles"
          description="Datos cargados desde el backend."
          actions={<ButtonLink to="/events" variant="ghost">Ver todos</ButtonLink>}
        />

        {error && <EmptyState title="No se pudieron cargar los eventos." description={error} />}
        {!error && !events.length && <p className="loading-state">Cargando eventos...</p>}

        <div className="events-grid compact">
          {events.map((event) => (
            <EventCard key={event.id} event={event} compact />
          ))}
        </div>
      </section>
    </main>
  );
}

export default Home;
