
// // import React, { useCallback, useEffect, useRef, useState } from "react";
// // import { SHEET } from "./Sheet";
// // import {
// //   listAttributes,
// //   listMethods,
// // } from "../api/classes";

// // /**
// //  * Tarjeta de clase:
// //  * - Drag (mover) + Resize (esquina) con snap a grilla
// //  * - Selección (click) con estilo resaltado
// //  * - Vista compacta: contadores de atributos/métodos
// //  * - Vista detallada (solo si selected): lista atributos y métodos (lazy-load)
// //  *
// //  * Props:
// //  *  - cls: { id, name, x_grid, y_grid, w_grid, h_grid, z_index, _attrCount?, _methCount? }
// //  *  - selected?: boolean
// //  *  - onSelect?(id)
// //  *  - onDragEnd?(id, { x_grid, y_grid })
// //  *  - onResizeEnd?(id, { w_grid, h_grid })
// //  */
// // export default function ClassCard({ cls, selected = false, onSelect, onDragEnd, onResizeEnd }) {
// //   const { CELL } = SHEET;

// //   const [pos, setPos] = useState({ x: cls.x_grid ?? 0, y: cls.y_grid ?? 0 });
// //   const [size, setSize] = useState({ w: cls.w_grid ?? 12, h: cls.h_grid ?? 6 });
// //   const [dragging, setDragging] = useState(false);
// //   const [resizing, setResizing] = useState(false);
// //   const start = useRef({ x: 0, y: 0, px: 0, py: 0, w: 0, h: 0 });

// //   // Detalles (lazy) cuando está seleccionada
// //   const [attrs, setAttrs] = useState(null);   // null = no cargado; [] = cargado vacío
// //   const [meths, setMeths] = useState(null);
// //   const [loadingDetails, setLoadingDetails] = useState(false);

// //   // Mantener sync si vienen updates externos
// //   useEffect(() => { setPos({ x: cls.x_grid ?? 0, y: cls.y_grid ?? 0 }); }, [cls.x_grid, cls.y_grid]);
// //   useEffect(() => { setSize({ w: cls.w_grid ?? 12, h: cls.h_grid ?? 6 }); }, [cls.w_grid, cls.h_grid]);

// //   const pxToGrid = (px) => Math.max(0, Math.round(px / CELL));
// //   const clampSize = (v, min = 3) => Math.max(min, v);

// //   const onHeaderMouseDown = useCallback((e) => {
// //     if (e.button !== 0) return;
// //     setDragging(true);
// //     start.current = { x: e.clientX, y: e.clientY, px: pos.x, py: pos.y, w: size.w, h: size.h };
// //     e.stopPropagation();
// //     e.preventDefault();
// //   }, [pos, size]);

// //   const onHandleMouseDown = useCallback((e) => {
// //     if (e.button !== 0) return;
// //     setResizing(true);
// //     start.current = { x: e.clientX, y: e.clientY, px: pos.x, py: pos.y, w: size.w, h: size.h };
// //     e.stopPropagation();
// //     e.preventDefault();
// //   }, [pos, size]);

// //   useEffect(() => {
// //     const onMove = (e) => {
// //       if (dragging) {
// //         const dx = e.clientX - start.current.x;
// //         const dy = e.clientY - start.current.y;
// //         const gx = pxToGrid(start.current.px * CELL + dx);
// //         const gy = pxToGrid(start.current.py * CELL + dy);
// //         setPos({ x: gx, y: gy });
// //       } else if (resizing) {
// //         const dx = e.clientX - start.current.x;
// //         const dy = e.clientY - start.current.y;
// //         const gw = clampSize(pxToGrid(start.current.w * CELL + dx));
// //         const gh = clampSize(pxToGrid(start.current.h * CELL + dy));
// //         setSize({ w: gw, h: gh });
// //       }
// //     };
// //     const onUp = () => {
// //       if (dragging) {
// //         setDragging(false);
// //         onDragEnd?.(cls.id, { x_grid: pos.x, y_grid: pos.y });
// //       } else if (resizing) {
// //         setResizing(false);
// //         onResizeEnd?.(cls.id, { w_grid: size.w, h_grid: size.h });
// //       }
// //     };
// //     window.addEventListener("mousemove", onMove);
// //     window.addEventListener("mouseup", onUp);
// //     return () => {
// //       window.removeEventListener("mousemove", onMove);
// //       window.removeEventListener("mouseup", onUp);
// //     };
// //   }, [dragging, resizing, pos, size, onDragEnd, onResizeEnd, cls?.id, CELL]);

