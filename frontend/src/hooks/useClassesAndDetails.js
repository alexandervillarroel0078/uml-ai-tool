 
// import { useEffect, useState } from "react";
// import {
//   listClasses,
//   createClass as apiCreateClass,
//   updateClass,
//   deleteClass as apiDeleteClass,
//   updateClassPosition,
//   updateClassSize,
//   listAttributes,
//   listMethods,
// } from "../api/classes";
// import useDebouncedCallback from "./useDebouncedCallback";

// export default function useClassesAndDetails(diagram) {
//   // Clases (position/size/name)
//   const [classes, setClasses] = useState([]);
//   const [selectedId, setSelectedId] = useState(null);
//   const selected = classes.find((c) => c.id === selectedId) || null;

//   // Cache centralizado de detalles por clase
//   const [detailsByClass, setDetailsByClass] = useState({});

//   // Crear por click
//   const [insertMode, setInsertMode] = useState(false);
//   const [insertName, setInsertName] = useState("NuevaClase");

//   // ====== CARGA CLASES ======
//   const fetchDetails = async (classId) => {
//     if (!classId) return;
//     try {
//       const [a, m] = await Promise.all([listAttributes(classId), listMethods(classId)]);
//       setDetailsByClass((prev) => ({ ...prev, [classId]: { attrs: a || [], meths: m || [] } }));
//     } catch {
//       setDetailsByClass((prev) => ({ ...prev, [classId]: { attrs: [], meths: [] } }));
//     }
//   };

//   async function loadClasses() {
//     try {
//       const items = await listClasses(diagram?.id);
//       setClasses(items || []);
//       if (selectedId && !items?.some((x) => x.id === selectedId)) setSelectedId(null);

//       // Cargar detalles de todas las clases si faltan
//       await Promise.all(
//         (items || []).map((c) =>
//           detailsByClass[c.id] ? Promise.resolve() : fetchDetails(c.id)
//         )
//       );
//     } catch {
//       setClasses([]);
//       setSelectedId(null);
//     }
//   }

//   useEffect(() => {
//     if (diagram) loadClasses();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [diagram]);

//   useEffect(() => {
//     if (!selectedId) return;
//     if (!detailsByClass[selectedId]) {
//       fetchDetails(selectedId);
//     }
//   }, [selectedId, detailsByClass]);

//   function replaceDetails(classId, patch) {
//     setDetailsByClass((prev) => ({
//       ...prev,
//       [classId]: { ...(prev[classId] || { attrs: [], meths: [] }), ...patch },
//     }));
//   }

//   // ====== CREAR CLASE POR CLICK EN HOJA ======
//   async function handleCanvasClick({ x_grid, y_grid }) {
//     if (!insertMode) return;
//     try {
//       const c = await apiCreateClass(diagram.id, {
//         name: insertName.trim() || "NuevaClase",
//         x_grid,
//         y_grid,
//         w_grid: 12,
//         h_grid: 6,
//         z_index: 1,
//       });
//       await loadClasses();
//       setSelectedId(c.id);
//       replaceDetails(c.id, { attrs: [], meths: [] });
//     } catch (e) {
//       alert(e?.response?.data?.detail || "No se pudo crear la clase");
//     } finally {
//       setInsertMode(false);
//     }
//   }

//   // ====== RENAME ======
//   const debouncedSave = useDebouncedCallback(async (classId, name) => {
//     const updated = await updateClass(classId, { name });
//     setClasses((prev) => prev.map((c) => (c.id === classId ? updated : c)));
//   }, 600);

//   async function onBlurName(classId, value) {
//     const updated = await updateClass(classId, { name: value });
//     setClasses((prev) => prev.map((c) => (c.id === classId ? updated : c)));
//   }

//   // ====== DRAG/RESIZE ======
//   async function handleDragEnd(classId, { x_grid, y_grid }) {
//     try {
//       await updateClassPosition(classId, { x_grid, y_grid });
//       setClasses((prev) => prev.map((c) => (c.id === classId ? { ...c, x_grid, y_grid } : c)));
//     } catch (e) {
//       alert(e?.response?.data?.detail || "No se pudo mover la clase");
//       await loadClasses();
//     }
//   }

