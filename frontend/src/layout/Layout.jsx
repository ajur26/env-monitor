import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import HeaderRight from "./HeaderRight";

export default function Layout() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "240px 1fr 260px",
        minHeight: "100vh",
        background: "#0f172a",
        color: "white",
      }}
    >
      <Sidebar />

      <main
        style={{
          padding: 32,
          borderLeft: "1px solid #1e293b",
          borderRight: "1px solid #1e293b",
        }}
      >
        <Outlet />
      </main>

      <HeaderRight />
    </div>
  );
}