// // src/hooks/useAttributes.js
// import { useEffect, useState } from "react";
// import {
//   listAttributes,
//   createAttribute as apiCreateAttribute,
//   updateAttribute as apiUpdateAttribute,
//   deleteAttribute as apiDeleteAttribute,
// } from "../api/classes";
// import { onEvent } from "../api/realtime";

// export default function useAttributes(classId) {
//   const [attributes, setAttributes] = useState([]);
//   const [selectedAttrId, setSelectedAttrId] = useState(null);

//   const selectedAttribute =
//     attributes.find((a) => a.id === selectedAttrId) || null;

//   // ====== CARGA INICIAL ======
//   async function loadAttributes() {
//     if (!classId) return;
//     try {
//       const items = await listAttributes(classId);
//       setAttributes(items || []);
//       if (selectedAttrId && !items?.some((x) => x.id === selectedAttrId)) {
//         setSelectedAttrId(null);
//       }
//     } catch {
//       setAttributes([]);
//     }
//   }

//   useEffect(() => {
//     if (classId) loadAttributes();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [classId]);

//   // ====== CRUD ======
//   async function createAttribute(body) {
//     try {
//       const a = await apiCreateAttribute(classId, body);
//       setAttributes((prev) => [...prev, a]);
//       return a;
//     } catch (e) {
//       alert(e?.response?.data?.detail || "No se pudo crear el atributo");
//       throw e;
//     }
//   }

//   async function updateAttribute(attrId, patch) {
//     try {
//       const updated = await apiUpdateAttribute(attrId, patch);
//       setAttributes((prev) =>
//         prev.map((a) => (a.id === attrId ? updated : a))
//       );
//       return updated;
//     } catch (e) {
//       alert(e?.response?.data?.detail || "No se pudo actualizar el atributo");
//       throw e;
//     }
//   }

//   async function deleteAttribute(attrId) {
//     if (!confirm("¿Eliminar este atributo?")) return;
//     try {
//       await apiDeleteAttribute(attrId);
//       setAttributes((prev) => prev.filter((a) => a.id !== attrId));
//       if (selectedAttrId === attrId) setSelectedAttrId(null);
//     } catch (e) {
//       alert(e?.response?.data?.detail || "No se pudo eliminar el atributo");
//     }
//   }

//   // ====== EVENTOS EN TIEMPO REAL ======
//   useEffect(() => {
//     if (!classId) return;

//     // crear
//     onEvent("attribute.created", (a) => {
//       if (a.clase_id === classId) {
//         setAttributes((prev) => [...prev, a]);
//       }
//     });

//     // actualizar
//     onEvent("attribute.updated", (a) => {
//       if (a.clase_id === classId) {
//         setAttributes((prev) =>
//           prev.map((x) => (x.id === a.id ? { ...x, ...a } : x))
//         );
//       }
//     });

//     // eliminar
//     onEvent("attribute.deleted", ({ id }) => {
//       setAttributes((prev) => prev.filter((x) => x.id !== id));
//       if (selectedAttrId === id) setSelectedAttrId(null);
//     });
//   }, [classId, selectedAttrId]);

//   return {
//     attributes,
//     selectedAttrId,
//     setSelectedAttrId,
//     selectedAttribute,

//     loadAttributes,
//     createAttribute,
//     updateAttribute,
//     deleteAttribute,
//   };
// }
// src/hooks/useAttributes.js
import { useEffect, useState } from "react";
import {
  listAttributes,
  createAttribute as apiCreateAttribute,
  updateAttribute as apiUpdateAttribute,
  deleteAttribute as apiDeleteAttribute,
} from "../api/classes";
import { onEvent } from "../api/realtime";

export default function useAttributes(classId) {
  const [attributes, setAttributes] = useState([]);
  const [selectedAttrId, setSelectedAttrId] = useState(null);

  const selectedAttribute =
    attributes.find((a) => a.id === selectedAttrId) || null;

  // ====== CARGA INICIAL ======
  async function loadAttributes() {
    if (!classId) return;
    try {
      const items = await listAttributes(classId);
      setAttributes(items || []);
      if (selectedAttrId && !items?.some((x) => x.id === selectedAttrId)) {
        setSelectedAttrId(null);
      }
    } catch {
      setAttributes([]);
    }
  }

  useEffect(() => {
    if (classId) loadAttributes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId]);

  // ====== CRUD (solo API, sin tocar state) ======
  async function createAttribute(body) {
    return await apiCreateAttribute(classId, body);
  }

  async function updateAttribute(attrId, patch) {
    return await apiUpdateAttribute(attrId, patch);
  }

  async function deleteAttribute(attrId) {
    if (!confirm("¿Eliminar este atributo?")) return;
    return await apiDeleteAttribute(attrId);
  }

  // ====== EVENTOS EN TIEMPO REAL ======
  useEffect(() => {
    if (!classId) return;

    // crear
    onEvent("attribute.created", (a) => {
      if (a.clase_id === classId) {
        setAttributes((prev) => [...prev, a]);
      }
    });

    // actualizar
    onEvent("attribute.updated", (a) => {
      if (a.clase_id === classId) {
        setAttributes((prev) =>
          prev.map((x) => (x.id === a.id ? { ...x, ...a } : x))
        );
      }
    });

    // eliminar
    onEvent("attribute.deleted", ({ id }) => {
      setAttributes((prev) => prev.filter((x) => x.id !== id));
      if (selectedAttrId === id) setSelectedAttrId(null);
    });
  }, [classId, selectedAttrId]);

  return {
    attributes,
    selectedAttrId,
    setSelectedAttrId,
    selectedAttribute,

    loadAttributes,
    createAttribute,
    updateAttribute,
    deleteAttribute,
  };
}