// //   // Lazy-load de atributos/métodos SOLO cuando está seleccionada.
// //   useEffect(() => {
// //     let alive = true;
// //     async function loadDetails() {
// //       if (!selected) { setAttrs(null); setMeths(null); return; }
// //       setLoadingDetails(true);
// //       try {
// //         const [a, m] = await Promise.all([
// //           listAttributes(cls.id),
// //           listMethods(cls.id),
// //         ]);
// //         if (!alive) return;
// //         setAttrs(a || []);
// //         setMeths(m || []);
// //       } catch {
// //         if (!alive) return;
// //         setAttrs([]); setMeths([]);
// //       } finally {
// //         if (!alive) return;
// //         setLoadingDetails(false);
// //       }
// //     }
// //     loadDetails();
// //     return () => { alive = false; };
// //   }, [selected, cls.id]);

// //   const left = (pos.x ?? 0) * CELL;
// //   const top = (pos.y ?? 0) * CELL;
// //   const width = (size.w ?? 12) * CELL;
// //   const height = (size.h ?? 6) * CELL;

// //   // Vista compacta (no seleccionado): solo contadores si existen
// //   const counts = {
// //     attrs: (attrs ?? cls._attrCount ?? null),
// //     meths: (meths ?? cls._methCount ?? null),
// //   };
// //   const showCounts = !selected && (counts.attrs !== null || counts.meths !== null);

// //   return (
// //     <div
// //       onMouseDown={() => onSelect?.(cls.id)}
// //       style={{
// //         position: "absolute",
// //         left, top, width, height,
// //         background: selected ? "#122038" : "#0e1526",
// //         border: selected ? "2px solid #6ab0ff" : "1px solid #334",
// //         borderRadius: 8,
// //         color: "#eaeefb",
// //         boxShadow: selected ? "0 8px 24px rgba(0,80,255,.25)" : "0 6px 20px rgba(0,0,0,.25)",
// //         overflow: "hidden",
// //         zIndex: cls.z_index ?? 1,
// //         cursor: dragging ? "grabbing" : "default",
// //         transition: "box-shadow .15s, border-color .15s, background .15s",
// //       }}
// //       title={selected ? "Seleccionada" : "Click para seleccionar"}
// //     >
// //       {/* Header (zona de drag) */}
// //       <div
// //         onMouseDown={onHeaderMouseDown}
// //         style={{
// //           padding: 8,
// //           fontWeight: 700,
// //           borderBottom: "1px solid #26314d",
// //           cursor: "grab",
// //           userSelect: "none",
// //           display: "flex",
// //           alignItems: "center",
// //           justifyContent: "space-between",
// //           gap: 8,
// //         }}
// //         title="Arrastra para mover"
// //       >
// //         <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
// //           {cls.name ?? cls.nombre ?? "Clase"}
// //         </span>
// //         {/* contadores compactos cuando no está seleccionada */}
// //         {showCounts && (
// //           <span style={{ fontSize: 11, opacity: .85 }}>
// //             {Array.isArray(counts.attrs) ? counts.attrs.length : (counts.attrs ?? 0)} attrs ·{" "}
// //             {Array.isArray(counts.meths) ? counts.meths.length : (counts.meths ?? 0)} métodos
// //           </span>
// //         )}
// //       </div>

// //       {/* Body */}
// //       <div style={{ padding: 8, fontSize: 12, lineHeight: 1.3, height: "100%", overflow: "auto" }}>
// //         {/* Vista detallada SOLO si está seleccionada */}
// //         {selected ? (
// //           loadingDetails ? (
// //             <div style={{ opacity: .8 }}>Cargando detalles…</div>
// //           ) : (
// //             <>
// //               {/* Atributos */}
// //               <div style={{ marginBottom: 6, fontWeight: 600, opacity: .9 }}>Atributos</div>
// //               {(!attrs || attrs.length === 0) ? (
// //                 <div style={{ opacity: .7, marginBottom: 8 }}>—</div>
// //               ) : (
// //                 <ul style={{ margin: 0, paddingLeft: 16, marginBottom: 8 }}>
// //                   {attrs.map(a => (
// //                     <li key={a.id} style={{ margin: "2px 0" }}>
// //                       <span style={{ opacity: .95 }}>{a.name ?? a.nombre}</span>
// //                       <span style={{ opacity: .7 }}> : {a.type ?? a.tipo ?? "string"}</span>
// //                       {a.required ? <span style={{ opacity: .9, marginLeft: 6 }}>*</span> : null}
// //                     </li>
// //                   ))}
// //                 </ul>
// //               )}

