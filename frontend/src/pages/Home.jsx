import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="page-container">
      <div className="brand-bar">
        <div className="brand-block">
          <h1>
            Event<span className="brand-highlight">Master</span>
          </h1>
          <p>Plataforma profesional de gestión, venta y control de boletos.</p>
        </div>

        <div className="button-group" style={{ marginTop: 0 }}>
          <Link to="/admin" className="main-button">
            Panel admin
          </Link>
          <Link to="/websocket" className="main-button secondary">
            Tiempo real
          </Link>
        </div>
      </div>

      <div className="hero-panel">
        <h2>Vende, organiza y controla eventos como una plataforma top.</h2>
        <p>
          Gestiona recintos, asientos y experiencia de compra en una sola
          interfaz moderna.
        </p>
      </div>

      <div className="section-card">
        <h2 className="section-title">Centro de operaciones</h2>
        <p className="section-subtitle">
          Accede a las herramientas principales para administrar EventMaster.
        </p>

        <div className="admin-grid">
          <Link to="/admin" className="admin-option">
            <h3>Panel administrativo</h3>
            <p>Gestiona vistas internas y controla el flujo general del sistema.</p>
          </Link>

          <Link to="/admin/create" className="admin-option">
            <h3>Diseñador de recintos</h3>
            <p>Crea mapas visuales por filas y columnas para eventos y venues.</p>
          </Link>

          <Link to="/admin/venues" className="admin-option">
            <h3>Lista de recintos</h3>
            <p>Consulta configuraciones guardadas y valida estructura disponible.</p>
          </Link>

          <Link to="/websocket" className="admin-option">
            <h3>Realtime / WebSocket</h3>
            <p>Prueba sincronización instantánea entre múltiples clientes.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;