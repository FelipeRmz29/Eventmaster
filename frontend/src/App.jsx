import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import AdminPanel from "./pages/AdminPanel";
import VenueCreator from "./pages/VenueCreator";
import VenueList from "./pages/VenueList";
import ProtectedRoute from "./components/ProtectedRoute";
import WebSocketPanel from "./components/websocketpanel";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPanel />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/create"
          element={
            <ProtectedRoute>
              <VenueCreator />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/venues"
          element={
            <ProtectedRoute>
              <VenueList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/websocket"
          element={
            <ProtectedRoute>
              <WebSocketPanel />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;