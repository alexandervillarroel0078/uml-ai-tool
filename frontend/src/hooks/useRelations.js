// // src/hooks/useRelations.js
// import { useEffect, useState } from "react";
// import {
//   listRelations,
//   createRelation as apiCreateRelation,
//   updateRelation as apiUpdateRelation,
//   deleteRelation as apiDeleteRelation,
// } from "../api/relations";
// import { onEvent } from "../api/realtime";

// export default function useRelations(diagram) {
//   const [relations, setRelations] = useState([]);
//   const [selectedRelId, setSelectedRelId] = useState(null);

//   const selectedRelation = relations.find((r) => r.id === selectedRelId) || null;

//   // ====== CARGA INICIAL ======
//   async function loadRelations() {
//     if (!diagram?.id) return;
//     try {
//       const items = await listRelations(diagram.id);
//       setRelations(items || []);
//       if (selectedRelId && !items?.some((x) => x.id === selectedRelId)) {
//         setSelectedRelId(null);
//       }
//     } catch {
//       setRelations([]);
//     }
//   }

//   useEffect(() => {
//     if (diagram) loadRelations();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [diagram]);

//   // ====== CRUD ======
//   async function createRelation(body) {
//     try {
//       const r = await apiCreateRelation(diagram.id, body);
//       setRelations((prev) => [...prev, r]);
//       return r;
//     } catch (e) {
//       alert(e?.response?.data?.detail || "No se pudo crear la relación");
//       throw e;
//     }
//   }

//   async function updateRelation(relationId, patch) {
//     try {
//       const updated = await apiUpdateRelation(relationId, patch);
//       setRelations((prev) =>
//         prev.map((r) => (r.id === relationId ? updated : r))
//       );
//       return updated;
//     } catch (e) {
//       alert(e?.response?.data?.detail || "No se pudo actualizar la relación");
//       throw e;
//     }
//   }

//   async function deleteRelation(relationId) {
//     if (!confirm("¿Eliminar esta relación?")) return;
//     try {
//       await apiDeleteRelation(relationId);
//       setRelations((prev) => prev.filter((r) => r.id !== relationId));
//       if (selectedRelId === relationId) setSelectedRelId(null);
//     } catch (e) {
//       alert(e?.response?.data?.detail || "No se pudo eliminar la relación");
//     }
//   }

//   // ====== EVENTOS EN TIEMPO REAL ======
//   useEffect(() => {
//     if (!diagram?.id) return;

//     // crear
//     onEvent("relation.created", (rel) => {
//       setRelations((prev) => [...prev, rel]);
//     });

//     // actualizar
//     onEvent("relation.updated", (rel) => {
//       setRelations((prev) =>
//         prev.map((r) => (r.id === rel.id ? { ...r, ...rel } : r))
//       );
//     });

//     // eliminar
//     onEvent("relation.deleted", ({ id }) => {
//       setRelations((prev) => prev.filter((r) => r.id !== id));
//       if (selectedRelId === id) setSelectedRelId(null);
//     });
//   }, [diagram, selectedRelId]);

//   return {
//     relations,
//     selectedRelId,
//     setSelectedRelId,
//     selectedRelation,

//     loadRelations,
//     createRelation,
//     updateRelation,
//     deleteRelation,
//   };
// }
// src/hooks/useRelations.js
import { useEffect, useState } from "react";
import {
  listRelations,
  createRelation as apiCreateRelation,
  updateRelation as apiUpdateRelation,
  deleteRelation as apiDeleteRelation,
} from "../api/relations";
import { onEvent } from "../api/realtime";

export default function useRelations(diagram) {
  const [relations, setRelations] = useState([]);
  const [selectedRelId, setSelectedRelId] = useState(null);

  const selectedRelation = relations.find((r) => r.id === selectedRelId) || null;

  // ====== CARGA INICIAL ======
  async function loadRelations() {
    if (!diagram?.id) return;
    try {
      const items = await listRelations(diagram.id);
      setRelations(items || []);
      if (selectedRelId && !items?.some((x) => x.id === selectedRelId)) {
        setSelectedRelId(null);
      }
    } catch {
      setRelations([]);
    }
  }

  useEffect(() => {
    if (diagram) loadRelations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diagram]);

  // ====== CRUD (solo API, sin tocar state) ======
  async function createRelation(body) {
    return await apiCreateRelation(diagram.id, body);
  }

  async function updateRelation(relationId, patch) {
    return await apiUpdateRelation(relationId, patch);
  }

  async function deleteRelation(relationId) {
    if (!confirm("¿Eliminar esta relación?")) return;
    return await apiDeleteRelation(relationId);
  }

  // ====== EVENTOS EN TIEMPO REAL ======
  useEffect(() => {
    if (!diagram?.id) return;

    // crear
    onEvent("relation.created", (rel) => {
      if (rel.diagram_id === diagram.id) {
        setRelations((prev) => [...prev, rel]);
      }
    });

    // actualizar
    onEvent("relation.updated", (rel) => {
      if (rel.diagram_id === diagram.id) {
        setRelations((prev) =>
          prev.map((r) => (r.id === rel.id ? { ...r, ...rel } : r))
        );
      }
    });

    // eliminar
    onEvent("relation.deleted", ({ id }) => {
      setRelations((prev) => prev.filter((r) => r.id !== id));
      if (selectedRelId === id) setSelectedRelId(null);
    });
  }, [diagram, selectedRelId]);

  return {
    relations,
    selectedRelId,
    setSelectedRelId,
    selectedRelation,

    loadRelations,
    createRelation,
    updateRelation,
    deleteRelation,
  };
}
