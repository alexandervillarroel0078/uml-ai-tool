
// // src/pages/DiagramDashboard.jsx
// // (orquestador, misma UI/props)
// // imports

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

// // NUEVO: capa de conexiones
// import ConnectionLayer from "../components/canvas/ConnectionLayer";

// export default function DiagramDashboard() {
//   const { id } = useParams(); // diagramId
//   const nav = useNavigate();
//   const logout = useAuth((s) => s.logout);
//   const email = useAuth((s) => s.email);
//   const { theme, toggleTheme } = useTheme();

//   // Diagrama
//   const { diagram, loading, err } = useDiagram(id);
//   // ====== Relaciones persistidas ======
//   const [relations, setRelations] = useState([]);

//   // Clases + detalles (toda la lógica movida, misma firma/efectos)
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

//   // ====== Linking temporal (para mostrar la línea elástica) ======
//   // linking = { fromId, fromSide, cursor:{x,y} } | null
//   const [linking, setLinking] = useState(null);
//   // Cargar relaciones cuando hay diagrama

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

//     const onMove = (e) => {
//       setLinking((prev) => (prev ? { ...prev, cursor: { x: e.clientX, y: e.clientY } } : prev));
//     };
//     // const onUp = () => {
//     //   // aquí en el futuro: detectar clase destino y crear relación
//     //   setLinking(null);
//     // };
//     const onUp = async (e) => {
//       const pt = { x: e.clientX, y: e.clientY };
//       const toId = hitTestClasses(pt, classes);
//       if (toId && toId !== linking.fromId) {
//         const dstSide = inferClosestSide(toId, pt);
//         try {
//           const r = await createRelation(diagram.id, {
//             from_class: linking.fromId,
//            to_class: toId,
//             type: "ASSOCIATION",     // luego lo volvemos configurable
//             src_anchor: linking.fromSide,
//             dst_anchor: dstSide,
//           });
//           setRelations((prev) => [...prev, r]);
//         } catch (err) {
//           alert(err?.response?.data?.detail || "No se pudo crear la relación");
//         }
//       }
//       setLinking(null);
//    };
//     window.addEventListener("mousemove", onMove);
//     window.addEventListener("mouseup", onUp);
//     return () => {
//       window.removeEventListener("mousemove", onMove);
//       window.removeEventListener("mouseup", onUp);
//     };
//   }, [linking]);

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
//         <main style={{ position: "relative" }}>
//           <Sheet onCanvasClick={handleCanvasClick}>
//             {classes.map((c) => (
//               <ClassCard
//                 key={c.id}
//                 cls={c}
//                 selected={c.id === selectedId}
//                 onSelect={setSelectedId}
//                 onDragEnd={handleDragEnd}
//                 onResizeEnd={handleResizeEnd}
//                 // detalles desde el padre (no se auto-cargan en la tarjeta)
//                 details={detailsByClass[c.id]} // {attrs, meths} o undefined
//                 alwaysShowDetails={true}
//                 // NUEVO: inicia el linking al pulsar uno de los puertos invisibles
//                 onStartLink={(fromId, side, pt) => {
//                   setLinking({ fromId, fromSide: side, cursor: pt });
//                 }}
//               // opcional: también mostrar puertos en hover
//               // showLinkPortsOnHover
//               />
//             ))}
//           </Sheet>

//           {/* NUEVO: capa de relaciones por encima del canvas */}
//           <ConnectionLayer
//             classes={classes}
//             tempLink={linking ? { fromId: linking.fromId, fromSide: linking.fromSide, cursor: linking.cursor } : null}
//             // relations={[]}
//             relations={relations}
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
//         </main>

