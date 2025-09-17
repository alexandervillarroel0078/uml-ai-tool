// src/api/relations.js
import api from "./client";

/** Lista todas las relaciones de un diagrama */
export const listRelations = (diagramId) =>
  api.get(`/diagrams/${diagramId}/relations`).then(r => r.data);

/** Crea una relación en el diagrama */
export const createRelation = (
  diagramId,
  {
    from_class,
    to_class,
    type,              // "ASSOCIATION" | "AGGREGATION" | "COMPOSITION" | "INHERITANCE" | "DEPENDENCY"
    label,             // opcional
    src_anchor,        // "left" | "right" | "top" | "bottom" (opc)
    dst_anchor,        // idem (opc)
    src_offset,        // int >= 0 (opc)
    dst_offset,        // int >= 0 (opc)
    src_lane,          // int >= 0 (opc)
    dst_lane,          // int >= 0 (opc)
  }
) =>
  api.post(`/diagrams/${diagramId}/relations`, {
    from_class, to_class, type, label,
    src_anchor, dst_anchor, src_offset, dst_offset, src_lane, dst_lane,
  }).then(r => r.data);

/** Actualiza datos de la relación (tipo, etiqueta, anchors, offsets, lanes…) */
export const updateRelation = (relationId, patch) =>
  api.patch(`/diagrams/relations/${relationId}`, patch).then(r => r.data);

/** Elimina una relación */
export const deleteRelation = (relationId) =>
  api.delete(`/diagrams/relations/${relationId}`);
