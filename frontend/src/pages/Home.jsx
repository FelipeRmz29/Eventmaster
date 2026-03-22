import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="page-container">
      <div className="hero-panel">
        <h2>La nueva generación del boletaje digital.</h2>
        <p>
          EventMaster centraliza administración, diseño de recintos y selección
          de asientos en tiempo real para ofrecer una experiencia moderna.
        </p>

        <div className="button-group">
          <Link to="/login" className="main-button">
            Iniciar sesión
          </Link>
          <Link to="/buy" className="main-button secondary">
            Comprar boletos
          </Link>
        </div>
      </div>

      <div className="section-card">
        <h2 className="section-title">¿Qué puedes hacer en EventMaster?</h2>
        <p className="section-subtitle">
          Una plataforma diseñada para operar como un sistema de ticketing real.
        </p>

        <div className="admin-grid">
          <div className="admin-option">
            <h3>Modo administrador</h3>
            <p>Crea layouts, administra recintos y controla la operación interna.</p>
          </div>

          <div className="admin-option">
            <h3>Modo comprador</h3>
            <p>Explora asientos disponibles y selecciona tu mejor lugar.</p>
          </div>

          <div className="admin-option">
            <h3>Tiempo real</h3>
            <p>Los cambios de asientos se reflejan instantáneamente entre clientes.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;