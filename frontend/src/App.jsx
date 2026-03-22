import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import AdminPanel from "./pages/AdminPanel";
import VenueCreator from "./pages/VenueCreator";
import VenueList from "./pages/VenueList";
import BuyerView from "./pages/BuyerView";
import WebSocketPanel from "./components/websocketpanel";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminPanel />
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

        <Route
          path="/buy"
          element={
            <ProtectedRoute allowedRole="customer">
              <BuyerView />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;