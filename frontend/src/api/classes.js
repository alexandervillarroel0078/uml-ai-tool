//src/api/classes.js
import api from "./client";

// ===== Helper para mapear nombre → name =====
const mapClass = (c) => ({
  id: c.id,
  name: c.nombre, // alias backend → frontend
  x_grid: c.x_grid,
  y_grid: c.y_grid,
  w_grid: c.w_grid,
  h_grid: c.h_grid,
  z_index: c.z_index,
});

// // ========== CLASES ==========
// export const listClasses = (diagramId) =>
//   api.get(`/diagrams/${diagramId}/classes`)
//     .then(r => (r.data || []).map(mapClass));

// /**
//  * Crea una clase. Puedes pasar solo { name } o también layout.
//  * extra (opcionales): x_grid, y_grid, w_grid, h_grid, z_index
//  */
// export const createClass = (
//   diagramId,
//   { name, x_grid, y_grid, w_grid, h_grid, z_index } = {}
// ) =>
//   api.post(`/diagrams/${diagramId}/classes`, {
//     name, x_grid, y_grid, w_grid, h_grid, z_index,
//   }).then(r => mapClass(r.data));

// /** Patch genérico: { name?, x_grid?, y_grid?, w_grid?, h_grid?, z_index? } */
// export const updateClass = (classId, patch) =>
//   api.patch(`/diagrams/classes/${classId}`, patch).then(r => mapClass(r.data));


// listClasses
export const listClasses = (diagramId) =>
  api.get(`/diagrams/${diagramId}/classes`)
    .then(r => (r.data || []).map(mapClass));

// createClass
// export const createClass = (diagramId, body) =>
//   api.post(`/diagrams/${diagramId}/classes`, body).then(r => mapClass(r.data));

// // updateClass
// export const updateClass = (classId, patch) =>
//   api.patch(`/diagrams/classes/${classId}`, patch).then(r => mapClass(r.data));



export const createClass = (
  diagramId,
  { name, x_grid, y_grid, w_grid, h_grid, z_index } = {}
) =>
  api.post(`/diagrams/${diagramId}/classes`, {
    name, x_grid, y_grid, w_grid, h_grid, z_index,
  }).then(r => mapClass(r.data));

export const updateClass = (classId, patch) =>
  api.patch(`/diagrams/classes/${classId}`, patch).then(r => mapClass(r.data));

export const deleteClass = (classId) =>
  api.delete(`/diagrams/classes/${classId}`);





// Helpers cómodos
export const updateClassPosition = (classId, { x_grid, y_grid }) =>
  updateClass(classId, { x_grid, y_grid });

export const updateClassSize = (classId, { w_grid, h_grid }) =>
  updateClass(classId, { w_grid, h_grid });

export const updateClassZ = (classId, z_index) =>
  updateClass(classId, { z_index });


// ATRIBUTOS
export const listAttributes = (classId) =>
  api.get(`/diagrams/classes/${classId}/attributes`).then(r => r.data);

export const createAttribute = (classId, { name, type, required = false }) =>
  api.post(`/diagrams/classes/${classId}/attributes`, { name, type, required }).then(r => r.data);

export const updateAttribute = (attrId, patch) =>
  api.patch(`/diagrams/attributes/${attrId}`, patch).then(r => r.data);

export const deleteAttribute = (attrId) =>
  api.delete(`/diagrams/attributes/${attrId}`);

// MÉTODOS
export const listMethods = (classId) =>
  api.get(`/diagrams/classes/${classId}/methods`).then(r => r.data);

export const createMethod = (classId, { name, return_type = "void" }) =>
  api.post(`/diagrams/classes/${classId}/methods`, { name, return_type }).then(r => r.data);

export const updateMethod = (methodId, patch) =>
  api.patch(`/diagrams/methods/${methodId}`, patch).then(r => r.data);

export const deleteMethod = (methodId) =>
  api.delete(`/diagrams/methods/${methodId}`);