// //               {/* Métodos */}
// //               <div style={{ marginBottom: 6, fontWeight: 600, opacity: .9 }}>Métodos</div>
// //               {(!meths || meths.length === 0) ? (
// //                 <div style={{ opacity: .7 }}>—</div>
// //               ) : (
// //                 <ul style={{ margin: 0, paddingLeft: 16 }}>
// //                   {meths.map(m => (
// //                     <li key={m.id} style={{ margin: "2px 0" }}>
// //                       <span style={{ opacity: .95 }}>{m.name}</span>
// //                       <span style={{ opacity: .7 }}> : {m.return_type ?? "void"}</span>
// //                     </li>
// //                   ))}
// //                 </ul>
// //               )}
// //             </>
// //           )
// //         ) : (
// //           // No seleccionado: texto auxiliar
// //           <div style={{ opacity: .75 }}>
// //             {size.w}×{size.h} celdas
// //           </div>
// //         )}
// //       </div>

// //       {/* Handle de resize (esquina inferior-derecha) */}
// //       <div
// //         onMouseDown={onHandleMouseDown}
// //         style={{
// //           position: "absolute",
// //           right: 2, bottom: 2,
// //           width: 14, height: 14,
// //           border: "1px solid #445",
// //           borderRadius: 4,
// //           background: "rgba(255,255,255,.06)",
// //           cursor: "nwse-resize",
// //         }}
// //         title="Arrastra para redimensionar"
// //       />
// //     </div>
// //   );
// // }
// import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
// import { SHEET } from "./Sheet";
// import { listAttributes, listMethods } from "../api/classes";

// /**
//  * Tarjeta de clase:
//  * - Drag + Resize manual (esquina) con snap a grilla
//  * - Selección visual
//  * - Vista compacta (no seleccionado): contadores (si están) o info mínima
//  * - Vista detallada (seleccionado): atributos y métodos
//  * - Auto-alto: ajusta h_grid para que el contenido entre sin scroll (hasta un máximo)
//  *
//  * Props:
//  *  - cls: { id, name, x_grid, y_grid, w_grid, h_grid, z_index, _attrCount?, _methCount? }
//  *  - selected?: boolean
//  *  - onSelect?(id)
//  *  - onDragEnd?(id, { x_grid, y_grid })
//  *  - onResizeEnd?(id, { w_grid, h_grid })  // se usa también para persistir auto-alto
//  *  - autoGrowHeight?: boolean (default: true)
//  *  - minH?: number (grid rows) default 4
//  *  - maxH?: number (grid rows) default 32
//  */
// export default function ClassCard({
//   cls,
//   selected = false,
//   onSelect,
//   onDragEnd,
//   onResizeEnd,
//   autoGrowHeight = true,
//   minH = 4,
//   maxH = 32,
// }) {
//   const { CELL } = SHEET;

//   // ----- estado de posición/tamaño -----
//   const [pos, setPos] = useState({ x: cls.x_grid ?? 0, y: cls.y_grid ?? 0 });
//   const [size, setSize] = useState({ w: cls.w_grid ?? 12, h: cls.h_grid ?? 6 });

//   // drag/resize manual
//   const [dragging, setDragging] = useState(false);
//   const [resizing, setResizing] = useState(false);
//   const start = useRef({ x: 0, y: 0, px: 0, py: 0, w: 0, h: 0 });

//   // ----- datos (lazy) para vista seleccionada -----
//   const [attrs, setAttrs] = useState(null);   // null = aún no cargado
//   const [meths, setMeths] = useState(null);
//   const [loadingDetails, setLoadingDetails] = useState(false);

