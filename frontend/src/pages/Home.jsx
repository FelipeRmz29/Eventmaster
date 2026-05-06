import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import EventCard from "../components/EventCard";
import { Badge, ButtonLink, Card, SectionHeader, StatCard } from "../components/ui.jsx";
import { events, formatCurrency } from "../data/events";

const heroImage = "/hero/eventmaster-hero.jpg";
const heroLoop = "/videos/eventmaster-demo-loop.gif";
const categories = ["Todos", "Concierto", "Deportes", "Festival", "Conferencia"];

function Home() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [activeSlide, setActiveSlide] = useState(0);
  const featuredEvents = events.slice(0, 3);

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % featuredEvents.length);
    }, 4000);

    return () => window.clearInterval(timerId);
  }, [featuredEvents.length]);

  const visibleEvents = useMemo(() => {
    if (activeCategory === "Todos") return events;

    return events.filter((event) => event.category === activeCategory);
  }, [activeCategory]);

  const handleSearch = (event) => {
    event.preventDefault();
    const trimmedQuery = query.trim();

    navigate(trimmedQuery ? `/events?q=${encodeURIComponent(trimmedQuery)}` : "/events");
  };

  const activeEvent = featuredEvents[activeSlide] || featuredEvents[0];

  return (
    <main className="home-page">
      <section className="home-hero premium-hero">
        <img className="hero-background" src={heroImage} alt="" aria-hidden="true" />
        <div className="hero-overlay" />
        <div className="page-container hero-content">
          <Badge tone="info">Ticketing digital para eventos en vivo</Badge>
          <h1>Tu proxima experiencia te esta esperando.</h1>
          <p>
            Compra boletos, elige asientos en tiempo real y valida accesos por QR
            desde una plataforma moderna lista para demo comercial.
          </p>

          <form className="hero-search" onSubmit={handleSearch}>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar eventos, artistas, recintos..."
            />
            <button type="submit">Buscar</button>
          </form>

          <div className="category-pills">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className={activeCategory === category ? "active" : ""}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="hero-actions">
            <ButtonLink to="/events">Explorar eventos</ButtonLink>
            <ButtonLink to="/admin" variant="secondary">Panel admin</ButtonLink>
            <ButtonLink to="/verificar" variant="ghost">Verificar boleto</ButtonLink>
          </div>
        </div>
      </section>

      <section className="page-container metrics-grid">
        <StatCard label="Eventos activos" value="24" helper="Listos para publicar" />
        <StatCard label="Asientos en tiempo real" value="8.4k" helper="Sincronizados por WebSocket" />
        <StatCard label="Boletos digitales" value="15k+" helper="Preparados para celular" />
        <StatCard label="Verificacion QR" value="< 2s" helper="Entrada rapida al recinto" tone="success" />
      </section>

      <section className="page-container billboard-section">
        <SectionHeader
          eyebrow="Destacados"
          title="Eventos que se sienten listos para vender"
          description="Promociones visuales con imagen real, fecha clara y acceso directo a compra."
        />

        <Card className="featured-billboard">
          <img src={activeEvent.image} alt={activeEvent.title} />
          <div className="billboard-copy">
            <Badge tone="info">{activeEvent.category}</Badge>
            <h2>{activeEvent.title}</h2>
            <p>{activeEvent.dateLabel} · {activeEvent.venue}, {activeEvent.city}</p>
            <strong>Desde {formatCurrency(activeEvent.priceFrom)}</strong>
            <ButtonLink to={`/events/${activeEvent.slug}`}>Comprar ahora</ButtonLink>
          </div>
          <div className="billboard-controls">
            {featuredEvents.map((event, index) => (
              <button
                key={event.id}
                type="button"
                className={activeSlide === index ? "active" : ""}
                onClick={() => setActiveSlide(index)}
                aria-label={`Ver ${event.title}`}
              />
            ))}
          </div>
        </Card>
      </section>

      <section className="page-container">
        <SectionHeader
          eyebrow="Proximos eventos"
          title="Compra facil, acceso rapido"
          description="Filtra por categoria y entra al detalle para elegir boletos."
          actions={<ButtonLink to="/events" variant="ghost">Ver todos</ButtonLink>}
        />

        <div className="events-grid compact">
          {visibleEvents.slice(0, 4).map((event) => (
            <EventCard key={event.id} event={event} compact />
          ))}
        </div>
      </section>

      <section className="page-container category-section">
        <SectionHeader
          eyebrow="Categorias"
          title="Encuentra el plan por mood, ciudad o tipo de evento"
          description="Cards pensadas para navegar rapido desde mobile sin perder jerarquia visual."
        />

        <div className="category-scroll">
          {categories.slice(1).map((category, index) => (
            <Link
              key={category}
              to={`/events?categoria=${encodeURIComponent(category)}`}
              className="category-card"
              style={{ backgroundImage: `url(${events[index % events.length].image})` }}
            >
              <span>{category}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="page-container platform-section">
        <Card className="platform-card">
          <div>
            <Badge tone="success">PWA + QR</Badge>
            <h2>Operacion de acceso desde celular</h2>
            <p>
              La verificacion QR vive como experiencia mobile-first, instalable y
              conectada al endpoint seguro de tickets.
            </p>
            <ButtonLink to="/verificar">Abrir verificador</ButtonLink>
          </div>
          <img src={heroLoop} alt="Vista previa EventMaster" />
        </Card>
      </section>

      <footer className="site-footer">
        <div className="page-container footer-grid">
          <div>
            <img src="/brand/logo-eventmaster-white.svg" alt="EventMaster" />
            <p>La mejor experiencia en boletos para eventos.</p>
          </div>
          <nav>
            <strong>Plataforma</strong>
            <Link to="/events">Explorar</Link>
            <Link to="/admin">Crear evento</Link>
            <Link to="/verificar">Verificar QR</Link>
          </nav>
          <nav>
            <strong>Soporte</strong>
            <Link to="/login">Acceso</Link>
            <Link to="/events">Eventos</Link>
            <Link to="/admin/venues">Recintos</Link>
          </nav>
          <span>© 2026 EventMaster. Todos los derechos reservados.</span>
        </div>
      </footer>
    </main>
  );
}

export default Home;
