// //archivo: frontend/src/pages/DiagramDashboard.jsx
// // (orquestador, misma UI/props)
// import { useEffect, useState } from "react";
// import { listRelations, createRelation } from "../api/relations";
// import { hitTestClasses, inferClosestSide } from "../components/canvas/utils/geometry";

// import { useNavigate, useParams } from "react-router-dom";
// import useAuth from "../store/auth";
// import useTheme from "../hooks/useTheme";

// import useDiagram from "../hooks/useDiagram";
// import useClassesAndDetails from "../hooks/useClassesAndDetails";

// import Sheet from "../components/canvas/Sheet";
// import ClassCard from "../components/canvas/ClassCard";
// import Inspector from "../components/panels/Inspector";
// import HeaderBar from "../components/layout/HeaderBar";
// import LeftPanel from "../components/layout/LeftPanel";

// // Capa de conexiones
// import ConnectionLayer from "../components/canvas/ConnectionLayer";

// export default function DiagramDashboard() {
//   const { id } = useParams(); // diagramId
//   const nav = useNavigate();
//   const logout = useAuth((s) => s.logout);
//   const email = useAuth((s) => s.email);
//   const { theme, toggleTheme } = useTheme();
// const [camera, setCamera] = useState({ x: 0, y: 0, z: 1 });
//   // Diagrama
//   const { diagram, loading, err } = useDiagram(id);

//   // Relaciones persistidas
//   const [relations, setRelations] = useState([]);

//   // Clases + detalles
//   const {
//     classes, setClasses,
//     selectedId, setSelectedId, selected,
//     detailsByClass, replaceDetails,
//     insertMode, setInsertMode,
//     insertName, setInsertName,
//     loadClasses, fetchDetails,
//     handleCanvasClick,
//     debouncedSave, onBlurName,
//     handleDragEnd, handleResizeEnd,
//     handleDelete,
//   } = useClassesAndDetails(diagram);

//   // Linking temporal (línea elástica)
//   // linking = { fromId, fromSide, cursor:{x,y} } | null
//   const [linking, setLinking] = useState(null);

//   // Cargar relaciones
//   useEffect(() => {
//     if (!diagram) return;
//     (async () => {
//       try {
//         const items = await listRelations(diagram.id);
//         setRelations(items || []);
//       } catch {
//         setRelations([]);
//       }
//     })();
//   }, [diagram]);

//   // listeners globales de mouse mientras esté linking
//   useEffect(() => {
//     if (!linking) return;

//     // hit-test por DOM (detecta data-class-id incluso sobre puertos)
//     const hitTestByDom = (pt) => {
//       const stack = document.elementsFromPoint(pt.x, pt.y) || [];
//       const el = stack.find((n) => n?.getAttribute && n.getAttribute("data-class-id"));
//       if (el) {
//         const raw = el.getAttribute("data-class-id");
//         return raw ? Number(raw) : null;
//       }
//       return null;
//     };

//     const onMove = (e) => {
//       setLinking((prev) => (prev ? { ...prev, cursor: { x: e.clientX, y: e.clientY } } : prev));
//     };

//     const onUp = async (e) => {
//       const pt = { x: e.clientX, y: e.clientY };

//       // 1) Primero DOM
//       let toId = hitTestByDom(pt);
//       // 2) Si no encontró, por rect (con margen)
//       if (!toId) {
//         toId = hitTestClasses(pt, classes);
//       }

//       if (toId && toId !== linking.fromId) {
//         const dstSide = inferClosestSide(toId, pt);
//         try {
//           const r = await createRelation(diagram.id, {
//             from_class: linking.fromId,
//             to_class: toId,
//             type: "ASSOCIATION",
//             src_anchor: linking.fromSide,
//             dst_anchor: dstSide,
//           });
//           setRelations((prev) => [...prev, r]);
//         } catch (err) {
//           alert(err?.response?.data?.detail || "No se pudo crear la relación");
//         }
//       }
//       setLinking(null);
//     };

//     // Usa captura para que no se pierda por stopPropagation en niños
//     window.addEventListener("mousemove", onMove, true);
//     window.addEventListener("mouseup", onUp, true);
//     return () => {
//       window.removeEventListener("mousemove", onMove, true);
//       window.removeEventListener("mouseup", onUp, true);
//     };
//     // deps: linking activo + clases/diagram para no cerrar stale
//   }, [linking, classes, diagram?.id]);

//   // ====== UI ======
//   if (loading) return <div style={{ padding: 16 }}>Cargando…</div>;
//   if (err) {
//     return (
//       <div style={{ padding: 16 }}>
//         <div style={{ marginBottom: 8, color: "salmon" }}>{err}</div>
//         <button onClick={() => nav("/")} style={{ padding: "6px 10px" }}>
//           Volver
//         </button>
//       </div>
//     );
//   }
//   if (!diagram) return null;

