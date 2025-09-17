 
// src/pages/DiagramDashboard.jsx
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
  listAttributes,
  listMethods,
} from "../api/classes";

import Sheet from "../components/canvas/Sheet";
import ClassCard from "../components/canvas/ClassCard";
import Inspector from "../components/panels/Inspector";

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

  // Diagrama
  const [diagram, setDiagram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Clases (position/size/name)
  const [classes, setClasses] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const selected = classes.find((c) => c.id === selectedId) || null;

  // Cache centralizado de detalles por clase
  // { [classId]: { attrs: [...], meths: [...] } }
  const [detailsByClass, setDetailsByClass] = useState({});

  // Crear por click
  const [insertMode, setInsertMode] = useState(false);
  const [insertName, setInsertName] = useState("NuevaClase");

  // ====== CARGA DIAGRAMA ======
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setErr("");
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
    return () => {
      alive = false;
    };
  }, [id]);

  // ====== CARGA CLASES ======
  async function loadClasses() {
    try {
      const items = await listClasses(id);
      setClasses(items || []);
      if (selectedId && !items?.some((x) => x.id === selectedId)) setSelectedId(null);
    // Cargar detalles de todas las clases si faltan
    await Promise.all(
      (items || []).map(c =>
        detailsByClass[c.id]
          ? Promise.resolve()
          : fetchDetails(c.id)  // ya tienes esta función en el mismo archivo
      )
    );
    
    
    
    } catch {
      setClasses([]);
      setSelectedId(null);
    }
  }
  useEffect(() => {
    if (diagram) loadClasses();
    // eslint-disable-next-line
  }, [diagram]);

  // ====== CARGA DETALLES (attrs/meths) ======
  async function fetchDetails(classId) {
    if (!classId) return;
    try {
      const [a, m] = await Promise.all([listAttributes(classId), listMethods(classId)]);
      setDetailsByClass((prev) => ({ ...prev, [classId]: { attrs: a || [], meths: m || [] } }));
    } catch {
      setDetailsByClass((prev) => ({ ...prev, [classId]: { attrs: [], meths: [] } }));
    }
  }

  // Cargar detalles de la clase seleccionada si no los tenemos
  useEffect(() => {
    if (!selectedId) return;
    if (!detailsByClass[selectedId]) {
      fetchDetails(selectedId);
    }
  }, [selectedId, detailsByClass]);

  // Helper para reemplazar detalles (lo usan hijos)
  function replaceDetails(classId, patch) {
    setDetailsByClass((prev) => ({
      ...prev,
      [classId]: { ...(prev[classId] || { attrs: [], meths: [] }), ...patch },
    }));
  }

  // ====== CREAR CLASE POR CLICK EN HOJA ======
  async function handleCanvasClick({ x_grid, y_grid }) {
    if (!insertMode) return;
    try {
      const c = await apiCreateClass(id, {
        name: insertName.trim() || "NuevaClase",
        x_grid,
        y_grid,
        w_grid: 12,
        h_grid: 6,
        z_index: 1,
      });
      await loadClasses();
      setSelectedId(c.id);
      // crea detalles vacíos inicialmente
      replaceDetails(c.id, { attrs: [], meths: [] });
    } catch (e) {
      alert(e?.response?.data?.detail || "No se pudo crear la clase");
    } finally {
      setInsertMode(false);
    }
  }

  // ====== RENAME (si editas desde la lista izquierda, si la tuvieras) ======
  const debouncedSave = useDebouncedCallback(async (classId, name) => {
    await updateClass(classId, { name });
    setClasses((prev) => prev.map((c) => (c.id === classId ? { ...c, name } : c)));
  }, 600);

  async function onBlurName(classId, value) {
    await updateClass(classId, { name: value });
  }

  // ====== DRAG/RESIZE ======
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

  // ====== ELIMINAR CLASE ======
  async function handleDelete(classId) {
    if (!confirm("¿Eliminar esta clase?")) return;
    try {
      await apiDeleteClass(classId);
      setClasses((prev) => prev.filter((c) => c.id !== classId));
      setDetailsByClass((prev) => {
        const n = { ...prev };
        delete n[classId];
        return n;
      });
      if (selectedId === classId) setSelectedId(null);
    } catch (e) {
      alert(e?.response?.data?.detail || "No se pudo eliminar");
    }
  }

  // ====== UI ======
  if (loading) return <div style={{ padding: 16 }}>Cargando…</div>;
  if (err) {
    return (
      <div style={{ padding: 16 }}>
        <div style={{ marginBottom: 8, color: "salmon" }}>{err}</div>
        <button onClick={() => nav("/")} style={{ padding: "6px 10px" }}>
          Volver
        </button>
      </div>
    );
  }
  if (!diagram) return null;

  const input = {
    width: "100%",
    height: 32,
    padding: "0 10px",
    borderRadius: 8,
    border: "1px solid #334",
    background: "#0e1526",
    color: "#fff",
    boxSizing: "border-box",
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateRows: "64px 1fr",
        height: "100vh",
        background: "var(--bg, #0b1020)",
        color: "var(--text, #eaeefb)",
      }}
    >
      {/* Header */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "0 16px",
          borderBottom: "1px solid #213",
          background: "rgba(0,0,0,.15)",
        }}
      >
        <button
          onClick={() => nav("/")}
          style={{
            padding: "6px 10px",
            borderRadius: 8,
            border: "1px solid #334",
            background: "transparent",
            color: "inherit",
          }}
        >
          ← Volver
        </button>
        <strong style={{ fontSize: 16 }}>{diagram.title}</strong>
        <span style={{ fontSize: 12, opacity: 0.8 }}>ID: {diagram.id}</span>
        <span style={{ fontSize: 12, opacity: 0.8, marginLeft: 8 }}>
          Actualizado: {new Date(diagram.updated_at).toLocaleString()}
        </span>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          <input
            value={insertName}
            onChange={(e) => setInsertName(e.target.value)}
            placeholder="Nombre a insertar"
            style={{ ...input, width: 180 }}
          />
          <button
            onClick={() => setInsertMode((v) => !v)}
            style={{
              padding: "6px 10px",
              borderRadius: 8,
              border: "1px solid #334",
              background: insertMode ? "#334" : "transparent",
              color: "inherit",
              fontWeight: 600,
            }}
            title="Modo insertar: click en la hoja crea una clase"
          >
            {insertMode ? "🟢 Insertando…" : "➕ Insertar clase"}
          </button>
          <span style={{ fontSize: 12, opacity: 0.8 }}>{email}</span>
          <button
            onClick={toggleTheme}
            style={{
              padding: "6px 10px",
              borderRadius: 8,
              border: "1px solid #334",
              background: "transparent",
              color: "inherit",
            }}
          >
            {theme === "dark" ? "🌙" : "☀️"}
          </button>
          <button
            onClick={() => {
              logout();
              nav("/login", { replace: true });
            }}
            style={{
              padding: "6px 10px",
              borderRadius: 8,
              border: "1px solid #334",
              background: "transparent",
              color: "inherit",
            }}
          >
            Salir
          </button>
        </div>
      </header>

      {/* Layout: Izq | Canvas | Inspector */}
      <div style={{ display: "grid", gridTemplateColumns: "420px 1fr 420px", minHeight: 0 }}>
        {/* Izquierdo (puedes poner tu lista/crear) */}
        <aside style={{ borderRight: "1px solid #213", padding: 16, overflow: "auto" }}>
          <h3 style={{ marginTop: 0 }}>Panel Izquierdo</h3>
          {/* Tu lista o herramientas aquí */}
        </aside>

        {/* Canvas */}
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
                // NUEVO: detalles desde el padre (no se auto-cargan en la tarjeta)
                details={detailsByClass[c.id]} // {attrs, meths} o undefined
                alwaysShowDetails={true}
              />
            ))}
          </Sheet>

          {insertMode && (
            <div
              style={{
                position: "absolute",
                left: 12,
                top: 12,
                background: "rgba(20,120,20,.15)",
                border: "1px solid #2b6",
                color: "#bfeecb",
                padding: "6px 10px",
                borderRadius: 8,
                fontSize: 12,
              }}
            >
              Modo insertar: click crea “{insertName || "NuevaClase"}”
            </div>
          )}
        </main>

        {/* Inspector (derecha) */}
        <Inspector
          selected={selected}
          details={selected ? detailsByClass[selected.id] : undefined}
          // renombrar clase
          onRename={async (name) => {
            if (!selected) return;
            await updateClass(selected.id, { name });
            setClasses((prev) => prev.map((x) => (x.id === selected.id ? { ...x, name } : x)));
          }}
          // CRUD de atributos/métodos: el inspector llama API y luego nos pasa el estado nuevo
          onDetailsChange={(patch) => {
            if (!selected) return;
            replaceDetails(selected.id, patch);
          }}
          // (Opcional) recargar desde servidor (para “confirmar” normalizaciones)
          reloadDetails={() => selected && fetchDetails(selected.id)}
          onDeleteClass={() => selected && handleDelete(selected.id)}
        />
      </div>
    </div>
  );
}
