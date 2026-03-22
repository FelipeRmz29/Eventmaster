import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    if (password === "admin123") {
      localStorage.setItem("auth", "true");
      localStorage.setItem("role", "admin");
      navigate("/admin");
      return;
    }

    if (password === "cliente123") {
      localStorage.setItem("auth", "true");
      localStorage.setItem("role", "customer");
      navigate("/buy");
      return;
    }

    alert("Credenciales incorrectas");
  };

  return (
    <div className="page-container auth-page">
      <div className="auth-card">
        <h1 className="section-title">Acceso a EventMaster</h1>
        <p className="section-subtitle">
          Ingresa con tu perfil para continuar.
        </p>

        <div className="card-box auth-help">
          <p><strong>Modo admin:</strong> admin123</p>
          <p><strong>Modo cliente:</strong> cliente123</p>
        </div>

        <div className="form-group" style={{ marginTop: "18px" }}>
          <label>Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Escribe tu contraseña"
          />
        </div>

        <div className="button-group">
          <button className="main-button" onClick={handleLogin}>
            Ingresar
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;