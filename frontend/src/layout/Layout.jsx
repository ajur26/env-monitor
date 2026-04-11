import { Outlet } from "react-router-dom";
import TopBar from "./Topbar";

export default function Layout() {
  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        background: "var(--bg-main)",
        color: "var(--text-main)",
      }}
    >
      <TopBar />

      <main
        style={{
          padding: 32,
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}