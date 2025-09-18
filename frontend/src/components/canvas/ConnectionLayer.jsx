 
// // src/components/canvas/ConnectionLayer.jsx
// import { useEffect, useMemo, useState } from "react";
// import { getAnchorForClassSide } from "./utils/geometry";

// export default function ConnectionLayer({
//   classes,
//   tempLink = null,
//   relations = [],
//   strokeColor = "#7cf7ff",     // más llamativo
//   strokeWidth = 4,              // más grueso
//   camera,
// }) {
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

//   // Normaliza: soporta {from_class,to_class} o {origen_id,destino_id}
//   const norm = (r) => {
//     const fromId = r.from_class ?? r.origen_id ?? r.from ?? r.source ?? null;
//     const toId = r.to_class ?? r.destino_id ?? r.to ?? r.target ?? null;
//     const srcA = r.src_anchor || r.src_anchor_side || "right";
//     const dstA = r.dst_anchor || r.dst_anchor_side || "left";
//     return { id: r.id ?? `${fromId}->${toId}`, fromId, toId, srcA, dstA };
//   };

//   const relationSegments = useMemo(() => {
//     const segs = [];
//     for (const rr of relations) {
//       const r = norm(rr);
//       if (!r.fromId || !r.toId) continue;
//       const a = getAnchorForClassSide(r.fromId, r.srcA);
//       const b = getAnchorForClassSide(r.toId, r.dstA);
//       if (a && b) segs.push({ id: r.id, a, b });
//     }
//     // Debug rápido en consola:
//     // console.log("REL segments:", segs.length, segs);
//     return segs;
//   }, [relations, classes, camera]); // depende de clases para re-evaluar anclajes cuando muevas tarjetas

//   const tempSegment = useMemo(() => {
//     if (!tempLink) return null;
//     const from = getAnchorForClassSide(tempLink.fromId, tempLink.fromSide || "right");
//     const to = tempLink.cursor || null;
//     if (!from || !to) return null;
//     return { a: from, b: to };
//   }, [tempLink, classes, camera]);

//   return (
//     <svg
//       width={viewport.w}
//       height={viewport.h}
//       style={{
//         position: "fixed",
//         inset: 0,
//         pointerEvents: "none",
//         overflow: "visible",
//         zIndex: 9999,
//       }}
//     >
//       {/* Marcador de flecha */}
//       <defs>
//         <marker id="arrow-end" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
//           <path d="M 0 0 L 10 5 L 0 10 z" fill={strokeColor} />
//         </marker>
//       </defs>

//       {/* Relaciones persistidas */}
//       {relationSegments.map((seg) => (
//         <g key={seg.id}>
//           <line
//             x1={seg.a.x}
//             y1={seg.a.y}
//             x2={seg.b.x}
//             y2={seg.b.y}
//             stroke={strokeColor}
//             strokeWidth={strokeWidth}
//             strokeLinecap="round"
//             markerEnd="url(#arrow-end)"
//           />
//           {/* puntitos de debug en extremos */}
//           <circle cx={seg.a.x} cy={seg.a.y} r="3.5" fill={strokeColor} />
//           <circle cx={seg.b.x} cy={seg.b.y} r="3.5" fill={strokeColor} />
//         </g>
//       ))}

//       {/* Línea temporal */}
//       {tempSegment && (
//         <g>
//           <line
//             x1={tempSegment.a.x}
//             y1={tempSegment.a.y}
//             x2={tempSegment.b.x}
//             y2={tempSegment.b.y}
//             stroke={strokeColor}
//             strokeWidth={strokeWidth}
//             strokeLinecap="round"
//             markerEnd="url(#arrow-end)"
//             opacity="0.9"
//           />
//           <circle cx={tempSegment.a.x} cy={tempSegment.a.y} r="3.5" fill={strokeColor} />
//           <circle cx={tempSegment.b.x} cy={tempSegment.b.y} r="3.5" fill={strokeColor} />
//         </g>
//       )}
//     </svg>
//   );
// }
import { useEffect, useMemo, useState } from "react";
import { getAnchorForClassSide } from "./utils/geometry";