//   // refs para medir alturas
//   const headerRef = useRef(null);
//   const bodyRef = useRef(null);

//   // sync externo
//   useEffect(() => { setPos({ x: cls.x_grid ?? 0, y: cls.y_grid ?? 0 }); }, [cls.x_grid, cls.y_grid]);
//   useEffect(() => { setSize({ w: cls.w_grid ?? 12, h: cls.h_grid ?? 6 }); }, [cls.w_grid, cls.h_grid]);

//   const pxToGrid = (px) => Math.max(0, Math.round(px / CELL));
//   const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
//   const clampSize = (v, min = 3) => Math.max(min, v);

//   // ---- drag ----
//   const onHeaderMouseDown = useCallback((e) => {
//     if (e.button !== 0) return;
//     setDragging(true);
//     start.current = { x: e.clientX, y: e.clientY, px: pos.x, py: pos.y, w: size.w, h: size.h };
//     e.stopPropagation(); e.preventDefault();
//   }, [pos, size]);

//   // ---- resize manual (esquina) ----
//   const onHandleMouseDown = useCallback((e) => {
//     if (e.button !== 0) return;
//     setResizing(true);
//     start.current = { x: e.clientX, y: e.clientY, px: pos.x, py: pos.y, w: size.w, h: size.h };
//     e.stopPropagation(); e.preventDefault();
//   }, [pos, size]);

//   useEffect(() => {
//     const onMove = (e) => {
//       if (dragging) {
//         const dx = e.clientX - start.current.x;
//         const dy = e.clientY - start.current.y;
//         const gx = pxToGrid(start.current.px * CELL + dx);
//         const gy = pxToGrid(start.current.py * CELL + dy);
//         setPos({ x: gx, y: gy });
//       } else if (resizing) {
//         const dx = e.clientX - start.current.x;
//         const dy = e.clientY - start.current.y;
//         const gw = clampSize(pxToGrid(start.current.w * CELL + dx));
//         const gh = clamp(clampSize(pxToGrid(start.current.h * CELL + dy)), minH, maxH);
//         setSize({ w: gw, h: gh });
//       }
//     };
//     const onUp = () => {
//       if (dragging) {
//         setDragging(false);
//         onDragEnd?.(cls.id, { x_grid: pos.x, y_grid: pos.y });
//       } else if (resizing) {
//         setResizing(false);
//         onResizeEnd?.(cls.id, { w_grid: size.w, h_grid: size.h });
//       }
//     };
//     window.addEventListener("mousemove", onMove);
//     window.addEventListener("mouseup", onUp);
//     return () => {
//       window.removeEventListener("mousemove", onMove);
//       window.removeEventListener("mouseup", onUp);
//     };
//   }, [dragging, resizing, pos, size, onDragEnd, onResizeEnd, cls?.id, CELL, minH, maxH]);

//   // ---- lazy-load detalles SOLO cuando está seleccionada ----
//   useEffect(() => {
//     let alive = true;
//     async function loadDetails() {
//       if (!selected) { setAttrs(null); setMeths(null); return; }
//       setLoadingDetails(true);
//       try {
//         const [a, m] = await Promise.all([ listAttributes(cls.id), listMethods(cls.id) ]);
//         if (!alive) return;
//         setAttrs(a || []);
//         setMeths(m || []);
//       } catch {
//         if (!alive) return;
//         setAttrs([]); setMeths([]);
//       } finally {
//         if (!alive) return;
//         setLoadingDetails(false);
//       }
//     }
//     loadDetails();
//     return () => { alive = false; };
//   }, [selected, cls.id]);

//   // ---- auto-alto: mide contenido y ajusta h_grid (persistiendo) ----
//   // estrategia: medir header + body, sumar margen/handle, convertir a filas (CELL), clamp(minH,maxH)
//   // se ejecuta cuando cambia: selección, datos cargados, o ancho (w_grid) porque reflow cambia líneas
//   const debouncedPersistRef = useRef(null);
//   const persistResizeDebounced = useCallback((newH) => {
//     if (debouncedPersistRef.current) clearTimeout(debouncedPersistRef.current);
//     debouncedPersistRef.current = setTimeout(() => {
//       onResizeEnd?.(cls.id, { w_grid: size.w, h_grid: newH });
//     }, 250); // corta el “ruido” de múltiples mediciones
//   }, [onResizeEnd, cls.id, size.w]);

