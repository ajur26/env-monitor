import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import HeaderRight from "./HeaderRight";

export default function Layout() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "180px 1fr",
        minHeight: "100vh",
        background: "#0e131f",
        color: "white",
      }}
    >
      <Sidebar />

      <main
        style={{
          padding: 32,
          borderLeft: "1px solid #1e293b",
        }}
      >
        <Outlet />
      </main>

    </div>
  );
}