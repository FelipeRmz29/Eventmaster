import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Badge, Button, Card, Input } from "../components/ui.jsx";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (event) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    if (password === "admin123") {
      localStorage.setItem("auth", "true");
      localStorage.setItem("role", "admin");
      navigate("/admin");
      return;
    }

    if (password === "cliente123") {
      localStorage.setItem("auth", "true");
      localStorage.setItem("role", "customer");
      navigate("/events");
      return;
    }

    setIsLoading(false);
    setError("Credenciales incorrectas. Revisa el perfil de acceso.");
  };

  return (
    <main className="auth-page premium-auth-page">
      <img className="auth-background" src="/hero/eventmaster-hero.jpg" alt="" aria-hidden="true" />
      <Card className="auth-card premium-auth glass">
        <img className="auth-logo" src="/brand/logo-eventmaster-white.svg" alt="EventMaster" />
        <Badge tone="info">Acceso seguro</Badge>
        <h1>Iniciar sesion</h1>
        <p>Accede como administrador o comprador para continuar con la demo.</p>

        <form onSubmit={handleLogin} className="auth-form">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="equipo@eventmaster.mx"
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Escribe tu password"
            error={error}
          />

          <Button loading={isLoading} disabled={isLoading || !password}>
            Entrar
          </Button>
        </form>

        <div className="auth-help-grid">
          <span>Admin: <strong>admin123</strong></span>
          <span>Cliente: <strong>cliente123</strong></span>
        </div>

        <p className="auth-footer">
          No tienes cuenta demo? <Link to="/events">Explora eventos publicos</Link>
        </p>
      </Card>
    </main>
  );
}

export default Login;
