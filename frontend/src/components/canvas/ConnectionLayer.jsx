// // src/components/canvas/ConnectionLayer.jsx
// import { useEffect, useMemo, useState } from "react";
// import { getAnchorForClassSide } from "./utils/geometry";

// /**
//  * Capa SVG que dibuja:
//  *  - Línea temporal (tempLink) mientras arrastrás para crear relación
//  *  - Relaciones persistidas (relations)
//  *
//  * Props:
//  *  - classes: [{id, ...}]  → para buscar anclajes
//  *  - tempLink?: { fromId, fromSide, cursor:{x,y}, toId?: number|null }
//  *  - relations?: [{ id, from_class, to_class, src_anchor?, dst_anchor? }, ...]
//  *  - strokeColor?: string
//  *  - strokeWidth?: number
//  */
// export default function ConnectionLayer({
//   classes,
//   tempLink = null,
//   relations = [],
//   strokeColor = "rgba(255,255,255,0.8)",
//   strokeWidth = 2,
// }) {
//   // Redimensiona el SVG cuando cambia el viewport (seguro en overlay fullscreen)
//   const [viewport, setViewport] = useState(() => ({
//     w: document.documentElement.clientWidth,
//     h: document.documentElement.clientHeight,
//   }));
//   useEffect(() => {
//     const onResize = () => {
//       setViewport({
//         w: document.documentElement.clientWidth,
//         h: document.documentElement.clientHeight,
//       });
//     };
//     window.addEventListener("resize", onResize);
//     return () => window.removeEventListener("resize", onResize);
//   }, []);

//   // Dibuja una línea entre dos puntos
//   const Line = ({ a, b, keyProp }) => {
//     if (!a || !b) return null;
//     return (
//       <line
//         key={keyProp}
//         x1={a.x}
//         y1={a.y}
//         x2={b.x}
//         y2={b.y}
//         stroke={strokeColor}
//         strokeWidth={strokeWidth}
//         strokeLinecap="round"
//       />
//     );
//   };

//   // Relaciones persistidas → mapeo a segmentos (puntos A,B)
//   const relationSegments = useMemo(() => {
//     return relations
//       .map((r) => {
//         const from = getAnchorForClassSide(r.from_class, r.src_anchor || "right");
//         const to = getAnchorForClassSide(r.to_class, r.dst_anchor || "left");
//         if (!from || !to) return null;
//         return { id: r.id, a: from, b: to };
//       })
//       .filter(Boolean);
//   }, [relations]);

//   // Línea temporal (si existe tempLink)
//   const tempSegment = useMemo(() => {
//     if (!tempLink) return null;
//     const from = getAnchorForClassSide(tempLink.fromId, tempLink.fromSide || "right");
//     const to = tempLink.cursor || null;
//     if (!from || !to) return null;
//     return { a: from, b: to };
//   }, [tempLink]);

//   return (
//     // <svg
//     //   width={viewport.w}
//     //   height={viewport.h}
//     //   style={{
//     //     position: "absolute",
//     //     inset: 0,
//     //     pointerEvents: "none", // no bloquea clicks/drag
//     //     overflow: "visible",
//     //   }}
//     // >
//     <svg
//       width={viewport.w}
//       height={viewport.h}
//       style={{
//        position: "fixed",   // <<-- clave: cubrir toda la ventana
//         inset: 0,
//          pointerEvents: "none",
//         overflow: "visible",
//          zIndex: 9999,        // por encima del canvas
//       }}
//     >
//       {/* Relaciones guardadas */}
//       {relationSegments.map((seg) => (
//         <Line keyProp={seg.id} a={seg.a} b={seg.b} />
//       ))}

//       {/* Línea temporal */}
//       {tempSegment && <Line keyProp="__temp__" a={tempSegment.a} b={tempSegment.b} />}
//     </svg>
//   );
// }
// src/components/canvas/ConnectionLayer.jsx
import { useEffect, useMemo, useState } from "react";
import { getAnchorForClassSide } from "./utils/geometry";

export default function ConnectionLayer({
  classes,
  tempLink = null,
  relations = [],
  strokeColor = "#7cf7ff",     // más llamativo
  strokeWidth = 4,              // más grueso
}) {
  const [viewport, setViewport] = useState(() => ({
    w: document.documentElement.clientWidth,
    h: document.documentElement.clientHeight,
  }));

  useEffect(() => {
    const onResize = () => {
      setViewport({
        w: document.documentElement.clientWidth,
        h: document.documentElement.clientHeight,
      });
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Normaliza: soporta {from_class,to_class} o {origen_id,destino_id}
  const norm = (r) => {
    const fromId = r.from_class ?? r.origen_id ?? r.from ?? r.source ?? null;
    const toId   = r.to_class   ?? r.destino_id ?? r.to   ?? r.target ?? null;
    const srcA   = r.src_anchor || r.src_anchor_side || "right";
    const dstA   = r.dst_anchor || r.dst_anchor_side || "left";
    return { id: r.id ?? `${fromId}->${toId}`, fromId, toId, srcA, dstA };
  };

  const relationSegments = useMemo(() => {
    const segs = [];
    for (const rr of relations) {
      const r = norm(rr);
      if (!r.fromId || !r.toId) continue;
      const a = getAnchorForClassSide(r.fromId, r.srcA);
      const b = getAnchorForClassSide(r.toId, r.dstA);
      if (a && b) segs.push({ id: r.id, a, b });
    }
    // Debug rápido en consola:
    // console.log("REL segments:", segs.length, segs);
    return segs;
  }, [relations, classes]); // depende de clases para re-evaluar anclajes cuando muevas tarjetas

  const tempSegment = useMemo(() => {
    if (!tempLink) return null;
    const from = getAnchorForClassSide(tempLink.fromId, tempLink.fromSide || "right");
    const to = tempLink.cursor || null;
    if (!from || !to) return null;
    return { a: from, b: to };
  }, [tempLink, classes]);

  return (
    <svg
      width={viewport.w}
      height={viewport.h}
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        overflow: "visible",
        zIndex: 9999,
      }}
    >
      {/* Marcador de flecha */}
      <defs>
        <marker id="arrow-end" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={strokeColor} />
        </marker>
      </defs>

      {/* Relaciones persistidas */}
      {relationSegments.map((seg) => (
        <g key={seg.id}>
          <line
            x1={seg.a.x}
            y1={seg.a.y}
            x2={seg.b.x}
            y2={seg.b.y}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            markerEnd="url(#arrow-end)"
          />
          {/* puntitos de debug en extremos */}
          <circle cx={seg.a.x} cy={seg.a.y} r="3.5" fill={strokeColor} />
          <circle cx={seg.b.x} cy={seg.b.y} r="3.5" fill={strokeColor} />
        </g>
      ))}

      {/* Línea temporal */}
      {tempSegment && (
        <g>
          <line
            x1={tempSegment.a.x}
            y1={tempSegment.a.y}
            x2={tempSegment.b.x}
            y2={tempSegment.b.y}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            markerEnd="url(#arrow-end)"
            opacity="0.9"
          />
          <circle cx={tempSegment.a.x} cy={tempSegment.a.y} r="3.5" fill={strokeColor} />
          <circle cx={tempSegment.b.x} cy={tempSegment.b.y} r="3.5" fill={strokeColor} />
        </g>
      )}
    </svg>
  );
}
