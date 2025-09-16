//src/api/classes.js
import api from "./client";

// CLASES
export const listClasses = (diagramId) =>
  api.get(`/diagrams/${diagramId}/classes`).then(r => r.data);

export const createClass = (diagramId, { name }) =>
  api.post(`/diagrams/${diagramId}/classes`, { name }).then(r => r.data);

export const updateClass = (classId, patch) =>
  api.patch(`/diagrams/classes/${classId}`, patch).then(r => r.data);

export const deleteClass = (classId) =>
  api.delete(`/diagrams/classes/${classId}`);

// ATRIBUTOS
export const listAttributes = (classId) =>
  api.get(`/diagrams/classes/${classId}/attributes`).then(r => r.data);

export const createAttribute = (classId, { name, type, required=false }) =>
  api.post(`/diagrams/classes/${classId}/attributes`, { name, type, required }).then(r => r.data);

export const updateAttribute = (attrId, patch) =>
  api.patch(`/diagrams/attributes/${attrId}`, patch).then(r => r.data);

export const deleteAttribute = (attrId) =>
  api.delete(`/diagrams/attributes/${attrId}`);

// MÉTODOS
export const listMethods = (classId) =>
  api.get(`/diagrams/classes/${classId}/methods`).then(r => r.data);

export const createMethod = (classId, { name, return_type="void" }) =>
  api.post(`/diagrams/classes/${classId}/methods`, { name, return_type }).then(r => r.data);

export const updateMethod = (methodId, patch) =>
  api.patch(`/diagrams/methods/${methodId}`, patch).then(r => r.data);

export const deleteMethod = (methodId) =>
  api.delete(`/diagrams/methods/${methodId}`);