//         {/* Inspector (derecha) */}
//         <Inspector
//           selected={selected}
//           details={selected ? detailsByClass[selected.id] : undefined}
//           // renombrar clase
//           onRename={async (name) => {
//             if (!selected) return;
//             // await updateClass(selected.id, { name }); // misma acción que antes
//             setClasses((prev) => prev.map((x) => (x.id === selected.id ? { ...x, name } : x)));
//           }}
//           // CRUD de atributos/métodos
//           onDetailsChange={(patch) => {
//             if (!selected) return;
//             replaceDetails(selected.id, patch);
//           }}
//           // recargar desde servidor
//           reloadDetails={() => selected && fetchDetails(selected.id)}
//           onDeleteClass={() => selected && handleDelete(selected.id)}
//         />
//       </div>
//     </div>
//   );
// }
// (orquestador, misma UI/props)
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

// Capa de conexiones
import ConnectionLayer from "../components/canvas/ConnectionLayer";

export default function DiagramDashboard() {
  const { id } = useParams(); // diagramId
  const nav = useNavigate();
  const logout = useAuth((s) => s.logout);
  const email = useAuth((s) => s.email);
  const { theme, toggleTheme } = useTheme();

  // Diagrama
  const { diagram, loading, err } = useDiagram(id);

  // Relaciones persistidas
  const [relations, setRelations] = useState([]);

  // Clases + detalles
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

  // Linking temporal (línea elástica)
  // linking = { fromId, fromSide, cursor:{x,y} } | null
  const [linking, setLinking] = useState(null);

  // Cargar relaciones
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

  // listeners globales de mouse mientras esté linking
  useEffect(() => {
    if (!linking) return;

    // hit-test por DOM (detecta data-class-id incluso sobre puertos)
    const hitTestByDom = (pt) => {
      const stack = document.elementsFromPoint(pt.x, pt.y) || [];
      const el = stack.find((n) => n?.getAttribute && n.getAttribute("data-class-id"));
      if (el) {
        const raw = el.getAttribute("data-class-id");
        return raw ? Number(raw) : null;
      }
      return null;
    };

    const onMove = (e) => {
      setLinking((prev) => (prev ? { ...prev, cursor: { x: e.clientX, y: e.clientY } } : prev));
    };

    const onUp = async (e) => {
      const pt = { x: e.clientX, y: e.clientY };

      // 1) Primero DOM
      let toId = hitTestByDom(pt);
      // 2) Si no encontró, por rect (con margen)
      if (!toId) {
        toId = hitTestClasses(pt, classes);
      }

      if (toId && toId !== linking.fromId) {
        const dstSide = inferClosestSide(toId, pt);
        try {
          const r = await createRelation(diagram.id, {
            from_class: linking.fromId,
            to_class: toId,
            type: "ASSOCIATION",
            src_anchor: linking.fromSide,
            dst_anchor: dstSide,
          });
          setRelations((prev) => [...prev, r]);
        } catch (err) {
          alert(err?.response?.data?.detail || "No se pudo crear la relación");
        }
      }
      setLinking(null);
    };

    // Usa captura para que no se pierda por stopPropagation en niños
    window.addEventListener("mousemove", onMove, true);
    window.addEventListener("mouseup", onUp, true);
    return () => {
      window.removeEventListener("mousemove", onMove, true);
      window.removeEventListener("mouseup", onUp, true);
    };
    // deps: linking activo + clases/diagram para no cerrar stale
  }, [linking, classes, diagram?.id]);

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
                details={detailsByClass[c.id]} // {attrs, meths} o undefined
                alwaysShowDetails={true}

                // ✅ puertos visibles en hover
                showLinkPortsOnHover={true}
                // ✅ durante linking, forzar puertos visibles en destinos
                forceShowPorts={!!linking && c.id !== linking?.fromId}

                // iniciar linking desde puerto
                onStartLink={(fromId, side, pt) => {
                  setLinking({ fromId, fromSide: side, cursor: pt });
                }}
              />
            ))}
          </Sheet>

          {/* capa de relaciones */}
          <ConnectionLayer
            classes={classes}
            tempLink={
              linking ? { fromId: linking.fromId, fromSide: linking.fromSide, cursor: linking.cursor } : null
            }
            relations={relations}
          />

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
