import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

const logoSrc = "/brand/logo-eventmaster-white.svg";

function Navbar() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isAuthenticated = Boolean(localStorage.getItem("adminToken"));
  const role = localStorage.getItem("role");

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 12);

    handleScroll();
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("auth");
    localStorage.removeItem("role");
    localStorage.removeItem("adminToken");
    setIsMenuOpen(false);
    navigate("/login");
  };

  const handleSearch = (event) => {
    event.preventDefault();
    const trimmedQuery = query.trim();

    navigate(trimmedQuery ? `/events?q=${encodeURIComponent(trimmedQuery)}` : "/events");
    setIsMenuOpen(false);
  };

  const navLinks = [
    { to: "/", label: "Inicio" },
    { to: "/events", label: "Explorar" },
    { to: "/verificar", label: "Verificar" },
    ...(role === "admin"
      ? [
          { to: "/admin", label: "Admin" },
          { to: "/websocket", label: "Realtime" },
        ]
      : []),
  ];

  const renderLinks = (className = "navbar-links") => (
    <nav className={className}>
      {navLinks.map((link) => (
        <NavLink key={link.to} to={link.to} onClick={() => setIsMenuOpen(false)}>
          {link.label}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <header className={`navbar ${isScrolled ? "navbar-scrolled" : ""}`}>
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand" onClick={() => setIsMenuOpen(false)}>
          <img src={logoSrc} alt="EventMaster" />
        </Link>

        <form className="navbar-search" onSubmit={handleSearch}>
          <span aria-hidden="true">Buscar</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar eventos, artistas, recintos..."
            aria-label="Buscar eventos"
          />
        </form>

        {renderLinks("navbar-links desktop-links")}

        <div className="navbar-actions">
          {isAuthenticated ? (
            <>
              <span className="role-badge">
                {role === "admin" ? "Admin" : "Cliente"}
              </span>
              <button className="main-button ghost" onClick={handleLogout} type="button">
                Cerrar sesión
              </button>
            </>
          ) : (
            <Link to="/login" className="main-button">
              Ingresar
            </Link>
          )}

          {role === "admin" ? (
            <Link to="/admin/create" className="main-button secondary desktop-cta">
              Crear evento
            </Link>
          ) : (
            <Link to="/admin" className="main-button secondary desktop-cta">
              Vender en EventMaster
            </Link>
          )}

          <button
            className="navbar-menu-button"
            type="button"
            onClick={() => setIsMenuOpen((current) => !current)}
            aria-expanded={isMenuOpen}
            aria-label="Abrir menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
      <div className={`mobile-drawer ${isMenuOpen ? "open" : ""}`}>
        <div className="mobile-drawer-header">
          <img src={logoSrc} alt="EventMaster" />
          <button type="button" onClick={() => setIsMenuOpen(false)} aria-label="Cerrar menu">
            x
          </button>
        </div>
        <form className="mobile-search" onSubmit={handleSearch}>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar eventos"
          />
        </form>
        {renderLinks("mobile-links")}
        <Link to="/admin" className="main-button secondary" onClick={() => setIsMenuOpen(false)}>
          Vender en EventMaster
        </Link>
      </div>
      {isMenuOpen && (
        <button
          className="drawer-backdrop"
          type="button"
          onClick={() => setIsMenuOpen(false)}
          aria-label="Cerrar menu"
        />
      )}
    </header>
  );
}

export default Navbar;
