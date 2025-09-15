import { useState } from "react";
import api from "../api/client";
import useAuth from "../store/auth";
import { useNavigate } from "react-router-dom";
import ApiStatusBadge from "../components/ApiStatusBadge";

export default function LoginPage() {
  const nav = useNavigate();
  const login = useAuth((s) => s.login);
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("changeme123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const { data } = await api.post("/auth/signin", { email, password });
      login(data.access_token);
      nav("/", { replace: true });
    } catch (err) {
      setError(err?.response?.data || "Login fallido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{minHeight:"100vh", display:"grid", placeItems:"center", background:"#0b1020"}}>
      <form onSubmit={onSubmit} style={{
        width: 360, background: "#121829", padding: 24, borderRadius: 12, color:"#fff",
        boxShadow:"0 10px 30px rgba(0,0,0,.3)"
      }}>
        <h2 style={{margin:0, marginBottom:8}}>UML AI Tool</h2>
        <div style={{display:"flex", alignItems:"center", marginBottom:16}}>
          <div style={{opacity:.8}}>Inicia sesión</div>
          <ApiStatusBadge />
        </div>

        <label style={{display:"block", fontSize:12, opacity:.8}}>Email</label>
        <input value={email} onChange={e=>setEmail(e.target.value)}
          style={{width:"100%", padding:10, borderRadius:8, border:"1px solid #334", background:"#0e1526", color:"#fff", marginBottom:12}} />

        <label style={{display:"block", fontSize:12, opacity:.8}}>Password</label>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)}
          style={{width:"100%", padding:10, borderRadius:8, border:"1px solid #334", background:"#0e1526", color:"#fff"}} />

        {error && <div style={{color:"salmon", fontSize:12, marginTop:8}}>{String(error)}</div>}

        <button disabled={loading} style={{
          marginTop:16, width:"100%", padding:10, borderRadius:8, border:"none",
          background:"#4f46e5", color:"#fff", cursor:"pointer", opacity: loading ? .7 : 1
        }}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
