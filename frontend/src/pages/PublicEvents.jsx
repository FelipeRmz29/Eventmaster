import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import EventCard from "../components/EventCard";
import { Badge, Button, ButtonLink, Card, SectionHeader } from "../components/ui.jsx";
import { events } from "../data/events";

const categories = ["Todos", "Concierto", "Deportes", "Festival", "Conferencia"];
const cities = ["Todas", "Ciudad de Mexico", "Monterrey", "Guadalajara", "Puebla"];

function PublicEvents() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const query = searchParams.get("q") || "";
  const category = searchParams.get("categoria") || "Todos";
  const city = searchParams.get("ciudad") || "Todas";
  const sort = searchParams.get("orden") || "fecha";

  const filteredEvents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return events
      .filter((event) => {
        const matchesQuery =
          !normalizedQuery ||
          `${event.title} ${event.venue} ${event.city} ${event.category}`
            .toLowerCase()
            .includes(normalizedQuery);
        const matchesCategory = category === "Todos" || event.category === category;
        const matchesCity = city === "Todas" || event.city === city;

        return matchesQuery && matchesCategory && matchesCity;
      })
      .sort((a, b) => {
        if (sort === "precio") return a.priceFrom - b.priceFrom;
        if (sort === "popularidad") return b.priceFrom - a.priceFrom;

        return a.dateLabel.localeCompare(b.dateLabel);
      });
  }, [category, city, query, sort]);

  const updateParam = (key, value) => {
    const nextParams = new URLSearchParams(searchParams);

    if (!value || value === "Todos" || value === "Todas") {
      nextParams.delete(key);
    } else {
      nextParams.set(key, value);
    }

    setSearchParams(nextParams);
  };

  return (
    <main className="page-container events-page">
      <SectionHeader
        eyebrow="Eventos"
        title="Experiencias listas para reservar"
        description="Explora eventos con boletos digitales, seleccion de asientos y acceso por QR."
        actions={
          <ButtonLink to="/verificar" variant="ghost">
            Verificar boleto
          </ButtonLink>
        }
      />

      <div className="mobile-filter-bar">
        <Button variant="secondary" onClick={() => setIsFilterOpen(true)}>
          Filtros
        </Button>
        <span>{filteredEvents.length} encontrados</span>
      </div>

      <div className="events-layout">
        <Card className={`filters-panel ${isFilterOpen ? "open" : ""}`}>
          <div className="filters-header">
            <strong>Filtros</strong>
            <button type="button" onClick={() => setIsFilterOpen(false)}>x</button>
          </div>

          <label className="ui-field">
            <span>Buscar</span>
            <input
              value={query}
              onChange={(event) => updateParam("q", event.target.value)}
              placeholder="Evento, recinto o ciudad"
            />
          </label>

          <div className="filter-group">
            <span>Categoria</span>
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                className={category === item ? "active" : ""}
                onClick={() => updateParam("categoria", item)}
              >
                {item}
              </button>
            ))}
          </div>

          <label className="ui-field">
            <span>Ciudad</span>
            <select value={city} onChange={(event) => updateParam("ciudad", event.target.value)}>
              {cities.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>
        </Card>

        <section className="events-results">
          <div className="results-toolbar">
            <div>
              <Badge tone="info">{filteredEvents.length} eventos encontrados</Badge>
              {query && <p>Busqueda: {query}</p>}
            </div>
            <div className="toolbar-actions">
              <select value={sort} onChange={(event) => updateParam("orden", event.target.value)}>
                <option value="fecha">Fecha</option>
                <option value="precio">Precio</option>
                <option value="popularidad">Popularidad</option>
              </select>
              <button
                type="button"
                className={viewMode === "grid" ? "active" : ""}
                onClick={() => setViewMode("grid")}
              >
                Grid
              </button>
              <button
                type="button"
                className={viewMode === "list" ? "active" : ""}
                onClick={() => setViewMode("list")}
              >
                Lista
              </button>
            </div>
          </div>

          <div className={`events-grid ${viewMode === "list" ? "list-mode" : ""}`}>
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

export default PublicEvents;
