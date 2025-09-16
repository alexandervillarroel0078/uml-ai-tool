// frontend/src/api/diagrams.js
import  api  from "./client";

export async function createDiagram(title) {
  const { data } = await api.post("/diagrams", { title });
  return data; // DiagramOut
}

export async function listDiagrams({ page = 1, limit = 20 } = {}) {
  const { data } = await api.get("/diagrams", { params: { page, limit } });
  return data; // { items, page, limit, total }
}

export async function getDiagram(id) {
  const { data } = await api.get(`/diagrams/${id}`);
  return data;
}

export async function deleteDiagram(id) {
  await api.delete(`/diagrams/${id}`);
}
// src/pages/Login.jsx
// src/pages/Home.jsx
// src/App.jsx
// src/main.jsx