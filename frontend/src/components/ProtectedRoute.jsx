import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRole }) {
  const isAuthenticated = localStorage.getItem("auth") === "true";
  const userRole = localStorage.getItem("role");

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && userRole !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;