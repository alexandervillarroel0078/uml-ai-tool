// // src/api/relations.js
// import api from "./client";

// // util: limpia campos undefined del payload
// const omitUndefined = (obj) =>
//   Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));

// /** Lista todas las relaciones de un diagrama */
// export const listRelations = (diagramId) =>
//   api.get(`/diagrams/${diagramId}/relations`).then((r) => r.data);

// /** Crea una relación en el diagrama */
// export const createRelation = (
//   diagramId,
//   {
//     from_class,
//     to_class,
//     type,       // "ASSOCIATION" | "AGGREGATION" | "COMPOSITION" | "INHERITANCE" | "DEPENDENCY"
//     label,      // opcional
//     src_anchor, // "left" | "right" | "top" | "bottom"
//     dst_anchor,
//     src_offset, // >= 0
//     dst_offset, // >= 0
//     src_lane,   // >= 0
//     dst_lane,   // >= 0
//   }
// ) =>
//   api
//     .post(
//       `/diagrams/${diagramId}/relations`,
//       omitUndefined({
//         from_class,
//         to_class,
//         type,
//         label,
//         src_anchor,
//         dst_anchor,
//         src_offset,
//         dst_offset,
//         src_lane,
//         dst_lane,
//       })
//     )
//     .then((r) => r.data);

// /** Actualiza datos de la relación */
// export const updateRelation = (relationId, patch) =>
//   api
//     .patch(`/diagrams/relations/${relationId}`, omitUndefined(patch))
//     .then((r) => r.data);

// /** Elimina una relación */
// export const deleteRelation = (relationId) =>
//   api.delete(`/diagrams/relations/${relationId}`).then(() => true);
// src/api/relations.js
import api from "./client";

// util: limpia campos undefined del payload
const omitUndefined = (obj) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));

/** Lista todas las relaciones de un diagrama */
export const listRelations = (diagramId) =>
  api.get(`/diagrams/${diagramId}/relations`).then((r) => r.data);

/**
 * Crea una relación en el diagrama
 *
 * @param {string} diagramId
 * @param {{
 *   from_class: string,
 *   to_class: string,
 *   type: "ASSOCIATION"|"AGGREGATION"|"COMPOSITION"|"INHERITANCE"|"DEPENDENCY",
 *   label?: string,
 *   src_anchor?: "left"|"right"|"top"|"bottom",
 *   dst_anchor?: "left"|"right"|"top"|"bottom",
 *   src_offset?: number, dst_offset?: number,
 *   src_lane?: number,   dst_lane?: number,
 *   // multiplicidad (min entero >=0; max entero >=0 | "*" | null)
 *   src_mult_min?: number,
 *   src_mult_max?: number|"*"|null,
 *   dst_mult_min?: number,
 *   dst_mult_max?: number|"*"|null,
 * }} params
 */
export const createRelation = (
  diagramId,
  {
    from_class,
    to_class,
    type,
    label,
    src_anchor,
    dst_anchor,
    src_offset,
    dst_offset,
    src_lane,
    dst_lane,
    src_mult_min,
    src_mult_max, // acepta número, "*" o null
    dst_mult_min,
    dst_mult_max, // acepta número, "*" o null
  }
) =>
  api
    .post(
      `/diagrams/${diagramId}/relations`,
      omitUndefined({
        from_class,
        to_class,
        type,
        label,
        src_anchor,
        dst_anchor,
        src_offset,
        dst_offset,
        src_lane,
        dst_lane,
        src_mult_min,
        src_mult_max,
        dst_mult_min,
        dst_mult_max,
      })
    )
    .then((r) => r.data);

/**
 * Actualiza datos de la relación
 *
 * Campos válidos en `patch` (todos opcionales):
 * - type, label
 * - src_anchor, dst_anchor
 * - src_offset, dst_offset, src_lane, dst_lane
 * - src_mult_min, src_mult_max (número | "*" | null)
 * - dst_mult_min, dst_mult_max (número | "*" | null)
 */
export const updateRelation = (relationId, patch = {}) =>
  api
    .patch(`/diagrams/relations/${relationId}`, omitUndefined(patch))
    .then((r) => r.data);

/** Elimina una relación */
export const deleteRelation = (relationId) =>
  api.delete(`/diagrams/relations/${relationId}`).then(() => true);
