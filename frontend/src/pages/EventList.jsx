import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getEventos } from "../services/api";

function EventList() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getEventos()
      .then(setEventos)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-container">
      <div className="brand-bar">
        <div className="brand-block">
          <h1>
            Eventos <span className="brand-highlight">disponibles</span>
          </h1>
          <p>Selecciona un evento para comprar tu boleto.</p>
        </div>
        <Link to="/" className="main-button ghost">
          ← Inicio
        </Link>
      </div>

      <div className="section-card">
        {loading && <p className="empty-state">Cargando eventos...</p>}

        {error && (
          <p style={{ color: "var(--danger)" }}>
            Error: {error}
          </p>
        )}

        {!loading && !error && eventos.length === 0 && (
          <p className="empty-state">No hay eventos disponibles en este momento.</p>
        )}

        {!loading && !error && eventos.length > 0 && (
          <div className="admin-grid">
            {eventos.map((evento) => (
              <Link
                to={`/eventos/${evento.id}`}
                key={evento.id}
                className="admin-option"
              >
                <h3>{evento.nombre}</h3>
                <p style={{ marginBottom: "6px" }}>
                  {new Date(evento.fecha).toLocaleString("es-MX", {
                    dateStyle: "full",
                    timeStyle: "short",
                  })}
                </p>
                <p>
                  <span
                    style={{
                      fontSize: "0.85rem",
                      color: "var(--text-soft)",
                    }}
                  >
                    {evento.recintos?.nombre} · {evento.recintos?.direccion}
                  </span>
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default EventList;
