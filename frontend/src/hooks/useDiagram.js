// src/hooks/useDiagram.js
//(carga del diagrama, sin cambios en lógica)
import { useEffect, useState } from "react";
import api from "../api/client";

export default function useDiagram(diagramId) {
  const [diagram, setDiagram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const { data } = await api.get(`/diagrams/${diagramId}`);
        if (!alive) return;
        setDiagram(data);
      } catch (e) {
        if (!alive) return;
        setErr(e?.response?.data?.detail || "No se pudo cargar el diagrama");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [diagramId]);

  return { diagram, loading, err };
}
