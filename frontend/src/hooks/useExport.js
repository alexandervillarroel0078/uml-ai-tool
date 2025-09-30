import { useState } from "react";

export default function useExportDiagram() {
  const [loading, setLoading] = useState(false);

  async function exportDiagram(diagramId) {
    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/diagrams/${diagramId}/export-download`,
        { method: "POST" }
      );

      if (!res.ok) {
        throw new Error("Error al exportar");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `generated_project_${diagramId}.zip`;
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return { exportDiagram, loading };
}
