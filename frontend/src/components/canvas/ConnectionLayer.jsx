// src/components/canvas/ConnectionLayer.jsx
import { useEffect, useMemo, useState } from "react";
import { getAnchorForClassSide } from "./utils/geometry";

export default function ConnectionLayer({
  classes,
  tempLink = null,
  relations = [],
  strokeColor = "#7cf7ff",
  strokeWidth = 2,
  camera,
  onSelectRelation,
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

  /** Normaliza el tipo de relación (si no viene o es inválido → ASSOCIATION) */
  const normalizeType = (t) => {
    switch ((t || "").toUpperCase()) {
      case "ASSOCIATION":
      case "INHERITANCE":
      case "GENERALIZATION":
      case "AGGREGATION":
      case "COMPOSITION":
      case "DEPENDENCY":
        return t.toUpperCase();
      default:
        return "ASSOCIATION";
    }
  };

  const norm = (r) => ({
    id: r.id ?? `${r.from_class ?? r.origen_id}->${r.to_class ?? r.destino_id}`,
    fromId: r.from_class ?? r.origen_id,
    toId: r.to_class ?? r.destino_id,
    type: normalizeType(r.type ?? r.tipo),
    srcA: r.src_anchor || "right",
    dstA: r.dst_anchor || "left",
    srcMin: r.src_mult_min ?? r.mult_origen_min ?? 1,
    srcMax: r.src_mult_max ?? r.mult_origen_max ?? null,
    dstMin: r.dst_mult_min ?? r.mult_destino_min ?? 1,
    dstMax: r.dst_mult_max ?? r.mult_destino_max ?? null,
    label: r.label ?? r.etiqueta ?? null,
  });

  const fmtMult = (min, max) => `${min ?? 0}..${max == null ? "*" : max}`;

  const labelOffset = (side) => {
    switch (side) {
      case "left": return { dx: -14, dy: -6, anchor: "end" };
      case "right": return { dx: 14, dy: -6, anchor: "start" };
      case "top": return { dx: 0, dy: -10, anchor: "middle" };
      case "bottom": return { dx: 0, dy: 18, anchor: "middle" };
      default: return { dx: 10, dy: -6, anchor: "start" };
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
      segs.push({ ...r, a, b });
    }
    return segs;
  }, [relations, classes, camera]);

  const tempSegment = useMemo(() => {
    if (!tempLink) return null;
    const from = getAnchorForClassSide(tempLink.fromId, tempLink.fromSide || "right");
    const to = tempLink.cursor || null;
    if (!from || !to) return null;
    return { a: from, b: to, type: "ASSOCIATION" };
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
        {/* Marcadores para los distintos tipos */}
        <marker id="arrow-normal" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="8" markerHeight="8" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={strokeColor} />
        </marker>
        <marker id="arrow-hollow" viewBox="0 0 20 20" refX="20" refY="10" markerWidth="12" markerHeight="12" orient="auto">
          <path d="M 0 0 L 20 10 L 0 20 z" fill="white" stroke={strokeColor} strokeWidth="2" />
        </marker>
        <marker id="diamond-hollow" viewBox="0 0 20 20" refX="20" refY="10" markerWidth="12" markerHeight="12" orient="auto">
          <path d="M 0 10 L 10 0 L 20 10 L 10 20 z" fill="white" stroke={strokeColor} strokeWidth="2" />
        </marker>
        <marker id="diamond-filled" viewBox="0 0 20 20" refX="20" refY="10" markerWidth="12" markerHeight="12" orient="auto">
          <path d="M 0 10 L 10 0 L 20 10 L 10 20 z" fill={strokeColor} />
        </marker>
      </defs>

      {relationSegments.map((seg) => {
        const so = labelOffset(seg.srcA);
        const dof = labelOffset(seg.dstA);
        const mid = { x: (seg.a.x + seg.b.x) / 2, y: (seg.a.y + seg.b.y) / 2 };

        // estilo base
        let lineProps = {
          stroke: strokeColor,
          strokeWidth,
          strokeLinecap: "round",
        };
        let markerStart = null;
        let markerEnd = null;

        switch (seg.type) {
          case "ASSOCIATION":
            // Línea simple sin flechas
            markerStart = null;
            markerEnd = null;
            break;
          case "INHERITANCE":
          case "GENERALIZATION":
            markerEnd = "url(#arrow-hollow)";
            break;
          // case "AGGREGATION":
          //   markerStart = "url(#diamond-hollow)";
          //   markerEnd = "url(#arrow-normal)";
          //   break;
          // case "COMPOSITION":
          //   markerStart = "url(#diamond-filled)";
          //   markerEnd = "url(#arrow-normal)";
          //   break;
          case "AGGREGATION":
            markerStart = null;
            markerEnd = "url(#diamond-hollow)";
            break;
          case "COMPOSITION":
            markerStart = null;
            markerEnd = "url(#diamond-filled)";
            break;

          case "DEPENDENCY":
            lineProps.strokeDasharray = "6,4";
            markerEnd = "url(#arrow-normal)";
            break;
          default:
            markerEnd = null;
        }

        return (
          <g key={seg.id}>
            <line
              x1={seg.a.x} y1={seg.a.y}
              x2={seg.b.x} y2={seg.b.y}
              {...lineProps}
              markerStart={markerStart}
              markerEnd={markerEnd}
            />
            <line
              x1={seg.a.x} y1={seg.a.y}
              x2={seg.b.x} y2={seg.b.y}
              stroke="transparent"
              strokeWidth={Math.max(16, strokeWidth + 10)}
              style={{ pointerEvents: "auto", cursor: onSelectRelation ? "pointer" : "default" }}
              onClick={() => onSelectRelation?.(seg.id)}
            />
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
        <line
          x1={tempSegment.a.x} y1={tempSegment.a.y}
          x2={tempSegment.b.x} y2={tempSegment.b.y}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          markerEnd="url(#arrow-normal)"
          opacity="0.7"
        />
      )}
    </svg>
  );
}
