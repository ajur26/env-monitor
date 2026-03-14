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
        background: "#000000",
        color: "white",
      }}
    >
      <Sidebar />

      <main
        style={{
          padding: 32,
          borderLeft: "1px solid #000000",
        }}
      >
        <Outlet />
      </main>

    </div>
  );
}