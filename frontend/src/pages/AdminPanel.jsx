import { Link } from "react-router-dom";

function AdminPanel() {
  return (
    <div className="page-container">
      <div className="brand-block">
        <h1>
          Centro de control <span className="brand-highlight">admin</span>
        </h1>
        <p>
          Configura la experiencia de tus eventos con una interfaz profesional.
        </p>
      </div>

      <div className="section-card" style={{ marginTop: "24px" }}>
        <h2 className="section-title">Herramientas administrativas</h2>
        <p className="section-subtitle">
          Selecciona una herramienta para continuar trabajando en EventMaster.
        </p>

        <div className="admin-grid">
          <Link to="/admin/create" className="admin-option">
            <h3>Diseñador de recinto</h3>
            <p>Genera layouts con filas y columnas para tus eventos.</p>
          </Link>

          <Link to="/admin/venues" className="admin-option">
            <h3>Recintos guardados</h3>
            <p>Consulta configuraciones previamente creadas y almacenadas.</p>
          </Link>

          <Link to="/websocket" className="admin-option">
            <h3>Prueba realtime</h3>
            <p>Valida la sincronización instantánea entre múltiples clientes.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;