// src/pages/Login.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import useAuth from "../store/auth";
import ApiStatusBadge from "../components/common/ApiStatusBadge";

export default function LoginPage() {
  const nav = useNavigate();
  const { token, login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // estilos compartidos (mismo tamaño en ambos inputs)
  const inputStyle = {
    width: "100%",
    height: 40,
    padding: "0 12px",
    borderRadius: 8,
    border: "1px solid #334",
    background: "#0e1526",
    color: "#fff",
    boxSizing: "border-box",
  };
  const inputWithIconStyle = { ...inputStyle, paddingRight: 44 };

  useEffect(() => {
    if (token) nav("/", { replace: true });
  }, [token, nav]);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/sign-in", { email, password });
      login(data.access_token);
      nav("/", { replace: true });
    } catch (err) {
      setError(err?.response?.data?.detail || "Login fallido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <form onSubmit={onSubmit} style={{ width: 360, padding: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <h2 style={{ margin: 0 }}>Iniciar sesión</h2>
          <ApiStatusBadge />
        </div>

        <label style={{ display: "block", fontSize: 12, marginBottom: 4 }}>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="username"
          style={{ ...inputStyle, marginBottom: 12 }}
        />

        <label style={{ display: "block", fontSize: 12, marginBottom: 4 }}>Password</label>
        <div style={{ position: "relative" }}>
          <input
            type={showPwd ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            style={inputWithIconStyle}
          />
          <button
            type="button"
            onClick={() => setShowPwd((v) => !v)}
            style={{
              position: "absolute",
              right: 8,
              top: "50%",
              transform: "translateY(-50%)",
              border: "none",
              background: "transparent",
              color: "#ccc",
              cursor: "pointer",
              height: 24,
              width: 28,
              lineHeight: "24px",
            }}
            aria-label={showPwd ? "Ocultar contraseña" : "Mostrar contraseña"}
            title={showPwd ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPwd ? "🙈" : "👁️"}
          </button>
        </div>

        {error && <div style={{ color: "crimson", fontSize: 12, marginTop: 8 }}>{error}</div>}

        <button disabled={loading} style={{ marginTop: 16, width: "100%", padding: 10 }}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