//   async function handleResizeEnd(classId, { w_grid, h_grid }) {
//     try {
//       await updateClassSize(classId, { w_grid, h_grid });
//       setClasses((prev) => prev.map((c) => (c.id === classId ? { ...c, w_grid, h_grid } : c)));
//     } catch (e) {
//       alert(e?.response?.data?.detail || "No se pudo redimensionar la clase");
//       await loadClasses();
//     }
//   }

//   // ====== ELIMINAR CLASE ======
//   async function handleDelete(classId) {
//     if (!confirm("¿Eliminar esta clase?")) return;
//     try {
//       await apiDeleteClass(classId);
//       setClasses((prev) => prev.filter((c) => c.id !== classId));
//       setDetailsByClass((prev) => {
//         const n = { ...prev };
//         delete n[classId];
//         return n;
//       });
//       if (selectedId === classId) setSelectedId(null);
//     } catch (e) {
//       alert(e?.response?.data?.detail || "No se pudo eliminar");
//     }
//   }
//   async function handleRename(classId, name) {
//     try {
//       const updated = await updateClass(classId, { name });
//       setClasses((prev) => prev.map((c) => (c.id === classId ? updated : c)));
//     } catch (e) {
//       alert(e?.response?.data?.detail || "No se pudo renombrar la clase");
//     }
//   }

//   return {
//     // estado
//     classes, setClasses,
//     selectedId, setSelectedId,
//     selected,
//     detailsByClass, replaceDetails,
//     insertMode, setInsertMode,
//     insertName, setInsertName,

//     // ops
//     loadClasses,
//     fetchDetails,
//     handleCanvasClick,
//     debouncedSave,
//     handleRename, 
//     handleDragEnd,
//     handleResizeEnd,
//     handleDelete,
//   };
// }
// src/hooks/useClassesAndDetails.js
import { useEffect, useState } from "react";
import {
  listClasses,
  createClass as apiCreateClass,
  updateClass,
  deleteClass as apiDeleteClass,
  updateClassPosition,
  updateClassSize,
  listAttributes,
  listMethods,
} from "../api/classes";
import useDebouncedCallback from "./useDebouncedCallback";
import { connect, disconnect, onEvent } from "../api/realtime"; // 👈 nuevo