//   return (
//     <div
//       style={{
//         display: "grid",
//         gridTemplateRows: "64px 1fr",
//         height: "100vh",
//         background: "var(--bg, #0b1020)",
//         color: "var(--text, #eaeefb)",
//       }}
//     >
//       <HeaderBar
//         diagram={diagram}
//         email={email}
//         theme={theme}
//         toggleTheme={toggleTheme}
//         insertName={insertName}
//         setInsertName={setInsertName}
//         insertMode={insertMode}
//         setInsertMode={setInsertMode}
//         onBack={() => nav("/")}
//         onLogout={() => { logout(); nav("/login", { replace: true }); }}
//       />

//       {/* Layout: Izq | Canvas | Inspector */}
//       <div style={{ display: "grid", gridTemplateColumns: "420px 1fr 420px", minHeight: 0 }}>
//         <LeftPanel />

//         {/* Canvas */}
//         {/* <main style={{ position: "relative" }}>
//           <Sheet onCanvasClick={handleCanvasClick}>
//             {classes.map((c) => (
//               <ClassCard
//                 key={c.id}
//                 cls={c}
//                 selected={c.id === selectedId}
//                 onSelect={setSelectedId}
//                 onDragEnd={handleDragEnd}
//                 onResizeEnd={handleResizeEnd}
//                 details={detailsByClass[c.id]} // {attrs, meths} o undefined
//                 alwaysShowDetails={true}

//                 // ✅ puertos visibles en hover
//                 showLinkPortsOnHover={true}
//                 // ✅ durante linking, forzar puertos visibles en destinos
//                 forceShowPorts={!!linking && c.id !== linking?.fromId}

//                 // iniciar linking desde puerto
//                 onStartLink={(fromId, side, pt) => {
//                   setLinking({ fromId, fromSide: side, cursor: pt });
//                 }}
//               />
//             ))}
//           </Sheet>

           
//           <ConnectionLayer
//             classes={classes}
//             tempLink={
//               linking ? { fromId: linking.fromId, fromSide: linking.fromSide, cursor: linking.cursor } : null
//             }
//             relations={relations}
//             camera={camera}
//           />

//           {insertMode && (
//             <div
//               style={{
//                 position: "absolute",
//                 left: 12,
//                 top: 12,
//                 background: "rgba(20,120,20,.15)",
//                 border: "1px solid #2b6",
//                 color: "#bfeecb",
//                 padding: "6px 10px",
//                 borderRadius: 8,
//                 fontSize: 12,
//               }}
//             >
//               Modo insertar: click crea “{insertName || "NuevaClase"}”
//             </div>
//           )}
//         </main> */}
//     <main style={{ position: "relative" }}>
//       {/* ⬇️ pasa el callback para que Sheet te avise cada cambio */}
//       <Sheet onCanvasClick={handleCanvasClick} onCameraChange={setCamera}>
//         {classes.map((c) => (
//           <ClassCard
//             key={c.id}
//             cls={c}
//             selected={c.id === selectedId}
//             onSelect={setSelectedId}
//             onDragEnd={handleDragEnd}
//             onResizeEnd={handleResizeEnd}
//             details={detailsByClass[c.id]}
//             alwaysShowDetails={true}
//             showLinkPortsOnHover={true}
//             forceShowPorts={!!linking && c.id !== linking?.fromId}
//             onStartLink={(fromId, side, pt) => {
//               setLinking({ fromId, fromSide: side, cursor: pt });
//             }}
//           />
//         ))}
//       </Sheet>

//       <ConnectionLayer
//         classes={classes}
//         tempLink={
//           linking
//             ? { fromId: linking.fromId, fromSide: linking.fromSide, cursor: linking.cursor }
//             : null
//         }
//         relations={relations}
//         camera={camera}   // ⬅️ esto hace re-render cuando cambia la cámara
//       />
//       {/* ... */}
//     </main>
//         {/* Inspector (derecha) */}
//         <Inspector
//           selected={selected}
//           details={selected ? detailsByClass[selected.id] : undefined}
//           onRename={async (name) => {
//             if (!selected) return;
//             setClasses((prev) => prev.map((x) => (x.id === selected.id ? { ...x, name } : x)));
//           }}
//           onDetailsChange={(patch) => {
//             if (!selected) return;
//             replaceDetails(selected.id, patch);
//           }}
//           reloadDetails={() => selected && fetchDetails(selected.id)}
//           onDeleteClass={() => selected && handleDelete(selected.id)}
//         />
//       </div>
//     </div>
//   );
// }
// (orquestador)
import { useEffect, useState } from "react";
import { listRelations, createRelation } from "../api/relations";
import { hitTestClasses, inferClosestSide } from "../components/canvas/utils/geometry";

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
import ConnectionLayer from "../components/canvas/ConnectionLayer";

