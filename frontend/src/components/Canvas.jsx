 
import React, { useMemo } from "react";
import ReactFlow, { Background, Controls, MiniMap, useNodesState } from "reactflow";
import "reactflow/dist/style.css";

/**
 * Recibe classes = [{ id, nombre, atributos: [...] }]
 * Dibuja tarjetas simples. Permite mover nodos (se bloquea si relMode = true).
 */
export default function Canvas({ classes = [], relMode = false, onPickOrigin, onPickDest }) {
  const initialNodes = useMemo(() => {
    const margin = 40;
    return (classes || []).map((c, idx) => ({
      id: String(c.id),
      position: { x: margin + (idx % 3) * 300, y: margin + Math.floor(idx / 3) * 220 },
      data: {
        label: (
          <div style={{ minWidth: 240, padding: 10 }}>
            <div style={{ fontWeight: 800, marginBottom: 6, color: "var(--text)" }}>{c.nombre}</div>
            <div style={{ fontSize: 12, opacity: .9, color: "var(--text)" }}>
              {(c.atributos ?? []).map((a, i) => (
                <div key={i}>• {a.nombre}:{a.tipo}{a.requerido ? " *" : ""}</div>
              ))}
            </div>
          </div>
        )
      },
      style: {
        border: "1px solid var(--border)",
        borderRadius: 10,
        background: "var(--bg)",
        boxShadow: "0 1px 0 rgba(0,0,0,.2)"
      }
    }));
  }, [classes]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);

  // por ahora no hay edges (los agregaremos al integrar relaciones)
  const edges = [];

  // selección para modo relaciones (placeholder: click simple)
  function onNodeClick(_, node) {
    if (!relMode) return; // solo en modo crear relación
    // Flujo base: primer clic origen, segundo clic destino (lo manejarás en Home)
    if (onPickOrigin) onPickOrigin(Number(node.id));
    // Si quieres alternar o fijar destino en segundo clic, maneja un pequeño estado local en Home
  }

  return (
    <div style={{ width: "100%", height: "100%", background: "var(--canvas-bg)" }}>
      <ReactFlow
        nodes={nodes}
        onNodesChange={onNodesChange}
        edges={edges}
        onNodeClick={onNodeClick}
        fitView
        nodesDraggable={!relMode}
        nodesConnectable={false}
        elementsSelectable
        snapToGrid
        snapGrid={[16, 16]}
      >
        <Background variant="dots" color="var(--canvas-grid)" gap={16} size={1} />
        <MiniMap />
        <Controls />
      </ReactFlow>
    </div>
  );
}
