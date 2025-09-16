// src/pages/DiagramDashboard.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/client";
import useAuth from "../store/auth";
import useTheme from "../hooks/useTheme";

// (Si ya tienes estos componentes reales, descomenta y usa esos)
// import HeaderBar from "../components/HeaderBar";
// import Sidebar from "../components/Sidebar";
// import Canvas from "../components/Canvas";
// import RelationsPanel from "../components/RelationsPanel";

export default function DiagramDashboard() {
  const { id } = useParams();
  const nav = useNavigate();
  const logout = useAuth(s => s.logout);
  const email  = useAuth(s => s.email);
  const { theme, toggleTheme } = useTheme();

  // Diagrama
  const [diagram, setDiagram] = useState(null);
  const [loadingDiagram, setLoadingDiagram] = useState(true);
  const [err, setErr] = useState("");

  // Estado de clases/relaciones (placeholder por ahora)
  const [classes, setClasses] = useState([]);
  const [name, setName] = useState("");
  const [attrs, setAttrs] = useState([{ nombre: "email", tipo: "string", requerido: true }]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  // Relaciones (UI simple/placeholder)
  const [relMode, setRelMode] = useState(false);
  const [relType, setRelType] = useState("ASSOCIATION");
  const [relA, setRelA] = useState(null);
  const [relB, setRelB] = useState(null);
  const [multA, setMultA] = useState("1");
  const [multB, setMultB] = useState("*");

  // Demo visual si no hay datos (no rompe backend)
  const demoClasses = useMemo(() => ([
    {
      id: 1, nombre: "Usuario", atributos: [
        { nombre: "email", tipo: "string", requerido: true },
        { nombre: "passwordHash", tipo: "string", requerido: true },
      ]
    },
    {
      id: 2, nombre: "Proyecto", atributos: [
        { nombre: "titulo", tipo: "string", requerido: true },
        { nombre: "descripcion", tipo: "string", requerido: false },
      ]
    },
    {
      id: 3, nombre: "Tarea", atributos: [
        { nombre: "titulo", tipo: "string", requerido: true },
        { nombre: "estado", tipo: "string", requerido: true },
      ]
    },
  ]), []);

  // Cargar diagrama
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoadingDiagram(true); setErr("");
      try {
        const { data } = await api.get(`/diagrams/${id}`);
        if (alive) setDiagram(data);
      } catch (e) {
        if (alive) setErr(e?.response?.data?.detail || "No se pudo cargar el diagrama");
      } finally {
        if (alive) setLoadingDiagram(false);
      }
    })();
    return () => { alive = false; };
  }, [id]);

  // Cargar clases del diagrama (cuando tengamos endpoint real)
  async function loadClasses() {
    // TODO: conecta a GET /diagrams/:id/classes cuando exista.
    // Por ahora mostramos demo para no romper UI:
    setClasses(demoClasses);
  }
  useEffect(() => { if (diagram) loadClasses(); /* eslint-disable-next-line */ }, [diagram]);

  // Crear clase (placeholder: solo refresca demo/estado local)
  async function createClass() {
    try {
      setLoading(true); setMsg("");
      // TODO: POST /diagrams/:id/classes con { nombre, atributos }
      // await api.post(`/diagrams/${diagram.id}/classes`, { nombre: name, atributos: attrs });
      // await loadClasses();
      // Demo: actualiza local:
      const tmp = {
        id: Math.random().toString(36).slice(2),
        nombre: name || "NuevaClase",
        atributos: attrs,
      };
      setClasses(prev => [tmp, ...prev]);
      setName("");
      setAttrs([{ nombre: "email", tipo: "string", requerido: true }]);
      setMsg("Clase creada (demo)");
    } catch {
      setMsg("Error al crear clase");
    } finally {
      setLoading(false);
    }
  }

  // Crear relación (placeholder)
  function createRelation() {
    // TODO: POST /diagrams/:id/relations con { origen_id, destino_id, tipo, mult_origen, mult_destino }
    setRelA(null); setRelB(null); setRelType("ASSOCIATION"); setMultA("1"); setMultB("*");
    setMsg("Relación creada (demo)");
  }

  const classesToShow = classes.length ? classes : demoClasses;

  if (loadingDiagram) return <div style={{ padding: 16 }}>Cargando…</div>;
  if (err) return (
    <div style={{ padding: 16 }}>
      <div style={{ marginBottom: 8, color: "salmon" }}>{err}</div>
      <button onClick={() => nav("/")} style={{ padding: "6px 10px" }}>Volver</button>
    </div>
  );
  if (!diagram) return null;

  return (
    <div style={{ display: "grid", gridTemplateRows: "64px 1fr", height: "100vh", background: "var(--bg, #0b1020)", color: "var(--text, #eaeefb)" }}>
      {/* HEADER (simple inline para no depender de HeaderBar ahora) */}
      <header style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 16px", borderBottom: "1px solid #213", background: "rgba(0,0,0,.15)" }}>
        <button onClick={() => nav("/")} style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #334", background: "transparent", color: "inherit" }}>
          ← Volver
        </button>
        <strong style={{ fontSize: 16 }}>{diagram.title}</strong>
        <span style={{ fontSize: 12, opacity: .8 }}>ID: {diagram.id}</span>
        <span style={{ fontSize: 12, opacity: .8, marginLeft: 8 }}>
          Actualizado: {new Date(diagram.updated_at).toLocaleString()}
        </span>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 12, opacity: .8 }}>{email}</span>
          <button onClick={toggleTheme} style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #334", background: "transparent", color: "inherit" }}>
            {theme === "dark" ? "🌙" : "☀️"}
          </button>
          <button onClick={() => { logout(); nav("/login", { replace: true }); }} style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #334", background: "transparent", color: "inherit" }}>
            Salir
          </button>
        </div>
      </header>

      {/* 3 columnas: Sidebar (crear clase) | Canvas | Relaciones */}
      <div style={{ display: "grid", gridTemplateColumns: "460px 1fr 360px", minHeight: 0 }}>
        {/* Sidebar — crear clase (placeholder) */}
        <aside style={{ borderRight: "1px solid #213", padding: 16, overflow: "auto" }}>
          <h3 style={{ marginTop: 0 }}>Clases</h3>

          <div style={{ border: "1px solid #334", borderRadius: 12, padding: 12, marginBottom: 12 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Nueva clase</div>
            <label style={{ fontSize: 12, opacity: .8 }}>Nombre</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Usuario"
              style={{
                width: "100%", height: 36, padding: "0 10px", borderRadius: 8, border: "1px solid #334",
                background: "#0e1526", color: "#fff", boxSizing: "border-box", marginBottom: 8
              }}
            />
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <button
                type="button"
                onClick={() => setAttrs(p => [...p, { nombre: "", tipo: "string", requerido: false }])}
                style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #334", background: "transparent", color: "inherit" }}
              >
                + atributo
              </button>
              <button
                type="button"
                onClick={createClass}
                disabled={loading}
                style={{ padding: "6px 10px", borderRadius: 8, border: "none", background: "#4f46e5", color: "#fff" }}
              >
                {loading ? "Creando…" : "Crear clase"}
              </button>
            </div>

            {/* Lista simple de atributos (placeholder) */}
            <div style={{ display: "grid", gap: 6 }}>
              {attrs.map((a, idx) => (
                <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 8 }}>
                  <input
                    value={a.nombre}
                    onChange={e => setAttrs(prev => prev.map((x, i) => i === idx ? { ...x, nombre: e.target.value } : x))}
                    placeholder="nombre"
                    style={{ height: 32, padding: "0 8px", borderRadius: 8, border: "1px solid #334", background: "#0e1526", color: "#fff" }}
                  />
                  <input
                    value={a.tipo}
                    onChange={e => setAttrs(prev => prev.map((x, i) => i === idx ? { ...x, tipo: e.target.value } : x))}
                    placeholder="tipo (string, int...)"
                    style={{ height: 32, padding: "0 8px", borderRadius: 8, border: "1px solid #334", background: "#0e1526", color: "#fff" }}
                  />
                  <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                    <input
                      type="checkbox"
                      checked={!!a.requerido}
                      onChange={e => setAttrs(prev => prev.map((x, i) => i === idx ? { ...x, requerido: e.target.checked } : x))}
                    />
                    requerido
                  </label>
                </div>
              ))}
            </div>
          </div>

          {msg && <div style={{ fontSize: 12, opacity: .85, marginBottom: 8 }}>{msg}</div>}

          {/* Lista de clases (del diagrama) */}
          <div style={{ display: "grid", gap: 8 }}>
            {classesToShow.map(c => (
              <div key={c.id} style={{ border: "1px solid #334", borderRadius: 8, padding: 10 }}>
                <div style={{ fontWeight: 600 }}>{c.nombre}</div>
                <ul style={{ margin: "6px 0 0", paddingLeft: 16 }}>
                  {c.atributos?.map((at, i) => (
                    <li key={i} style={{ fontSize: 12, opacity: .85 }}>
                      {at.nombre}: {at.tipo}{at.requerido ? " *" : ""}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </aside>

        {/* Canvas (placeholder visual) */}
        <main style={{ position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 16, left: 24, color: "var(--text-muted, #9aa4c7)", fontWeight: 600 }}>
            Canvas (placeholder)
          </div>
          <div style={{ height: "100%", display: "grid", placeItems: "center", opacity: .6 }}>
            Aquí renderizaremos nodos/clases y relaciones del diagrama.
          </div>
        </main>

        {/* Relaciones (placeholder) */}
        <aside style={{ borderLeft: "1px solid #213", padding: 16, overflow: "auto" }}>
          <h3 style={{ marginTop: 0 }}>Relaciones</h3>

          <div style={{ border: "1px solid #334", borderRadius: 12, padding: 12 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Nueva relación</div>

            <label style={{ fontSize: 12, opacity: .8 }}>Tipo</label>
            <select
              value={relType}
              onChange={e => setRelType(e.target.value)}
              style={{ width: "100%", height: 36, borderRadius: 8, border: "1px solid #334", background: "#0e1526", color: "#fff", marginBottom: 8 }}
            >
              <option>ASSOCIATION</option>
              <option>AGGREGATION</option>
              <option>COMPOSITION</option>
              <option>INHERITANCE</option>
              <option>DEPENDENCY</option>
            </select>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
              <div>
                <label style={{ fontSize: 12, opacity: .8 }}>Desde</label>
                <select
                  value={relA ?? ""}
                  onChange={e => setRelA(e.target.value || null)}
                  style={{ width: "100%", height: 36, borderRadius: 8, border: "1px solid #334", background: "#0e1526", color: "#fff" }}
                >
                  <option value="">(elige clase)</option>
                  {classesToShow.map(c => <option value={c.id} key={c.id}>{c.nombre}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, opacity: .8 }}>Hacia</label>
                <select
                  value={relB ?? ""}
                  onChange={e => setRelB(e.target.value || null)}
                  style={{ width: "100%", height: 36, borderRadius: 8, border: "1px solid #334", background: "#0e1526", color: "#fff" }}
                >
                  <option value="">(elige clase)</option>
                  {classesToShow.map(c => <option value={c.id} key={c.id}>{c.nombre}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
              <input
                value={multA}
                onChange={e => setMultA(e.target.value)}
                placeholder="mult origen (1, *, 1..*)"
                style={{ height: 36, borderRadius: 8, border: "1px solid #334", background: "#0e1526", color: "#fff", padding: "0 10px" }}
              />
              <input
                value={multB}
                onChange={e => setMultB(e.target.value)}
                placeholder="mult destino"
                style={{ height: 36, borderRadius: 8, border: "1px solid #334", background: "#0e1526", color: "#fff", padding: "0 10px" }}
              />
            </div>

            <button
              type="button"
              onClick={createRelation}
              style={{ padding: "8px 12px", borderRadius: 8, border: "none", background: "#4f46e5", color: "#fff" }}
            >
              Crear relación
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
