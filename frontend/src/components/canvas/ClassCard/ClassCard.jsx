// import { useMemo, useRef, useState } from "react";
// import { SHEET } from "../Sheet";
// import Header from "./Header";
// import Body from "./Body";
// import Ports from "./Ports";
// import useDragResize from "./useDragResize";
// import useAutoGrow from "./useAutoGrow";

// /**
//  * Props idénticas a tu componente original:
//  *  - cls, details, selected, onSelect, onDragEnd, onResizeEnd
//  *  - autoGrowHeight, minH, maxH, alwaysShowDetails
//  *  - onStartLink, showLinkPortsOnHover
//  */
// export default function ClassCard({
//   cls,
//   details,
//   selected = false,
//   onSelect,
//   onDragEnd,
//   onResizeEnd,
//   autoGrowHeight = true,
//   minH = 4,
//   maxH = 32,
//   alwaysShowDetails = false,
//   onStartLink,
//   showLinkPortsOnHover = false,
// }) {
//   const { CELL } = SHEET;
//   const headerRef = useRef(null);
//   const bodyRef = useRef(null);

//   // --- drag/resize (misma lógica trasladada) ---
//   const {
//     pos, size, dragging,
//     onHeaderMouseDown, onHandleMouseDown,
//     setSize, setPinned,
//     pinned, setHover, hover,
//   } = useDragResize({
//     cls, minH, maxH, CELL, onDragEnd, onResizeEnd,
//   });

//   const showDetails = alwaysShowDetails || pinned || selected;

//   // --- auto grow (misma lógica trasladada) ---
//   useAutoGrow({
//     enabled: autoGrowHeight && showDetails,
//     headerRef, bodyRef, CELL, minH, maxH,
//     size, setSize, onResizeEnd, clsId: cls.id,
//   });

//   const left = (pos.x ?? 0) * CELL;
//   const top = (pos.y ?? 0) * CELL;
//   const width = (size.w ?? 12) * CELL;
//   const height = (size.h ?? 6) * CELL;

//   const counts = useMemo(
//     () => ({
//       attrs: Array.isArray(details?.attrs) ? details.attrs.length : null,
//       meths: Array.isArray(details?.meths) ? details.meths.length : null,
//     }),
//     [details]
//   );
//   const showCounts = !showDetails && (counts.attrs !== null || counts.meths !== null);

//   const showPorts = selected || (showLinkPortsOnHover && hover);

// //   return (
// //     <div
// //       data-class-id={cls.id}
// //       onMouseDown={() => onSelect?.(cls.id)}
// //       onMouseEnter={() => setHover(true)}
// //       onMouseLeave={() => setHover(false)}
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
// //       <Header
// //         innerRef={headerRef}
// //         onMouseDown={onHeaderMouseDown}
// //         title={cls.name ?? cls.nombre ?? "Clase"}
// //         pinned={pinned}
// //         setPinned={setPinned}
// //         showCounts={showCounts}
// //         counts={counts}
// //       />

// //       <Body
// //         innerRef={bodyRef}
// //         showDetails={showDetails}
// //         details={details}
// //         size={size}
// //       />

// //       {/* Handle de resize */}
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

// //       {/* Puertos invisibles */}
// //       <Ports
// //         visible={showPorts}
// //         onStartLink={(side, e) => onStartLink?.(cls.id, side, { x: e.clientX, y: e.clientY })}
// //       />
// //     </div>
// //   );
// return (
//   <div
//     data-class-id={cls.id}
//     onMouseDown={() => onSelect?.(cls.id)}
//     onMouseEnter={() => setHover(true)}
//     onMouseLeave={() => setHover(false)}
//     style={{
//       position: "absolute",
//       left, top, width, height,
//       // IMPORTANTE: que los puertos puedan “salir” fuera
//       overflow: "visible",
//       zIndex: cls.z_index ?? 1,
//       cursor: dragging ? "grabbing" : "default",
//     }}
//     title={selected ? "Seleccionada" : "Click para seleccionar"}
//   >
//     {/* Caja visual del card (con el look & feel de siempre) */}
//     <div
//       style={{
//         position: "absolute",
//         inset: 0,
//         background: selected ? "#122038" : "#0e1526",
//         border: selected ? "2px solid #6ab0ff" : "1px solid #334",
//         borderRadius: 8,
//         color: "#eaeefb",
//         boxShadow: selected ? "0 8px 24px rgba(0,80,255,.25)" : "0 6px 20px rgba(0,0,0,.25)",
//         overflow: "hidden", // se mantiene para el contenido interno
//         transition: "box-shadow .15s, border-color .15s, background .15s",
//       }}
//     >
//       <Header
//         innerRef={headerRef}
//         onMouseDown={onHeaderMouseDown}
//         title={cls.name ?? cls.nombre ?? "Clase"}
//         pinned={pinned}
//         setPinned={setPinned}
//         showCounts={showCounts}
//         counts={counts}
//       />