export default function DiagramDashboard() {
  const { id } = useParams(); // diagramId
  const nav = useNavigate();
  const logout = useAuth((s) => s.logout);
  const email = useAuth((s) => s.email);
  const { theme, toggleTheme } = useTheme();

  const { diagram, loading, err } = useDiagram(id);
  const [relations, setRelations] = useState([]);
  const [linking, setLinking] = useState(null);
  const [camera, setCamera] = useState({ x: 0, y: 0, z: 1 });

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

  useEffect(() => {
    if (!diagram) return;
    (async () => {
      try {
        const items = await listRelations(diagram.id);
        setRelations(items || []);
      } catch {
        setRelations([]);
      }
    })();
  }, [diagram]);

  useEffect(() => {
    if (!linking) return;

    // ✅ UUID fix: devolvemos el string del data-attr tal cual
    const hitTestByDom = (pt) => {
      const stack = document.elementsFromPoint(pt.x, pt.y) || [];
      const el = stack.find((n) => n?.getAttribute && n.getAttribute("data-class-id"));
      if (el) {
        const raw = el.getAttribute("data-class-id");
        return raw || null; // ← NO Number(...)
      }
      return null;
    };

    const onMove = (e) => {
      setLinking((prev) => (prev ? { ...prev, cursor: { x: e.clientX, y: e.clientY } } : prev));
    };

    const onUp = async (e) => {
      const pt = { x: e.clientX, y: e.clientY };
      let toId = hitTestByDom(pt);
      if (!toId) toId = hitTestClasses(pt, classes);
      if (toId && toId !== linking.fromId) {
        const dstSide = inferClosestSide(toId, pt);
        try {
          const r = await createRelation(diagram.id, {
            from_class: linking.fromId,
            to_class: toId,
            type: "ASSOCIATION",
            src_anchor: linking.fromSide,
            dst_anchor: dstSide,
            // multiplicidad por defecto (si quieres enviarla desde ya):
            // src_mult_min: 1, src_mult_max: "*",
            // dst_mult_min: 1, dst_mult_max: 1,
          });
          setRelations((prev) => [...prev, r]);
        } catch (err) {
          alert(err?.response?.data?.detail || "No se pudo crear la relación");
        }
      }
      setLinking(null);
    };

    window.addEventListener("mousemove", onMove, true);
    window.addEventListener("mouseup", onUp, true);
    return () => {
      window.removeEventListener("mousemove", onMove, true);
      window.removeEventListener("mouseup", onUp, true);
    };
  }, [linking, classes, diagram?.id]);

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

      <div style={{ display: "grid", gridTemplateColumns: "420px 1fr 420px", minHeight: 0 }}>
        <LeftPanel />

        <main style={{ position: "relative" }}>
          <Sheet onCanvasClick={handleCanvasClick} onCameraChange={setCamera}>
            {classes.map((c) => (
              <ClassCard
                key={c.id}
                cls={c}
                selected={c.id === selectedId}
                onSelect={setSelectedId}
                onDragEnd={handleDragEnd}
                onResizeEnd={handleResizeEnd}
                details={detailsByClass[c.id]}
                alwaysShowDetails={true}
                showLinkPortsOnHover={true}
                // durante linking, mostrar puertos en destinos
                forceShowPorts={!!linking && c.id !== linking?.fromId}
                onStartLink={(fromId, side, pt) => {
                  setLinking({ fromId, fromSide: side, cursor: pt });
                }}
              />
            ))}
          </Sheet>

          <ConnectionLayer
            classes={classes}
            tempLink={
              linking ? { fromId: linking.fromId, fromSide: linking.fromSide, cursor: linking.cursor } : null
            }
            relations={relations}
            camera={camera}
          />
        </main>

        <Inspector
          selected={selected}
          details={selected ? detailsByClass[selected.id] : undefined}
          onRename={async (name) => {
            if (!selected) return;
            setClasses((prev) => prev.map((x) => (x.id === selected.id ? { ...x, name } : x)));
          }}
          onDetailsChange={(patch) => {
            if (!selected) return;
            replaceDetails(selected.id, patch);
          }}
          reloadDetails={() => selected && fetchDetails(selected.id)}
          onDeleteClass={() => selected && handleDelete(selected.id)}
        />
      </div>
    </div>
  );
}
