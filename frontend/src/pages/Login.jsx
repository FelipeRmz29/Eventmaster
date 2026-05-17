import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Badge, Button, Card, Input } from "../components/ui.jsx";
import { loginAdmin } from "../services/api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const data = await loginAdmin({ email: email.trim(), password });

      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("auth", "true");
      localStorage.setItem("role", "admin");
      navigate("/admin");
    } catch (loginError) {
      setError(loginError.message || "Credenciales incorrectas.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="auth-page premium-auth-page">
      <img className="auth-background" src="/hero/eventmaster-hero.jpg" alt="" aria-hidden="true" />
      <Card className="auth-card premium-auth glass">
        <img className="auth-logo" src="/brand/logo-eventmaster-white.svg" alt="EventMaster" />
        <Badge tone="info">Acceso administrador</Badge>
        <h1>Iniciar sesion</h1>
        <p>Ingresa con las credenciales de administrador registradas en backend.</p>

        <form onSubmit={handleLogin} className="auth-form">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(eventInput) => setEmail(eventInput.target.value)}
            placeholder="admin@eventmaster.mx"
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(eventInput) => setPassword(eventInput.target.value)}
            placeholder="Escribe tu password"
            error={error}
            required
          />

          <Button loading={isLoading} disabled={isLoading || !email || !password}>
            Entrar
          </Button>
        </form>

        <p className="auth-footer">
          Acceso publico: <Link to="/events">Explora eventos</Link>
        </p>
      </Card>
    </main>
  );
}

export default Login;
