 
// src/pages/DiagramDashboard.jsx
//(orquestador, misma UI/props)
import { useNavigate, useParams } from "react-router-dom";
import useAuth from "../store/auth";
import useTheme from "../hooks/useTheme";

import useDiagram from "../hooks/useDiagram";
import useClassesAndDetails from "../hooks/useClassesAndDetails";

import Sheet from "../components/canvas/Sheet";
import ClassCard from "../components/canvas/ClassCard";
import Inspector from "../components/panels/Inspector";
import HeaderBar from "../components/layout/HeaderBar";
import LeftPanel from "../components/layout/LeftPanel";

export default function DiagramDashboard() {
  const { id } = useParams(); // diagramId
  const nav = useNavigate();
  const logout = useAuth((s) => s.logout);
  const email = useAuth((s) => s.email);
  const { theme, toggleTheme } = useTheme();

  // Diagrama
  const { diagram, loading, err } = useDiagram(id);

  // Clases + detalles (toda la lógica movida, misma firma/efectos)
  const {
    classes, setClasses,
    selectedId, setSelectedId, selected,
    detailsByClass, replaceDetails,
    insertMode, setInsertMode,
    insertName, setInsertName,
    loadClasses, fetchDetails,
    handleCanvasClick,
    debouncedSave, onBlurName,
    handleDragEnd, handleResizeEnd,
    handleDelete,
  } = useClassesAndDetails(diagram);

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
      <HeaderBar
        diagram={diagram}
        email={email}
        theme={theme}
        toggleTheme={toggleTheme}
        insertName={insertName}
        setInsertName={setInsertName}
        insertMode={insertMode}
        setInsertMode={setInsertMode}
        onBack={() => nav("/")}
        onLogout={() => { logout(); nav("/login", { replace: true }); }}
      />

      {/* Layout: Izq | Canvas | Inspector */}
      <div style={{ display: "grid", gridTemplateColumns: "420px 1fr 420px", minHeight: 0 }}>
        <LeftPanel />

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
                // detalles desde el padre (no se auto-cargan en la tarjeta)
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
            await updateClass(selected.id, { name }); // misma acción que antes
            setClasses((prev) => prev.map((x) => (x.id === selected.id ? { ...x, name } : x)));
          }}
          // CRUD de atributos/métodos
          onDetailsChange={(patch) => {
            if (!selected) return;
            replaceDetails(selected.id, patch);
          }}
          // recargar desde servidor
          reloadDetails={() => selected && fetchDetails(selected.id)}
          onDeleteClass={() => selected && handleDelete(selected.id)}
        />
      </div>
    </div>
  );
}
