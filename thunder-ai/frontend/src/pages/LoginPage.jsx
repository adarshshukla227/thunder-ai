import { useState } from "react";
import { login, register, setToken } from "../api/client";

export default function LoginPage({ onLoggedIn }) {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data =
        mode === "login" ? await login(email, password) : await register(name, email, password);
      setToken(data.token);
      onLoggedIn(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg)",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: 340,
          background: "var(--panel)",
          border: "0.5px solid var(--border)",
          borderRadius: 14,
          padding: 28,
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontWeight: 600,
            fontSize: 16,
            marginBottom: 4,
          }}
        >
          thunder-ai<span className="blink-cursor">_</span>
        </p>
        <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 22 }}>
          {mode === "login" ? "Log in to continue." : "Create your account."}
        </p>

        {mode === "signup" && (
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            required
            style={inputStyle}
          />
        )}
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="Email"
          required
          style={inputStyle}
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="Password"
          required
          style={inputStyle}
        />

        {error && (
          <p style={{ color: "var(--danger)", fontSize: 12, marginBottom: 10 }}>{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "10px 0",
            background: "var(--accent)",
            border: "none",
            borderRadius: 8,
            color: "#1a1006",
            fontWeight: 600,
            fontSize: 13,
            marginTop: 4,
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "Please wait…" : mode === "login" ? "Log in" : "Sign up"}
        </button>

        <p style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 16, textAlign: "center" }}>
          {mode === "login" ? "New here?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            style={{
              background: "none",
              border: "none",
              color: "var(--accent)",
              fontSize: 12,
              padding: 0,
            }}
          >
            {mode === "login" ? "Sign up" : "Log in"}
          </button>
        </p>
      </form>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  marginBottom: 10,
  background: "var(--panel-raised)",
  border: "0.5px solid var(--border)",
  borderRadius: 8,
  color: "var(--text-primary)",
  fontSize: 13,
  fontFamily: "var(--font-sans)",
};