//   useEffect(() => {
//     if (!autoGrowHeight) return;
//     // Solo ajustamos cuando está seleccionada (cuando mostramos lista completa).
//     // Si quieres que siempre ajuste, quita el early return.
//     if (!selected) return;

//     const headerH = headerRef.current?.offsetHeight ?? 0;
//     const bodyH = bodyRef.current?.scrollHeight ?? 0; // TODO: sin overflow, usamos scrollHeight como medida real
//     const outerPadding = 6; // pequeños extras
//     const totalPx = headerH + bodyH + outerPadding + 16; // +16 por el handle y respiración
//     const neededRows = clamp(Math.ceil(totalPx / CELL), minH, maxH);

//     if (neededRows !== size.h) {
//       setSize((s) => ({ ...s, h: neededRows }));
//       // persistir para que quede guardado en BD
//       persistResizeDebounced(neededRows);
//     }
//   }, [autoGrowHeight, selected, attrs, meths, size.w, CELL, minH, maxH, persistResizeDebounced]);

//   // --- estilos calculados ---
//   const left = (pos.x ?? 0) * CELL;
//   const top = (pos.y ?? 0) * CELL;
//   const width = (size.w ?? 12) * CELL;
//   const height = (size.h ?? 6) * CELL;

//   const counts = useMemo(() => ({
//     attrs: Array.isArray(attrs) ? attrs.length : (cls._attrCount ?? null),
//     meths: Array.isArray(meths) ? meths.length : (cls._methCount ?? null),
//   }), [attrs, meths, cls._attrCount, cls._methCount]);

//   const showCounts = !selected && (counts.attrs !== null || counts.meths !== null);

//   return (
//     <div
//       onMouseDown={() => onSelect?.(cls.id)}
//       style={{
//         position: "absolute",
//         left, top, width, height,
//         background: selected ? "#122038" : "#0e1526",
//         border: selected ? "2px solid #6ab0ff" : "1px solid #334",
//         borderRadius: 8,
//         color: "#eaeefb",
//         boxShadow: selected ? "0 8px 24px rgba(0,80,255,.25)" : "0 6px 20px rgba(0,0,0,.25)",
//         overflow: "hidden",
//         zIndex: cls.z_index ?? 1,
//         cursor: dragging ? "grabbing" : "default",
//         transition: "box-shadow .15s, border-color .15s, background .15s",
//       }}
//       title={selected ? "Seleccionada" : "Click para seleccionar"}
//     >
//       {/* Header (zona de drag) */}
//       <div
//         ref={headerRef}
//         onMouseDown={onHeaderMouseDown}
//         style={{
//           padding: 8,
//           fontWeight: 700,
//           borderBottom: "1px solid #26314d",
//           cursor: "grab",
//           userSelect: "none",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "space-between",
//           gap: 8,
//         }}
//         title="Arrastra para mover"
//       >
//         <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
//           {cls.name ?? cls.nombre ?? "Clase"}
//         </span>
//         {showCounts && (
//           <span style={{ fontSize: 11, opacity: .85 }}>
//             {(counts.attrs ?? 0)} attrs · {(counts.meths ?? 0)} métodos
//           </span>
//         )}
//       </div>

//       {/* Body (sin scroll visual) */}
//       <div
//         ref={bodyRef}
//         style={{
//           padding: 8,
//           fontSize: 12,
//           lineHeight: 1.3,
//           height: "auto",
//           overflow: "hidden", // 👈 sin scroll dentro de la tarjeta
//         }}
//       >
//         {selected ? (
//           loadingDetails ? (
//             <div style={{ opacity: .8 }}>Cargando detalles…</div>
//           ) : (
//             <>
//               {/* Atributos */}
//               <div style={{ marginBottom: 6, fontWeight: 600, opacity: .9 }}>Atributos</div>
//               {(!attrs || attrs.length === 0) ? (
//                 <div style={{ opacity: .7, marginBottom: 8 }}>—</div>
//               ) : (
//                 <ul style={{ margin: 0, paddingLeft: 16, marginBottom: 8 }}>
//                   {attrs.map(a => (
//                     <li key={a.id} style={{ margin: "2px 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
//                       <span style={{ opacity: .95 }}>{a.name ?? a.nombre}</span>
//                       <span style={{ opacity: .7 }}> : {a.type ?? a.tipo ?? "string"}</span>
//                       {a.required ? <span style={{ opacity: .9, marginLeft: 6 }}>*</span> : null}
//                     </li>
//                   ))}
//                 </ul>
//               )}

