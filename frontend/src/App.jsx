import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./auth/ProtectedRoute";
import Layout from "./layout/Layout";

import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import History from "./pages/History";
import Alarms from "./pages/Alarms";

export default function App() {
  return (
    <Routes>
      {/* PUBLIC */}
      <Route path="/login" element={<Login />} />

      {/* PROTECTED */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/room/living_room" replace />} />

          <Route path="/room/:point" element={<Dashboard />} />
          <Route path="/history" element={<History />} />
          <Route path="/alarms" element={<Alarms />} />
        </Route>
      </Route>

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}