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
//   // 🔹 Estado: lista de atributos de una clase
//   const [attributes, setAttributes] = useState([]);

//   // 🔹 Estado: ID del atributo actualmente seleccionado
//   const [selectedAttrId, setSelectedAttrId] = useState(null);

//   // 🔹 Derivado: el atributo seleccionado completo (o null si no hay)
//   const selectedAttribute =
//     attributes.find((a) => a.id === selectedAttrId) || null;

//   // ====== CARGA INICIAL ======
//   async function loadAttributes() {
//     if (!classId) return;
//     try {
//       // 📡 Llamada API: obtiene los atributos de la clase
//       const items = await listAttributes(classId);
//       setAttributes(items || []);

//       // 🧹 Si el atributo seleccionado ya no existe, se deselecciona
//       if (selectedAttrId && !items?.some((x) => x.id === selectedAttrId)) {
//         setSelectedAttrId(null);
//       }
//     } catch {
//       // Si falla la carga, deja la lista vacía
//       setAttributes([]);
//     }
//   }

//   // 🔹 useEffect: carga inicial cuando cambia el `classId`
//   useEffect(() => {
//     if (classId) loadAttributes();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [classId]);

//   // ====== CRUD (llaman a la API, no actualizan el state directo) ======
//   async function createAttribute(body) {
//     return await apiCreateAttribute(classId, body);
//   }

//   async function updateAttribute(attrId, patch) {
//     return await apiUpdateAttribute(attrId, patch);
//   }

//   async function deleteAttribute(attrId) {
//     if (!confirm("¿Eliminar este atributo?")) return;
//     return await apiDeleteAttribute(attrId);
//   }

//   // ====== EVENTOS EN TIEMPO REAL ======
//   useEffect(() => {
//     if (!classId) return;

//     // Evento: cuando se crea un atributo
//     onEvent("attribute.created", (a) => {
//       if (a.clase_id === classId) {
//         setAttributes((prev) => [...prev, a]);
//       }
//     });

//     // Evento: cuando se actualiza un atributo
//     onEvent("attribute.updated", (a) => {
//       if (a.clase_id === classId) {
//         setAttributes((prev) =>
//           prev.map((x) => (x.id === a.id ? { ...x, ...a } : x))
//         );
//       }
//     });

//     // Evento: cuando se elimina un atributo
//     onEvent("attribute.deleted", ({ id }) => {
//       setAttributes((prev) => prev.filter((x) => x.id !== id));
//       if (selectedAttrId === id) setSelectedAttrId(null);
//     });
//   }, [classId, selectedAttrId]);

//   // 🔹 Retorna todo lo necesario para usar atributos en un componente
//   return {
//     attributes,        // lista de atributos
//     selectedAttrId,    // id seleccionado
//     setSelectedAttrId, // setter para seleccionar atributo
//     selectedAttribute, // objeto del atributo seleccionado

//     loadAttributes,    // recarga desde la API
//     createAttribute,   // crea uno nuevo
//     updateAttribute,   // actualiza existente
//     deleteAttribute,   // elimina existente
//   };
// }
import { useEffect, useState } from "react";
import {
  listAttributes,
  createAttribute as apiCreateAttribute,
  updateAttribute as apiUpdateAttribute,
  deleteAttribute as apiDeleteAttribute,
} from "../api/classes";

export default function useAttributes(classId) {
  const [attributes, setAttributes] = useState([]);
  const [selectedAttrId, setSelectedAttrId] = useState(null);

  const selectedAttribute =
    attributes.find((a) => a.id === selectedAttrId) || null;

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