//               {/* Métodos */}
//               <div style={{ marginBottom: 6, fontWeight: 600, opacity: .9 }}>Métodos</div>
//               {(!meths || meths.length === 0) ? (
//                 <div style={{ opacity: .7 }}>—</div>
//               ) : (
//                 <ul style={{ margin: 0, paddingLeft: 16 }}>
//                   {meths.map(m => (
//                     <li key={m.id} style={{ margin: "2px 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
//                       <span style={{ opacity: .95 }}>{m.name}</span>
//                       <span style={{ opacity: .7 }}> : {m.return_type ?? "void"}</span>
//                     </li>
//                   ))}
//                 </ul>
//               )}
//             </>
//           )
//         ) : (
//           <div style={{ opacity: .75 }}>
//             {size.w}×{size.h} celdas
//           </div>
//         )}
//       </div>

//       {/* Handle de resize manual (sigue disponible) */}
//       <div
//         onMouseDown={onHandleMouseDown}
//         style={{
//           position: "absolute",
//           right: 2, bottom: 2,
//           width: 14, height: 14,
//           border: "1px solid #445",
//           borderRadius: 4,
//           background: "rgba(255,255,255,.06)",
//           cursor: "nwse-resize",
//         }}
//         title="Arrastra para redimensionar"
//       />
//     </div>
//   );
// }
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SHEET } from "./Sheet";
import { listAttributes, listMethods } from "../api/classes";

/**
 * Tarjeta de clase:
 * - Drag + Resize manual (snap a grilla)
 * - Selección visual
 * - Detalles (atributos/métodos):
 *    * selected || pinned || alwaysShowDetails => visibles
 *    * lazy-load al primer uso y cache local
 * - Auto-alto según contenido (persiste h_grid)
 *
 * Props:
 *  - cls: { id, name, x_grid, y_grid, w_grid, h_grid, z_index, _attrCount?, _methCount? }
 *  - selected?: boolean
 *  - onSelect?(id)
 *  - onDragEnd?(id, { x_grid, y_grid })
 *  - onResizeEnd?(id, { w_grid, h_grid })
 *  - autoGrowHeight?: boolean (default: true)
 *  - minH?: number (default: 4)
 *  - maxH?: number (default: 32)
 *  - alwaysShowDetails?: boolean (default: false)  // <- NUEVO
 */
