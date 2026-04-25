import { Outlet } from "react-router-dom";
import TopBar from "./Topbar";

export default function Layout() {
  return (
    <div className="app-layout">
      <TopBar />

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}