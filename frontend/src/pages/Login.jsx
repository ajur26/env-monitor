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
        setErr(data?.detail || "Error logging in");
        return;
      }

      setTokens({ access: data.access, refresh: data.refresh });
      navigate("/room/living_room", { replace: true });
    } catch {
      setErr("Error connecting to API");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid var(--border-soft)",
    background: "var(--bg-main)",
    color: "var(--text-main)",
    outline: "none",
  };

  const labelTextStyle = {
    color: "var(--text-muted)",
    fontSize: 12,
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "var(--bg-main)",
        padding: 24,
        color: "var(--text-main)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "var(--bg-panel)",
          borderRadius: 14,
          padding: 24,
          border: "1px solid var(--border-soft)",
          boxShadow: "0 6px 20px rgba(0,0,0,0.35)",
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: 16 }}>Login</h2>

        <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span style={labelTextStyle}>Username</span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={inputStyle}
              autoComplete="username"
            />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span style={labelTextStyle}>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
              autoComplete="current-password"
            />
          </label>

          {err ? (
            <div
              style={{
                color: "var(--text-main)",
                background: "var(--bg-main)",
                padding: 10,
                borderRadius: 10,
                border: "1px solid var(--border-main)",
              }}
            >
              {err}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid var(--border-soft)",
              background: loading
                ? "var(--button-bg-hover)"
                : "var(--button-bg)",
              color: "var(--text-main)",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.75 : 1,
              fontWeight: 500,
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}