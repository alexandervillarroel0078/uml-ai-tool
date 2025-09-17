// // // hoja estática con grilla y children posicionados por grid
// // export const SHEET = {
// //   COLS: 96,     // ancho en celdas
// //   ROWS: 64,     // alto en celdas
// //   CELL: 16,     // tamaño px de cada celda
// // };

// // export default function Sheet({ children }) {
// //   const { COLS, ROWS, CELL } = SHEET;
// //   return (
// //     <div
// //       style={{
// //         position: "relative",
// //         width: COLS * CELL,
// //         height: ROWS * CELL,
// //         margin: 24,
// //         background:
// //           "linear-gradient(#182032 1px, transparent 1px), linear-gradient(90deg, #182032 1px, transparent 1px)",
// //         backgroundSize: `${CELL}px ${CELL}px`,
// //         border: "1px solid #26314d",
// //         borderRadius: 12,
// //         overflow: "hidden",
// //       }}
// //     >
// //       {children}
// //     </div>
// //   );
// // }
// import React, { useCallback, useEffect, useRef, useState } from "react";

// /** Tamaño de hoja en celdas + tamaño de celda (px) */
// export const SHEET = { COLS: 96, ROWS: 64, CELL: 16 };

// /**
//  * Lienzo con grilla + cámara local (pan/zoom) por transform.
//  * Pan: botón central o Ctrl+arrastrar.  Zoom: rueda del mouse.
//  * No persiste nada en el backend (es solo vista).
//  */
// export default function Sheet({ children }) {
//   const { COLS, ROWS, CELL } = SHEET;
//   const ref = useRef(null);
//   const [cam, setCam] = useState(() => ({ x: 0, y: 0, z: 1 })); // cámara local
//   const panning = useRef(false);
//   const last = useRef({ x: 0, y: 0 });

//   const onWheel = useCallback((e) => {
//     e.preventDefault();
//     // zoom hacia/desde el cursor simple (sin re-centrar)
//     const delta = Math.sign(e.deltaY) * 0.1;
//     setCam((c) => {
//       const z = Math.min(1.5, Math.max(0.5, c.z - delta));
//       return { ...c, z };
//     });
//   }, []);

//   const onMouseDown = useCallback((e) => {
//     if (e.button !== 1 && !(e.button === 0 && e.ctrlKey)) return; // rueda o Ctrl+arrastrar
//     panning.current = true;
//     last.current = { x: e.clientX, y: e.clientY };
//   }, []);

//   const onMouseMove = useCallback((e) => {
//     if (!panning.current) return;
//     const dx = e.clientX - last.current.x;
//     const dy = e.clientY - last.current.y;
//     last.current = { x: e.clientX, y: e.clientY };
//     setCam((c) => ({ ...c, x: c.x + dx, y: c.y + dy }));
//   }, []);

//   const onMouseUp = useCallback(() => { panning.current = false; }, []);

//   useEffect(() => {
//     const el = ref.current;
//     if (!el) return;
//     el.addEventListener("wheel", onWheel, { passive: false });
//     return () => el.removeEventListener("wheel", onWheel);
//   }, [onWheel]);

//   useEffect(() => {
//     const el = ref.current;
//     if (!el) return;
//     el.addEventListener("mousedown", onMouseDown);
//     window.addEventListener("mousemove", onMouseMove);
//     window.addEventListener("mouseup", onMouseUp);
//     return () => {
//       el.removeEventListener("mousedown", onMouseDown);
//       window.removeEventListener("mousemove", onMouseMove);
//       window.removeEventListener("mouseup", onMouseUp);
//     };
//   }, [onMouseDown, onMouseMove, onMouseUp]);

