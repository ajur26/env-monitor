import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import Alarms from "./pages/Alarms";
import Login from "./pages/Login";
import ProtectedRoute from "./auth/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>

            <Route path="/" element={<Navigate to="/rooms/living_room" />} />

            <Route path="/rooms/:point" element={<Dashboard />} />

            <Route path="/history" element={<History />} />
            <Route path="/alarms" element={<Alarms />} />

          </Route>
        </Route>

      </Routes>
    </BrowserRouter>
  );
}
