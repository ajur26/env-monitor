import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../api/client";
import { setTokens } from "../auth/auth";
import logo from "../assets/env_button_logo.webp";

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

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-brand">
          <img src={logo} alt="ENV-MONITOR logo" className="login-logo" />
        </div>



        <form onSubmit={onSubmit} className="login-form">
          <label className="login-field">
            <span>Username</span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </label>

          <label className="login-field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </label>

          {err ? <div className="login-error">{err}</div> : null}

          <button type="submit" disabled={loading} className="login-button">
            {loading ? "Logging in..." : "Login"}
          </button>

                  <div className="demo-login-box">
          <p className="demo-login-title">Dostęp demonstracyjny</p>

          <button
            type="button"
            className="demo-login-button"
            onClick={() => {
              setUsername("demo");
              setPassword("Demo1234!");
            }}
          >
            Użyj konta demo
          </button>
        </div>

        </form>
      </section>
    </main>
  );
}