//       <Body innerRef={bodyRef} showDetails={showDetails} details={details} size={size} />

//       {/* Handle de resize (sin cambios) */}
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

//     {/* Puertos / flechas (se posicionan relativo al contenedor externo) */}
//     <Ports
//       visible={selected || (showLinkPortsOnHover && hover)}
//       onStartLink={(side, e) => onStartLink?.(cls.id, side, { x: e.clientX, y: e.clientY })}
//     />
//   </div>
// );

// }
import { useMemo, useRef, useState } from "react";
import { SHEET } from "../Sheet";
import Header from "./Header";
import Body from "./Body";
import Ports from "./Ports";
import useDragResize from "./useDragResize";
import useAutoGrow from "./useAutoGrow";

/** halo de hover (debe coincidir con HIT en Ports.jsx idealmente) */
const PORT_MARGIN = 22;

/**
 * Props:
 *  - cls, details, selected, onSelect, onDragEnd, onResizeEnd
 *  - autoGrowHeight, minH, maxH, alwaysShowDetails
 *  - onStartLink(fromId, side, pt), showLinkPortsOnHover
 *  - forceShowPorts (nuevo): fuerza mostrar puertos (útil durante linking)
 */
export default function ClassCard({
  cls,
  details,
  selected = false,
  onSelect,
  onDragEnd,
  onResizeEnd,
  autoGrowHeight = true,
  minH = 4,
  maxH = 32,
  alwaysShowDetails = false,
  onStartLink,
  showLinkPortsOnHover = false,
  forceShowPorts = false,
}) {
  const { CELL } = SHEET;
  const headerRef = useRef(null);
  const bodyRef = useRef(null);

  // --- drag/resize (misma lógica) ---
  const {
    pos, size, dragging,
    onHeaderMouseDown, onHandleMouseDown,
    setSize, setPinned,
    pinned, setHover, hover,
  } = useDragResize({
    cls, minH, maxH, CELL, onDragEnd, onResizeEnd,
  });

  const showDetails = alwaysShowDetails || pinned || selected;

  // --- auto grow ---
  useAutoGrow({
    enabled: autoGrowHeight && showDetails,
    headerRef, bodyRef, CELL, minH, maxH,
    size, setSize, onResizeEnd, clsId: cls.id,
  });

  const left = (pos.x ?? 0) * CELL;
  const top = (pos.y ?? 0) * CELL;
  const width = (size.w ?? 12) * CELL;
  const height = (size.h ?? 6) * CELL;

  const counts = useMemo(
    () => ({
      attrs: Array.isArray(details?.attrs) ? details.attrs.length : null,
      meths: Array.isArray(details?.meths) ? details.meths.length : null,
    }),
    [details]
  );
  const showCounts = !showDetails && (counts.attrs !== null || counts.meths !== null);

  const showPorts = forceShowPorts || selected || (showLinkPortsOnHover && hover);

  return (
    <div
      data-class-id={cls.id}
      onMouseDown={() => onSelect?.(cls.id)}
      style={{
        position: "absolute",
        left, top, width, height,
        overflow: "visible",      // para que los puertos “salgan”
        zIndex: cls.z_index ?? 1,
        cursor: dragging ? "grabbing" : "default",
      }}
      title={selected ? "Seleccionada" : "Click para seleccionar"}
    >
      {/* HALO de hover (invisible), un poquito más grande que el card */}
      <div
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          position: "absolute",
          left: -PORT_MARGIN,
          top: -PORT_MARGIN,
          width: width + PORT_MARGIN * 2,
          height: height + PORT_MARGIN * 2,
          pointerEvents: "auto",
          background: "transparent",
        }}
      />

      {/* Caja visual del card */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: selected ? "#122038" : "#0e1526",
          border: selected ? "2px solid #6ab0ff" : "1px solid #334",
          borderRadius: 8,
          color: "#eaeefb",
          boxShadow: selected ? "0 8px 24px rgba(0,80,255,.25)" : "0 6px 20px rgba(0,0,0,.25)",
          overflow: "hidden",
          transition: "box-shadow .15s, border-color .15s, background .15s",
        }}
      >
        <Header
          innerRef={headerRef}
          onMouseDown={onHeaderMouseDown}
          title={cls.name ?? cls.nombre ?? "Clase"}
          pinned={pinned}
          setPinned={setPinned}
          showCounts={showCounts}
          counts={counts}
        />

        <Body innerRef={bodyRef} showDetails={showDetails} details={details} size={size} />

        {/* Handle de resize */}
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

      {/* Puertos */}
      <Ports
        visible={showPorts}
        onStartLink={(side, e) =>
          onStartLink?.(cls.id, side, { x: e.clientX, y: e.clientY })
        }
      />
    </div>
  );
}
