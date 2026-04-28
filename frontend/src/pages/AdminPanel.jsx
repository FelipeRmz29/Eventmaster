import { Link } from "react-router-dom";

function AdminPanel() {
  return (
    <div className="page-container">
      <div className="brand-block">
        <h1>
          Panel <span className="brand-highlight">EventMaster</span>
        </h1>
        <p>Administra recintos, vistas y flujos internos con una interfaz central.</p>
      </div>

      <div className="section-card" style={{ marginTop: "24px" }}>
        <h2 className="section-title">Herramientas administrativas</h2>
        <p className="section-subtitle">
          Selecciona una acción para continuar con la configuración del sistema.
        </p>

        <div className="admin-grid">
          <Link to="/admin/venues" className="admin-option">
            <h3>Ver recintos</h3>
            <p>Consulta los recintos guardados y valida sus dimensiones.</p>
          </Link>

          <Link to="/admin/create" className="admin-option">
            <h3>Crear recinto</h3>
            <p>Diseña una nueva distribución visual de asientos.</p>
          </Link>

          <Link to="/websocket" className="admin-option">
            <h3>Pruebas realtime</h3>
            <p>Verifica que la comunicación en tiempo real funcione correctamente.</p>
          </Link>
        </div>

        <div className="button-group">
          <Link to="/" className="main-button ghost">
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;