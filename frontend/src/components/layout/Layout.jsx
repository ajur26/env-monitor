import TopBar from "./TopBar";

export default function Layout({ children }) {
  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        background: "var(--bg-main)",
      }}
    >
      <TopBar />

      <main
        style={{
          padding: "20px",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {children}
      </main>
    </div>
  );
}