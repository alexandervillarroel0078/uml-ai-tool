// src/api/export.js
export async function exportDiagram(diagramId) {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/diagrams/${diagramId}/export-download`,
    {
      method: "POST",
    }
  );

  if (!response.ok) {
    throw new Error("Error al exportar el diagrama");
  }

  // Convertir la respuesta a Blob
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);

  // Crear enlace invisible y disparar la descarga
  const link = document.createElement("a");
  link.href = url;
  link.download = `generated_project_${diagramId}.zip`;
  document.body.appendChild(link);
  link.click();
  link.remove();

  // Liberar memoria
  window.URL.revokeObjectURL(url);
}
