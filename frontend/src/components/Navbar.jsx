import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem("auth") === "true";
  const role = localStorage.getItem("role");

  const handleLogout = () => {
    localStorage.removeItem("auth");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          Event<span className="brand-highlight">Master</span>
        </Link>

        <nav className="navbar-links">
          <Link to="/">Inicio</Link>

          {role === "admin" && <Link to="/admin">Admin</Link>}
          {role === "admin" && <Link to="/admin/create">Recintos</Link>}
          {role === "customer" && <Link to="/buy">Comprar</Link>}
          <Link to="/verificar">Verificar</Link>
          {role === "admin" && <Link to="/websocket">Realtime</Link>}
        </nav>

        <div className="navbar-actions">
          {isAuthenticated ? (
            <>
              <span className="role-badge">
                {role === "admin" ? "Administrador" : "Cliente"}
              </span>
              <button className="main-button secondary" onClick={handleLogout}>
                Cerrar sesión
              </button>
            </>
          ) : (
            <Link to="/login" className="main-button">
              Ingresar
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
