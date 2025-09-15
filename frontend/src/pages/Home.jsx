 
import { useEffect, useMemo, useState } from "react";
import api from "../api/client";
import useAuth from "../store/auth";
import useTheme from "../hooks/useTheme";
import HeaderBar from "../components/HeaderBar";
import Sidebar from "../components/Sidebar";
import Canvas from "../components/Canvas";
import RelationsPanel from "../components/RelationsPanel";

export default function HomePage() {
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // estado principal
  const [classes, setClasses] = useState([]);
  const [name, setName] = useState("");
  const [attrs, setAttrs] = useState([{ nombre: "email", tipo: "string", requerido: true }]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  // relaciones (UI simple)
  const [relMode, setRelMode] = useState(false);           // modo crear relación (clic A → clic B)
  const [relType, setRelType] = useState("ASSOCIATION");   // ASSOCIATION | GENERALIZATION
  const [relA, setRelA] = useState(null);                  // origen (id clase)
  const [relB, setRelB] = useState(null);                  // destino (id clase)
  const [multA, setMultA] = useState("1");
  const [multB, setMultB] = useState("*");

  // demo visual si no hay datos (NO rompe el backend)
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

  async function load() {
    try {
      const { data } = await api.get("/uml/classes");
      setClasses(Array.isArray(data) ? data : []);
    } catch {
      setClasses([]); // fallback a demo
    }
  }
  useEffect(() => { load(); }, []);

  async function createClass() {
    try {
      setLoading(true); setMsg("");
      await api.post("/uml/classes", { nombre: name, atributos: attrs });
      setName(""); setAttrs([{ nombre: "email", tipo: "string", requerido: true }]);
      await load();
      setMsg("Clase creada");
    } catch { setMsg("Error al crear clase"); }
    finally { setLoading(false); }
  }

  function createRelation() {
    // luego: POST /uml/relations con {origen_id: relA, destino_id: relB, tipo: relType, mult_origen: multA, mult_destino: multB}
    // por ahora, solo limpiamos selección para la demo
    setRelA(null); setRelB(null); setRelType("ASSOCIATION"); setMultA("1"); setMultB("*");
  }

  const classesToShow = classes.length ? classes : demoClasses;

  return (
    <div style={{ display: "grid", gridTemplateRows: "88px 1fr", height: "100vh", background: "var(--bg)", color: "var(--text)" }}>
      {/* BLOQUE 1: Header */}
      {/* <HeaderBar onLogout={logout} /> */}
      <HeaderBar onLogout={logout} theme={theme} onToggleTheme={toggleTheme} />

      {/* BLOQUES 2,3,4: Sidebar + Canvas + Relaciones */}
      <div style={{ display: "grid", gridTemplateColumns: "460px 1fr 360px", minHeight: 0 }}>
        {/* BLOQUE 2: Sidebar (crear clase) */}
        <Sidebar
          name={name} setName={setName}
          attrs={attrs} setAttrs={setAttrs}
          loading={loading} msg={msg}
          classes={classesToShow}
          onAddAttr={() => setAttrs(p => [...p, { nombre: "", tipo: "string", requerido: false }])}
          onCreate={createClass}
        />

        {/* BLOQUE 3: Canvas */}
        <main style={{ position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 16, left: 24, color: "var(--text-muted)", fontWeight: 600 }}>Canvas</div>
          <Canvas
            classes={classesToShow}
            relMode={relMode}
            onPickOrigin={(id) => setRelA(id)}
            onPickDest={(id) => setRelB(id)}
          />
        </main>

        {/* BLOQUE 4: Relaciones */}
        <RelationsPanel
          classes={classesToShow}
          relMode={relMode} setRelMode={setRelMode}
          relType={relType} setRelType={setRelType}
          relA={relA} setRelA={setRelA}
          relB={relB} setRelB={setRelB}
          multA={multA} setMultA={setMultA}
          multB={multB} setMultB={setMultB}
          onCreate={createRelation}
        />
      </div>
    </div>
  );
}