export default function useClassesAndDetails(diagram) {
  // Clases (position/size/name)
  const [classes, setClasses] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const selected = classes.find((c) => c.id === selectedId) || null;

  // Cache centralizado de detalles por clase
  const [detailsByClass, setDetailsByClass] = useState({});

  // Crear por click
  const [insertMode, setInsertMode] = useState(false);
  const [insertName, setInsertName] = useState("NuevaClase");

  // ====== CARGA CLASES ======
  const fetchDetails = async (classId) => {
    if (!classId) return;
    try {
      const [a, m] = await Promise.all([listAttributes(classId), listMethods(classId)]);
      setDetailsByClass((prev) => ({ ...prev, [classId]: { attrs: a || [], meths: m || [] } }));
    } catch {
      setDetailsByClass((prev) => ({ ...prev, [classId]: { attrs: [], meths: [] } }));
    }
  };

  async function loadClasses() {
    try {
      const items = await listClasses(diagram?.id);
      setClasses(items || []);
      if (selectedId && !items?.some((x) => x.id === selectedId)) setSelectedId(null);

      await Promise.all(
        (items || []).map((c) =>
          detailsByClass[c.id] ? Promise.resolve() : fetchDetails(c.id)
        )
      );
    } catch {
      setClasses([]);
      setSelectedId(null);
    }
  }

  useEffect(() => {
    if (diagram) {
      loadClasses();

      // 🔌 Conectar WS cuando abres diagrama
      connect(diagram.id);

      // Eventos en tiempo real
      onEvent("class.created", (c) => {
        setClasses((prev) => [...prev, c]);
        setDetailsByClass((prev) => ({ ...prev, [c.id]: { attrs: [], meths: [] } }));
      });

      onEvent("class.updated", (c) => {
        setClasses((prev) => prev.map((x) => (x.id === c.id ? c : x)));
      });

      onEvent("class.deleted", ({ id }) => {
        setClasses((prev) => prev.filter((x) => x.id !== id));
        setDetailsByClass((prev) => {
          const n = { ...prev };
          delete n[id];
          return n;
        });
        if (selectedId === id) setSelectedId(null);
      });

      return () => disconnect(); // 🔌 Cerrar WS al salir
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diagram]);

  useEffect(() => {
    if (!selectedId) return;
    if (!detailsByClass[selectedId]) {
      fetchDetails(selectedId);
    }
  }, [selectedId, detailsByClass]);

  function replaceDetails(classId, patch) {
    setDetailsByClass((prev) => ({
      ...prev,
      [classId]: { ...(prev[classId] || { attrs: [], meths: [] }), ...patch },
    }));
  }

  // ====== CREAR CLASE POR CLICK EN HOJA ======
  async function handleCanvasClick({ x_grid, y_grid }) {
    if (!insertMode) return;
    try {
      const c = await apiCreateClass(diagram.id, {
        name: insertName.trim() || "NuevaClase",
        x_grid,
        y_grid,
        w_grid: 12,
        h_grid: 6,
        z_index: 1,
      });
      await loadClasses();
      setSelectedId(c.id);
      replaceDetails(c.id, { attrs: [], meths: [] });
    } catch (e) {
      alert(e?.response?.data?.detail || "No se pudo crear la clase");
    } finally {
      setInsertMode(false);
    }
  }

  // ====== RENAME ======
  const debouncedSave = useDebouncedCallback(async (classId, name) => {
    const updated = await updateClass(classId, { name });
    setClasses((prev) => prev.map((c) => (c.id === classId ? updated : c)));
  }, 600);

  async function onBlurName(classId, value) {
    const updated = await updateClass(classId, { name: value });
    setClasses((prev) => prev.map((c) => (c.id === classId ? updated : c)));
  }

  // ====== DRAG/RESIZE ======
  async function handleDragEnd(classId, { x_grid, y_grid }) {
    try {
      await updateClassPosition(classId, { x_grid, y_grid });
      setClasses((prev) => prev.map((c) => (c.id === classId ? { ...c, x_grid, y_grid } : c)));
    } catch (e) {
      alert(e?.response?.data?.detail || "No se pudo mover la clase");
      await loadClasses();
    }
  }

  async function handleResizeEnd(classId, { w_grid, h_grid }) {
    try {
      await updateClassSize(classId, { w_grid, h_grid });
      setClasses((prev) => prev.map((c) => (c.id === classId ? { ...c, w_grid, h_grid } : c)));
    } catch (e) {
      alert(e?.response?.data?.detail || "No se pudo redimensionar la clase");
      await loadClasses();
    }
  }

  // ====== ELIMINAR CLASE ======
  async function handleDelete(classId) {
    if (!confirm("¿Eliminar esta clase?")) return;
    try {
      await apiDeleteClass(classId);
      setClasses((prev) => prev.filter((c) => c.id !== classId));
      setDetailsByClass((prev) => {
        const n = { ...prev };
        delete n[classId];
        return n;
      });
      if (selectedId === classId) setSelectedId(null);
    } catch (e) {
      alert(e?.response?.data?.detail || "No se pudo eliminar");
    }
  }

  async function handleRename(classId, name) {
    try {
      const updated = await updateClass(classId, { name });
      setClasses((prev) => prev.map((c) => (c.id === classId ? updated : c)));
    } catch (e) {
      alert(e?.response?.data?.detail || "No se pudo renombrar la clase");
    }
  }

  return {
    classes, setClasses,
    selectedId, setSelectedId,
    selected,
    detailsByClass, replaceDetails,
    insertMode, setInsertMode,
    insertName, setInsertName,

    loadClasses,
    fetchDetails,
    handleCanvasClick,
    debouncedSave,
    handleRename, 
    handleDragEnd,
    handleResizeEnd,
    handleDelete,
  };
}
