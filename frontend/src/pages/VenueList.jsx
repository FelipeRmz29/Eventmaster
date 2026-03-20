import { Link } from "react-router-dom";
import { loadMapFromLocalStorage } from "../data/storage";

function VenueList() {
  const map = loadMapFromLocalStorage();

  return (
    <div className="page-container">
      <div className="brand-block">
        <h1>
          Recintos <span className="brand-highlight">guardados</span>
        </h1>
        <p>Resumen de configuraciones creadas dentro del sistema.</p>
      </div>

      <div className="section-card" style={{ marginTop: "24px" }}>
        <h2 className="section-title">Inventario de layout</h2>
        <p className="section-subtitle">
          Consulta la información del mapa actualmente almacenado.
        </p>

        {map ? (
          <div className="card-box">
            <div className="stats-line">
              <div className="stat-pill">Filas: {map.length}</div>
              <div className="stat-pill">Columnas: {map[0]?.length || 0}</div>
              <div className="stat-pill">
                Total asientos: {map.length * (map[0]?.length || 0)}
              </div>
            </div>
          </div>
        ) : (
          <div className="card-box">
            <p className="empty-state">No hay recintos guardados todavía.</p>
          </div>
        )}

        <div className="button-group">
          <Link to="/admin/create" className="main-button">
            Crear o editar recinto
          </Link>
          <Link to="/admin" className="main-button ghost">
            Volver al panel
          </Link>
        </div>
      </div>
    </div>
  );
}

export default VenueList;

