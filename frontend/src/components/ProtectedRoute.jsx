import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const isAuthenticated = true;

  return isAuthenticated ? children : <Navigate to="/" replace />;
}

export default ProtectedRoute;