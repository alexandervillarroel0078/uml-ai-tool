
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/client";
import useAuth from "../store/auth";
import useTheme from "../hooks/useTheme";
import {
  listClasses,
  createClass as apiCreateClass,
  updateClass,
  deleteClass as apiDeleteClass,
  updateClassPosition,
  updateClassSize,
} from "../api/classes";
import Sheet from "../components/Sheet";
import ClassCard from "../components/ClassCard";
import Inspector from "../components/Inspector";

function useDebouncedCallback(cb, delay = 600) {
  const t = useRef(null);
  return (...args) => {
    if (t.current) clearTimeout(t.current);
    t.current = setTimeout(() => cb(...args), delay);
  };
}

export default function DiagramDashboard() {
  const { id } = useParams(); // diagramId
  const nav = useNavigate();
  const logout = useAuth((s) => s.logout);
  const email = useAuth((s) => s.email);
  const { theme, toggleTheme } = useTheme();

  const [diagram, setDiagram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [classes, setClasses] = useState([]);    // todas las clases
  const [selectedId, setSelectedId] = useState(null); // clase seleccionada
  const selected = classes.find(c => c.id === selectedId) || null;

  const [savingIds, setSavingIds] = useState(new Set());

  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  const [insertMode, setInsertMode] = useState(false);
  const [insertName, setInsertName] = useState("NuevaClase");

  // cargar diagrama
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true); setErr("");
      try {
        const { data } = await api.get(`/diagrams/${id}`);
        if (!alive) return;
        setDiagram(data);
      } catch (e) {
        if (!alive) return;
        setErr(e?.response?.data?.detail || "No se pudo cargar el diagrama");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id]);

  // cargar clases
  async function loadClasses() {
    try {
      const items = await listClasses(id);
      setClasses(items || []);
      // si se borró la seleccionada, limpiar
      if (selectedId && !items?.some(x => x.id === selectedId)) setSelectedId(null);
    } catch {
      setClasses([]);
      setSelectedId(null);
    }
  }
  useEffect(() => { if (diagram) loadClasses(); /* eslint-disable-next-line */ }, [diagram]);

  // crear por input
  async function performCreate() {
    const name = newName.trim();
    if (!name || creating) return;
    setCreating(true);
    try {
      const c = await apiCreateClass(id, { name, x_grid: 0, y_grid: 0, w_grid: 12, h_grid: 6, z_index: 1 });
      setNewName("");
      await loadClasses();
      setSelectedId(c.id);
    } catch (e) {
      alert(e?.response?.data?.detail || "No se pudo crear la clase");
    } finally {
      setCreating(false);
    }
  }
  function onKeyDownCreate(e) {
    if (e.key === "Enter") { e.preventDefault(); performCreate(); }
  }

  // crear por click en hoja (modo insertar)
  async function handleCanvasClick({ x_grid, y_grid }) {
    if (!insertMode) return;
    try {
      const c = await apiCreateClass(id, {
        name: insertName.trim() || "NuevaClase",
        x_grid, y_grid, w_grid: 12, h_grid: 6, z_index: 1,
      });
      await loadClasses();
      setSelectedId(c.id);
    } catch (e) {
      alert(e?.response?.data?.detail || "No se pudo crear la clase");
    } finally {
      setInsertMode(false);
    }
  }

  // rename (sidebar lista) — opcional si lo mantienes ahí
  const debouncedSave = useDebouncedCallback(async (classId, name) => {
    try {
      setSavingIds((prev) => new Set(prev).add(classId));
      await updateClass(classId, { name });
      setClasses((prev) => prev.map((c) => (c.id === classId ? { ...c, name } : c)));
    } finally {
      setSavingIds((prev) => { const n = new Set(prev); n.delete(classId); return n; });
    }
  }, 600);

  async function onBlurName(classId, value) {
    await updateClass(classId, { name: value });
  }

  // drag/resize
  async function handleDragEnd(classId, { x_grid, y_grid }) {
    try {
      await updateClassPosition(classId, { x_grid, y_grid });
      setClasses((prev) => prev.map((c) => (c.id === classId ? { ...c, x_grid, y_grid } : c)));
    } catch (e) {
      alert(e?.response?.data?.detail || "No se pudo mover la clase");
      await loadClasses();
    }
  }
  async function handleResizeEnd(classId, { w_grid, h_grid }) {
    try {
      await updateClassSize(classId, { w_grid, h_grid });
      setClasses((prev) => prev.map((c) => (c.id === classId ? { ...c, w_grid, h_grid } : c)));
    } catch (e) {
      alert(e?.response?.data?.detail || "No se pudo redimensionar la clase");
      await loadClasses();
    }
  }

  // eliminar
  async function handleDelete(classId) {
    if (!confirm("¿Eliminar esta clase?")) return;
    try {
      await apiDeleteClass(classId);
      setClasses((prev) => prev.filter((c) => c.id !== classId));
      if (selectedId === classId) setSelectedId(null);
    } catch (e) {
      alert(e?.response?.data?.detail || "No se pudo eliminar");
    }
  }

  if (loading) return <div style={{ padding: 16 }}>Cargando…</div>;
  if (err) {
    return (
      <div style={{ padding: 16 }}>
        <div style={{ marginBottom: 8, color: "salmon" }}>{err}</div>
        <button onClick={() => nav("/")} style={{ padding: "6px 10px" }}>Volver</button>
      </div>
    );
  }
  if (!diagram) return null;

  const input = {
    width: "100%", height: 36, padding: "0 10px",
    borderRadius: 8, border: "1px solid #334", background: "#0e1526",
    color: "#fff", boxSizing: "border-box",
  };

  return (
    <div style={{ display: "grid", gridTemplateRows: "64px 1fr", height: "100vh", background: "var(--bg, #0b1020)", color: "var(--text, #eaeefb)" }}>
      {/* Header */}
      <header style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 16px", borderBottom: "1px solid #213", background: "rgba(0,0,0,.15)" }}>
        <button onClick={() => nav("/")} style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #334", background: "transparent", color: "inherit" }}>
          ← Volver
        </button>
        <strong style={{ fontSize: 16 }}>{diagram.title}</strong>
        <span style={{ fontSize: 12, opacity: .8 }}>ID: {diagram.id}</span>
        <span style={{ fontSize: 12, opacity: .8, marginLeft: 8 }}>Actualizado: {new Date(diagram.updated_at).toLocaleString()}</span>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          <input
            value={insertName}
            onChange={(e) => setInsertName(e.target.value)}
            placeholder="Nombre a insertar"
            style={{ ...input, width: 180, height: 32 }}
          />
          <button
            onClick={() => setInsertMode(v => !v)}
            style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #334", background: insertMode ? "#334" : "transparent", color: "inherit", fontWeight: 600 }}
            title="Modo insertar: click en la hoja crea una clase"
          >
            {insertMode ? "🟢 Insertando…" : "➕ Insertar clase"}
          </button>
          <span style={{ fontSize: 12, opacity: .8 }}>{email}</span>
          <button onClick={toggleTheme} style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #334", background: "transparent", color: "inherit" }}>
            {theme === "dark" ? "🌙" : "☀️"}
          </button>
          <button onClick={() => { logout(); nav("/login", { replace: true }); }} style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #334", background: "transparent", color: "inherit" }}>
            Salir
          </button>
        </div>
      </header>

      {/* Cuerpo: lista izq | canvas centro | inspector der */}
      <div style={{ display: "grid", gridTemplateColumns: "420px 1fr 420px", minHeight: 0 }}>
        {/* Lista + crear (izquierda) */}
        <aside style={{ borderRight: "1px solid #213", padding: 16, overflow: "auto" }}>
          <h3 style={{ marginTop: 0 }}>Clases</h3>

          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, opacity: .8, display: "block", marginBottom: 4 }}>Nueva clase</label>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={onKeyDownCreate}
              onBlur={performCreate}
              placeholder="Escribe el nombre y Enter"
              disabled={creating}
              style={input}
            />
          </div>

          {classes.length === 0 ? (
            <div style={{ opacity: .7, fontSize: 14 }}>No hay clases todavía.</div>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8 }}>
              {classes.map((c) => (
                <li
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  style={{
                    border: "1px solid #334",
                    borderRadius: 8,
                    padding: 12,
                    background: c.id === selectedId ? "rgba(100,150,255,.08)" : "transparent",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <div style={{ flex: 1, position: "relative" }}>
                      <input
                        value={c.name ?? c.nombre ?? ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setClasses((prev) => prev.map((x) => (x.id === c.id ? { ...x, name: val } : x)));
                          debouncedSave(c.id, val);
                        }}
                        onBlur={(e) => onBlurName(c.id, e.target.value)}
                        style={{ ...input, paddingRight: 70 }}
                      />
                      {savingIds.has(c.id) && (
                        <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 12, opacity: .7 }}>
                          guardando…
                        </span>
                      )}
                    </div>
                    <button
                      title="Eliminar"
                      onClick={(ev) => { ev.stopPropagation(); handleDelete(c.id); }}
                      style={{ border: "1px solid #334", background: "transparent", color: "inherit", borderRadius: 8, padding: "6px 10px" }}
                    >
                      🗑️
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </aside>

        {/* Canvas (centro) */}
        <main style={{ position: "relative" }}>
          <Sheet onCanvasClick={handleCanvasClick}>
            {classes.map((c) => (
              <ClassCard
                key={c.id}
                cls={c}
                selected={c.id === selectedId}
                onSelect={setSelectedId}
                onDragEnd={handleDragEnd}
                onResizeEnd={handleResizeEnd}
              />
            ))}
          </Sheet>
          {insertMode && (
            <div style={{ position: "absolute", left: 12, top: 12, background: "rgba(20,120,20,.15)", border: "1px solid #2b6", color: "#bfeecb", padding: "6px 10px", borderRadius: 8, fontSize: 12 }}>
              Modo insertar: click en la hoja crea “{insertName || "NuevaClase"}”
            </div>
          )}
        </main>

        {/* Inspector (derecha) */}
        <Inspector
          selected={selected}
          onSoftUpdate={(patch) => {
            if (!patch?.id) return;
            setClasses((prev) => prev.map((x) => (x.id === patch.id ? { ...x, ...patch } : x)));
          }}
        />
      </div>
    </div>
  );
}
