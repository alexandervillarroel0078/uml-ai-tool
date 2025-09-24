
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
    // onEvent("relation.deleted", ({ id }) => {
    //   setRelations((prev) => prev.filter((r) => r.id !== id));
    //   if (selectedRelId === id) setSelectedRelId(null);
    // });
    onEvent("relation.deleted", ({ id, diagram_id }) => {
      if (diagram_id === diagram.id) {
        setRelations((prev) => prev.filter((r) => r.id !== id));
        if (selectedRelId === id) setSelectedRelId(null);
      }
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
