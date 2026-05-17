import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import AdminPanel from "./pages/AdminPanel";
import AdminEventos from "./pages/AdminEventos";
import VenueCreator from "./pages/VenueCreator";
import VenueList from "./pages/VenueList";
import PublicEvents from "./pages/PublicEvents";
import EventDetail from "./pages/EventDetail";
import TicketVerifier from "./pages/TicketVerifier";
import WebSocketPanel from "./components/websocketpanel";
import PWAInstallBanner from "./components/PWAInstallBanner";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <PWAInstallBanner />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/events" element={<PublicEvents />} />
        <Route path="/events/:id" element={<EventDetail />} />
        <Route path="/verificar" element={<TicketVerifier />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminPanel />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/eventos"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminEventos />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/create"
          element={
            <ProtectedRoute allowedRole="admin">
              <VenueCreator />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/venues"
          element={
            <ProtectedRoute allowedRole="admin">
              <VenueList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/websocket"
          element={
            <ProtectedRoute allowedRole="admin">
              <WebSocketPanel />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