//   return (
//     <div
//       ref={ref}
//       style={{
//         position: "relative",
//         width: "100%",
//         height: "100%",
//         overflow: "hidden",
//         background: "#0b1020",
//         userSelect: panning.current ? "none" : undefined,
//       }}
//       title="Pan: rueda o Ctrl+arrastrar | Zoom: rueda"
//     >
//       <div
//         style={{
//           position: "absolute",
//           left: cam.x,
//           top: cam.y,
//           transform: `scale(${cam.z})`,
//           transformOrigin: "0 0",
//           width: COLS * CELL,
//           height: ROWS * CELL,
//           background:
//             "linear-gradient(#182032 1px, transparent 1px), linear-gradient(90deg, #182032 1px, transparent 1px)",
//           backgroundSize: `${CELL}px ${CELL}px`,
//           border: "1px solid #26314d",
//           borderRadius: 12,
//           overflow: "hidden",
//         }}
//       >
//         {children}
//       </div>
//     </div>
//   );
// }
import React, { useCallback, useEffect, useRef, useState } from "react";

/** Tamaño de hoja en celdas + tamaño de celda (px) */
export const SHEET = { COLS: 96, ROWS: 64, CELL: 16 };

/**
 * Lienzo con grilla + cámara local (pan/zoom) por transform.
 * Pan: botón central o Ctrl+arrastrar.  Zoom: rueda del mouse.
 * Props opcionales:
 *  - onCanvasClick?: (world: { x_grid:number, y_grid:number }) => void
 */
export default function Sheet({ children, onCanvasClick }) {
  const { COLS, ROWS, CELL } = SHEET;
  const ref = useRef(null);
  const [cam, setCam] = useState(() => ({ x: 0, y: 0, z: 1 })); // cámara local
  const panning = useRef(false);
  const last = useRef({ x: 0, y: 0 });

  const onWheel = useCallback((e) => {
    e.preventDefault();
    const delta = Math.sign(e.deltaY) * 0.1;
    setCam((c) => {
      const z = Math.min(1.5, Math.max(0.5, c.z - delta));
      return { ...c, z };
    });
  }, []);

  const onMouseDown = useCallback((e) => {
    // Pan solo con rueda o Ctrl+izquierdo
    if (e.button !== 1 && !(e.button === 0 && e.ctrlKey)) return;
    panning.current = true;
    last.current = { x: e.clientX, y: e.clientY };
  }, []);

  const onMouseMove = useCallback((e) => {
    if (!panning.current) return;
    const dx = e.clientX - last.current.x;
    const dy = e.clientY - last.current.y;
    last.current = { x: e.clientX, y: e.clientY };
    setCam((c) => ({ ...c, x: c.x + dx, y: c.y + dy }));
  }, []);

  const onMouseUp = useCallback(() => { panning.current = false; }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [onWheel]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      el.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [onMouseDown, onMouseMove, onMouseUp]);

  // Click para crear: calculamos coordenadas de mundo -> celdas con snap
  const handleClick = useCallback((e) => {
    if (!onCanvasClick) return;
    // Pos del click relativa al contenedor
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const localX = e.clientX - rect.left;
    const localY = e.clientY - rect.top;
    // Invertir transform de cámara (primero quitar pan, luego desescalar)
    const worldPxX = (localX - cam.x) / cam.z;
    const worldPxY = (localY - cam.y) / cam.z;
    // Snap a celdas
    const x_grid = Math.max(0, Math.round(worldPxX / CELL));
    const y_grid = Math.max(0, Math.round(worldPxY / CELL));
    onCanvasClick({ x_grid, y_grid });
  }, [onCanvasClick, cam.x, cam.y, cam.z, CELL]);

  return (
    <div
      ref={ref}
      onClick={handleClick}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background: "#0b1020",
        userSelect: panning.current ? "none" : undefined,
      }}
      title="Pan: rueda o Ctrl+arrastrar | Zoom: rueda | Click: acción del padre"
    >
      <div
        style={{
          position: "absolute",
          left: cam.x,
          top: cam.y,
          transform: `scale(${cam.z})`,
          transformOrigin: "0 0",
          width: COLS * CELL,
          height: ROWS * CELL,
          background:
            "linear-gradient(#182032 1px, transparent 1px), linear-gradient(90deg, #182032 1px, transparent 1px)",
          backgroundSize: `${CELL}px ${CELL}px`,
          border: "1px solid #26314d",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        {children}
      </div>
    </div>
  );
}