export default function ClassCard({
  cls,
  selected = false,
  onSelect,
  onDragEnd,
  onResizeEnd,
  autoGrowHeight = true,
  minH = 4,
  maxH = 32,
  alwaysShowDetails = false, // NUEVO
}) {
  const { CELL } = SHEET;

  // posición/tamaño
  const [pos, setPos] = useState({ x: cls.x_grid ?? 0, y: cls.y_grid ?? 0 });
  const [size, setSize] = useState({ w: cls.w_grid ?? 12, h: cls.h_grid ?? 6 });

  // drag/resize
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const start = useRef({ x: 0, y: 0, px: 0, py: 0, w: 0, h: 0 });

  // detalles
  const [attrs, setAttrs] = useState(null); // cache local
  const [meths, setMeths] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // NUEVO: pin (fijar tarjeta abierta)
  const [pinned, setPinned] = useState(false);

  // refs para medición
  const headerRef = useRef(null);
  const bodyRef = useRef(null);

  // sync externo
  useEffect(() => { setPos({ x: cls.x_grid ?? 0, y: cls.y_grid ?? 0 }); }, [cls.x_grid, cls.y_grid]);
  useEffect(() => { setSize({ w: cls.w_grid ?? 12, h: cls.h_grid ?? 6 }); }, [cls.w_grid, cls.h_grid]);

  const pxToGrid = (px) => Math.max(0, Math.round(px / CELL));
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const clampSize = (v, min = 3) => Math.max(min, v);

  // drag
  const onHeaderMouseDown = useCallback((e) => {
    if (e.button !== 0) return;
    setDragging(true);
    start.current = { x: e.clientX, y: e.clientY, px: pos.x, py: pos.y, w: size.w, h: size.h };
    e.stopPropagation(); e.preventDefault();
  }, [pos, size]);

  // resize
  const onHandleMouseDown = useCallback((e) => {
    if (e.button !== 0) return;
    setResizing(true);
    start.current = { x: e.clientX, y: e.clientY, px: pos.x, py: pos.y, w: size.w, h: size.h };
    e.stopPropagation(); e.preventDefault();
  }, [pos, size]);

  useEffect(() => {
    const onMove = (e) => {
      if (dragging) {
        const dx = e.clientX - start.current.x;
        const dy = e.clientY - start.current.y;
        const gx = pxToGrid(start.current.px * CELL + dx);
        const gy = pxToGrid(start.current.py * CELL + dy);
        setPos({ x: gx, y: gy });
      } else if (resizing) {
        const dx = e.clientX - start.current.x;
        const dy = e.clientY - start.current.y;
        const gw = clampSize(pxToGrid(start.current.w * CELL + dx));
        const gh = clamp(clampSize(pxToGrid(start.current.h * CELL + dy)), minH, maxH);
        setSize({ w: gw, h: gh });
      }
    };
    const onUp = () => {
      if (dragging) {
        setDragging(false);
        onDragEnd?.(cls.id, { x_grid: pos.x, y_grid: pos.y });
      } else if (resizing) {
        setResizing(false);
        onResizeEnd?.(cls.id, { w_grid: size.w, h_grid: size.h });
      }
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragging, resizing, pos, size, onDragEnd, onResizeEnd, cls?.id, CELL, minH, maxH]);

  // ¿Debemos mostrar detalles?
  const showDetails = alwaysShowDetails || pinned || selected;

  // Lazy-load de detalles cuando haya que mostrarlos por primera vez.
  useEffect(() => {
    let alive = true;
    async function loadDetails() {
      if (!showDetails) return;               // si no hay que mostrar, no cargamos
      if (attrs !== null && meths !== null) return; // ya tenemos cache
      setLoadingDetails(true);
      try {
        const [a, m] = await Promise.all([ listAttributes(cls.id), listMethods(cls.id) ]);
        if (!alive) return;
        setAttrs(a || []);
        setMeths(m || []);
      } catch {
        if (!alive) return;
        setAttrs([]); setMeths([]);
      } finally {
        if (!alive) return;
        setLoadingDetails(false);
      }
    }
    loadDetails();
    return () => { alive = false; };
  }, [showDetails, cls.id]); // ojo: NO reseteamos attrs/meths al perder selección; queda en cache

  // Persistencia del auto-alto
  const debouncedPersistRef = useRef(null);
  const persistResizeDebounced = useCallback((newH) => {
    if (debouncedPersistRef.current) clearTimeout(debouncedPersistRef.current);
    debouncedPersistRef.current = setTimeout(() => {
      onResizeEnd?.(cls.id, { w_grid: size.w, h_grid: newH });
    }, 250);
  }, [onResizeEnd, cls.id, size.w]);

  // Auto-alto cuando mostramos detalles (o cambian datos/ancho)
  useEffect(() => {
    if (!autoGrowHeight) return;
    if (!showDetails) return;

    const headerH = headerRef.current?.offsetHeight ?? 0;
    const bodyH = bodyRef.current?.scrollHeight ?? 0;
    const totalPx = headerH + bodyH + 16; // respiración
    const neededRows = clamp(Math.ceil(totalPx / CELL), minH, maxH);

    if (neededRows !== size.h) {
      setSize((s) => ({ ...s, h: neededRows }));
      persistResizeDebounced(neededRows);
    }
  }, [autoGrowHeight, showDetails, attrs, meths, size.w, CELL, minH, maxH, persistResizeDebounced]);

  // estilos
  const left = (pos.x ?? 0) * CELL;
  const top = (pos.y ?? 0) * CELL;
  const width = (size.w ?? 12) * CELL;
  const height = (size.h ?? 6) * CELL;

  const counts = useMemo(() => ({
    attrs: Array.isArray(attrs) ? attrs.length : (cls._attrCount ?? null),
    meths: Array.isArray(meths) ? meths.length : (cls._methCount ?? null),
  }), [attrs, meths, cls._attrCount, cls._methCount]);

  const showCounts = !showDetails && (counts.attrs !== null || counts.meths !== null);

  return (
    <div
      onMouseDown={() => onSelect?.(cls.id)}
      style={{
        position: "absolute",
        left, top, width, height,
        background: selected ? "#122038" : "#0e1526",
        border: selected ? "2px solid #6ab0ff" : "1px solid #334",
        borderRadius: 8,
        color: "#eaeefb",
        boxShadow: selected ? "0 8px 24px rgba(0,80,255,.25)" : "0 6px 20px rgba(0,0,0,.25)",
        overflow: "hidden",
        zIndex: cls.z_index ?? 1,
        cursor: dragging ? "grabbing" : "default",
        transition: "box-shadow .15s, border-color .15s, background .15s",
      }}
      title={selected ? "Seleccionada" : "Click para seleccionar"}
    >
      {/* Header (drag + acciones) */}
      <div
        ref={headerRef}
        onMouseDown={onHeaderMouseDown}
        style={{
          padding: 8,
          fontWeight: 700,
          borderBottom: "1px solid #26314d",
          cursor: "grab",
          userSelect: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
        }}
        title="Arrastra para mover"
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {cls.name ?? cls.nombre ?? "Clase"}
        </span>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {showCounts && (
            <span style={{ fontSize: 11, opacity: .85 }}>
              {(counts.attrs ?? 0)} attrs · {(counts.meths ?? 0)} métodos
            </span>
          )}
          {/* Botón de pin para fijar detalles */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setPinned(v => !v); }}
            title={pinned ? "Desfijar detalles" : "Fijar detalles"}
            style={{
              border: "1px solid #334",
              background: pinned ? "#334" : "transparent",
              color: "inherit",
              borderRadius: 6,
              padding: "2px 6px",
              cursor: "pointer",
            }}
          >
            {pinned ? "📌" : "📍"}
          </button>
        </div>
      </div>

      {/* Body (detalles cuando showDetails=true) */}
      <div
        ref={bodyRef}
        style={{ padding: 8, fontSize: 12, lineHeight: 1.3, height: "auto", overflow: "hidden" }}
      >
        {showDetails ? (
          loadingDetails ? (
            <div style={{ opacity: .8 }}>Cargando detalles…</div>
          ) : (
            <>
              {/* Atributos */}
              <div style={{ marginBottom: 6, fontWeight: 600, opacity: .9 }}>Atributos</div>
              {(!attrs || attrs.length === 0) ? (
                <div style={{ opacity: .7, marginBottom: 8 }}>—</div>
              ) : (
                <ul style={{ margin: 0, paddingLeft: 16, marginBottom: 8 }}>
                  {attrs.map(a => (
                    <li key={a.id} style={{ margin: "2px 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      <span style={{ opacity: .95 }}>{a.name ?? a.nombre}</span>
                      <span style={{ opacity: .7 }}> : {a.type ?? a.tipo ?? "string"}</span>
                      {a.required ? <span style={{ opacity: .9, marginLeft: 6 }}>*</span> : null}
                    </li>
                  ))}
                </ul>
              )}

              {/* Métodos */}
              <div style={{ marginBottom: 6, fontWeight: 600, opacity: .9 }}>Métodos</div>
              {(!meths || meths.length === 0) ? (
                <div style={{ opacity: .7 }}>—</div>
              ) : (
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                  {meths.map(m => (
                    <li key={m.id} style={{ margin: "2px 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      <span style={{ opacity: .95 }}>{m.name}</span>
                      <span style={{ opacity: .7 }}> : {m.return_type ?? "void"}</span>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )
        ) : (
          <div style={{ opacity: .75 }}>
            {size.w}×{size.h} celdas
          </div>
        )}
      </div>

      {/* Handle de resize manual */}
      <div
        onMouseDown={onHandleMouseDown}
        style={{
          position: "absolute",
          right: 2, bottom: 2,
          width: 14, height: 14,
          border: "1px solid #445",
          borderRadius: 4,
          background: "rgba(255,255,255,.06)",
          cursor: "nwse-resize",
        }}
        title="Arrastra para redimensionar"
      />
    </div>
  );
}
