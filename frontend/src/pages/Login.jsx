import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../api/client";
import { setTokens } from "../auth/auth";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/token/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErr(data?.detail || "Błąd logowania");
        return;
      }

      setTokens({ access: data.access, refresh: data.refresh });
      navigate("/", { replace: true });
    } catch {
      setErr("Błąd połączenia z API");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#0f172a",
        padding: 24,
        color: "white",
        fontFamily: "Inter, Arial, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "#1e293b",
          borderRadius: 14,
          padding: 24,
          boxShadow: "0 6px 20px rgba(0,0,0,0.4)",
          border: "1px solid #334155",
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: 16 }}>Logowanie</h2>

        <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ color: "#cbd5e1", fontSize: 12 }}>Username</span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid #334155",
                background: "#0b1220",
                color: "white",
              }}
              autoComplete="username"
            />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ color: "#cbd5e1", fontSize: 12 }}>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid #334155",
                background: "#0b1220",
                color: "white",
              }}
              autoComplete="current-password"
            />
          </label>

          {err ? (
            <div style={{ color: "#fecaca", background: "#450a0a", padding: 10, borderRadius: 10, border: "1px solid #ef4444" }}>
              {err}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #38bdf8",
              background: "#0b1220",
              color: "white",
              cursor: "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Logowanie..." : "Zaloguj"}
          </button>
        </form>
      </div>
    </div>
  );
}