export default function ConnectionLayer({
  classes,
  tempLink = null,
  relations = [],
  strokeColor = "#7cf7ff",
  strokeWidth = 4,
  camera,             // trigger de recálculo por pan/zoom
  onSelectRelation,   // opcional: click en línea devuelve id
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

  // id único de marker por si hay varios SVGs
  const markerId = useMemo(() => `arrow-end-${Math.random().toString(36).slice(2)}`, []);

  // normaliza campos v2 (API) / DB
  const norm = (r) => ({
    id: r.id ?? `${r.from_class ?? r.origen_id}->${r.to_class ?? r.destino_id}`,
    fromId: r.from_class ?? r.origen_id,
    toId: r.to_class ?? r.destino_id,
    srcA: r.src_anchor || "right",
    dstA: r.dst_anchor || "left",
    // multiplicidad y etiqueta
    srcMin: r.src_mult_min ?? r.mult_origen_min ?? 1,
    srcMax: r.src_mult_max ?? r.mult_origen_max ?? null,
    dstMin: r.dst_mult_min ?? r.mult_destino_min ?? 1,
    dstMax: r.dst_mult_max ?? r.mult_destino_max ?? null,
    label: r.label ?? r.etiqueta ?? null,
  });

  const fmtMult = (min, max) => `${min ?? 0}..${max == null ? "*" : max}`;

  const labelOffset = (side) => {
    switch (side) {
      case "left":   return { dx: -14, dy: -6, anchor: "end" };
      case "right":  return { dx:  14, dy: -6, anchor: "start" };
      case "top":    return { dx:   0, dy: -10, anchor: "middle" };
      case "bottom": return { dx:   0, dy:  18, anchor: "middle" };
      default:       return { dx: 10, dy: -6, anchor: "start" };
    }
  };

  const relationSegments = useMemo(() => {
    const segs = [];
    for (const rr of relations) {
      const r = norm(rr);
      if (!r.fromId || !r.toId) continue;
      const a = getAnchorForClassSide(r.fromId, r.srcA);
      const b = getAnchorForClassSide(r.toId, r.dstA);
      if (!a || !b) continue;
      segs.push({
        id: r.id, a, b,
        src_anchor: r.srcA, dst_anchor: r.dstA,
        srcMin: r.srcMin, srcMax: r.srcMax,
        dstMin: r.dstMin, dstMax: r.dstMax,
        label: r.label,
      });
    }
    return segs;
  }, [relations, classes, camera]);

  const tempSegment = useMemo(() => {
    if (!tempLink) return null;
    const from = getAnchorForClassSide(tempLink.fromId, tempLink.fromSide || "right");
    const to = tempLink.cursor || null;
    if (!from || !to) return null;
    return { a: from, b: to };
  }, [tempLink, classes, camera]);

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
      <defs>
        <marker id={markerId} viewBox="0 0 10 10" refX="10" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={strokeColor} />
        </marker>
      </defs>

      {relationSegments.map((seg) => {
        const so = labelOffset(seg.src_anchor);
        const dof = labelOffset(seg.dst_anchor);
        const mid = { x: (seg.a.x + seg.b.x) / 2, y: (seg.a.y + seg.b.y) / 2 };

        return (
          <g key={seg.id}>
            {/* línea visible */}
            <line
              x1={seg.a.x} y1={seg.a.y}
              x2={seg.b.x} y2={seg.b.y}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              markerEnd={`url(#${markerId})`}
            />
            {/* hit-line para click/hover (opcional) */}
            <line
              x1={seg.a.x} y1={seg.a.y}
              x2={seg.b.x} y2={seg.b.y}
              stroke="transparent"
              strokeWidth={Math.max(16, strokeWidth + 10)}
              style={{ pointerEvents: "auto", cursor: onSelectRelation ? "pointer" : "default" }}
              onClick={() => onSelectRelation?.(seg.id)}
            />
            {/* extremos (debug opcional) */}
            {/* <circle cx={seg.a.x} cy={seg.a.y} r="3.5" fill={strokeColor} />
            <circle cx={seg.b.x} cy={seg.b.y} r="3.5" fill={strokeColor} /> */}

            {/* multiplicidad */}
            <text
              x={seg.a.x + so.dx}
              y={seg.a.y + so.dy}
              fontSize="12"
              fill={strokeColor}
              textAnchor={so.anchor}
              style={{ userSelect: "none" }}
            >
              {fmtMult(seg.srcMin, seg.srcMax)}
            </text>
            <text
              x={seg.b.x + dof.dx}
              y={seg.b.y + dof.dy}
              fontSize="12"
              fill={strokeColor}
              textAnchor={dof.anchor}
              style={{ userSelect: "none" }}
            >
              {fmtMult(seg.dstMin, seg.dstMax)}
            </text>

            {/* etiqueta (si existe) */}
            {seg.label && (
              <text
                x={mid.x}
                y={mid.y - 6}
                fontSize="12"
                fill={strokeColor}
                textAnchor="middle"
                style={{ userSelect: "none" }}
              >
                {seg.label}
              </text>
            )}
          </g>
        );
      })}

      {tempSegment && (
        <g>
          <line
            x1={tempSegment.a.x} y1={tempSegment.a.y}
            x2={tempSegment.b.x} y2={tempSegment.b.y}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            markerEnd={`url(#${markerId})`}
            opacity="0.9"
          />
        </g>
      )}
    </svg>
  );
}
