import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import EventCard from "../components/EventCard";
import { Badge, ButtonLink, EmptyState, SectionHeader } from "../components/ui.jsx";
import { normalizeEvents } from "../data/events";
import { getEventos } from "../services/api";

function PublicEvents() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const query = searchParams.get("q") || "";

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

  const filteredEvents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) return events;

    return events.filter((event) =>
      `${event.title} ${event.venue} ${event.city}`.toLowerCase().includes(normalizedQuery)
    );
  }, [events, query]);

  const handleSearch = (event) => {
    const nextQuery = event.target.value;
    const nextParams = new URLSearchParams(searchParams);

    if (nextQuery.trim()) {
      nextParams.set("q", nextQuery);
    } else {
      nextParams.delete("q");
    }

    setSearchParams(nextParams);
  };

  return (
    <main className="page-container events-page">
      <SectionHeader
        eyebrow="Eventos"
        title="Eventos disponibles"
        description="Listado conectado al backend."
        actions={
          <ButtonLink to="/verificar" variant="ghost">
            Verificar boleto
          </ButtonLink>
        }
      />

      <section className="events-results">
        <div className="results-toolbar">
          <div>
            <Badge tone="info">{filteredEvents.length} eventos</Badge>
            {query && <p>Busqueda: {query}</p>}
          </div>
          <label className="ui-field event-search-field">
            <span>Buscar</span>
            <input
              value={query}
              onChange={handleSearch}
              placeholder="Nombre o recinto"
            />
          </label>
        </div>

        {status === "loading" && <p className="loading-state">Cargando eventos...</p>}
        {status === "error" && (
          <EmptyState title="No se pudieron cargar los eventos." description={error} />
        )}
        {status === "ready" && !filteredEvents.length && (
          <EmptyState title="No hay eventos disponibles." description="Intenta otra busqueda." />
        )}

        <div className="events-grid">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </section>
    </main>
  );
}

export default PublicEvents;
