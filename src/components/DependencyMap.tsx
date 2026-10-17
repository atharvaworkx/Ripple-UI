import React, { useState, useRef, useMemo } from 'react';
import { ZoomIn, ZoomOut, Maximize2, RotateCcw } from 'lucide-react';
import type { GraphNode, GraphEdge } from '../types';

interface DependencyMapProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  changedFunctionIds: string[];
  selectedNodeId: string | null;
  onSelectNode: (node: GraphNode | null) => void;
}

interface NodePosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const DependencyMap: React.FC<DependencyMapProps> = ({
  nodes,
  edges,
  changedFunctionIds,
  selectedNodeId,
  onSelectNode,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 30, y: 30 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Compute layered layout coordinates deterministically
  const nodeLayout = useMemo(() => {
    const layout = new Map<string, NodePosition>();
    if (!nodes || nodes.length === 0) return layout;

    // Group into columns: 0 = Changed, 1 = Direct Callers, 2 = Indirect Callers / Endpoints, 3 = Tests / Other
    const col0: GraphNode[] = [];
    const col1: GraphNode[] = [];
    const col2: GraphNode[] = [];
    const col3: GraphNode[] = [];

    // Set of changed ids
    const changedSet = new Set(changedFunctionIds);

    // Callers of changed nodes
    const directCallerIds = new Set<string>();
    edges.forEach((e) => {
      if (changedSet.has(e.target)) {
        directCallerIds.add(e.source);
      }
    });

    nodes.forEach((n) => {
      if (changedSet.has(n.id)) {
        col0.push(n);
      } else if (directCallerIds.has(n.id)) {
        col1.push(n);
      } else if (n.is_endpoint) {
        col2.push(n);
      } else {
        col3.push(n);
      }
    });

    const nodeWidth = 220;
    const nodeHeight = 72;
    const colGap = 160;
    const rowGap = 24;

    const placeCol = (colNodes: GraphNode[], colIndex: number) => {
      colNodes.forEach((n, rowIndex) => {
        layout.set(n.id, {
          x: colIndex * (nodeWidth + colGap) + 50,
          y: rowIndex * (nodeHeight + rowGap) + 50,
          width: nodeWidth,
          height: nodeHeight,
        });
      });
    };

    placeCol(col0, 0);
    placeCol(col1, 1);
    placeCol(col2, 2);
    placeCol(col3, 3);

    return layout;
  }, [nodes, edges, changedFunctionIds]);

  // Pan interaction
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleZoom = (delta: number) => {
    setZoom((prev) => Math.min(Math.max(prev + delta, 0.4), 2.0));
  };

  const handleFit = () => {
    setZoom(0.85);
    setPan({ x: 40, y: 30 });
  };

  // Connected edges highlighting
  const activeEdgeKeys = useMemo(() => {
    if (!selectedNodeId) return new Set<string>();
    const active = new Set<string>();
    edges.forEach((e) => {
      if (e.source === selectedNodeId || e.target === selectedNodeId) {
        active.add(`${e.source}->${e.target}`);
      }
    });
    return active;
  }, [selectedNodeId, edges]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '460px',
        backgroundColor: '#070A09',
        border: '1px solid var(--border)',
        borderRadius: '3px',
        overflow: 'hidden',
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Background technical grid lines */}
      <svg
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      >
        <defs>
          <pattern id="wb-grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#161F1A" strokeWidth="0.8" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#wb-grid)" />
      </svg>

      {/* Main Canvas Container */}
      <div
        style={{
          position: 'absolute',
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
          transition: isDragging ? 'none' : 'transform 0.08s ease-out',
        }}
      >
        <svg
          style={{
            position: 'absolute',
            overflow: 'visible',
            pointerEvents: 'none',
          }}
        >
          <defs>
            <marker
              id="arrow-neutral"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#303832" />
            </marker>
            <marker
              id="arrow-active"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#C5F36B" />
            </marker>
          </defs>

          {/* Render connecting edges */}
          {edges.map((edge) => {
            const srcPos = nodeLayout.get(edge.source);
            const tgtPos = nodeLayout.get(edge.target);
            if (!srcPos || !tgtPos) return null;

            const x1 = srcPos.x + srcPos.width;
            const y1 = srcPos.y + srcPos.height / 2;
            const x2 = tgtPos.x;
            const y2 = tgtPos.y + tgtPos.height / 2;

            const isEdgeActive = activeEdgeKeys.has(`${edge.source}->${edge.target}`);
            const dx = Math.abs(x2 - x1) * 0.5;
            const pathD = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;

            return (
              <path
                key={`${edge.source}->${edge.target}`}
                d={pathD}
                fill="none"
                stroke={isEdgeActive ? 'var(--accent-lime)' : '#303832'}
                strokeWidth={isEdgeActive ? 2 : 1.2}
                strokeDasharray={isEdgeActive ? 'none' : '3 3'}
                markerEnd={isEdgeActive ? 'url(#arrow-active)' : 'url(#arrow-neutral)'}
              />
            );
          })}
        </svg>

        {/* Render Graph Nodes */}
        {nodes.map((node) => {
          const pos = nodeLayout.get(node.id);
          if (!pos) return null;

          const isChanged = changedFunctionIds.includes(node.id) || changedFunctionIds.some((cid) => cid.includes(node.name));
          const isSelected = selectedNodeId === node.id;

          let borderColor = 'var(--border)';
          let tagColor = 'var(--text-dim)';
          let tagBg = 'var(--bg-elevated)';

          if (isChanged) {
            borderColor = 'var(--accent-lime)';
            tagColor = 'var(--accent-lime)';
            tagBg = 'var(--accent-lime-dim)';
          } else if (node.is_endpoint) {
            borderColor = 'var(--info-cyan)';
            tagColor = 'var(--info-cyan)';
            tagBg = 'var(--info-cyan-dim)';
          } else if (isSelected) {
            borderColor = 'var(--text-primary)';
          }

          return (
            <div
              key={node.id}
              onClick={(e) => {
                e.stopPropagation();
                onSelectNode(isSelected ? null : node);
              }}
              style={{
                position: 'absolute',
                left: `${pos.x}px`,
                top: `${pos.y}px`,
                width: `${pos.width}px`,
                height: `${pos.height}px`,
                backgroundColor: 'var(--bg-surface)',
                border: `1px solid ${borderColor}`,
                borderRadius: '3px',
                padding: '0.45rem 0.65rem',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: isSelected ? '0 0 12px rgba(197, 243, 107, 0.25)' : 'none',
                transition: 'border-color 0.12s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.625rem',
                    fontWeight: 600,
                    padding: '1px 4px',
                    borderRadius: '2px',
                    backgroundColor: tagBg,
                    color: tagColor,
                    textTransform: 'uppercase',
                  }}
                >
                  {isChanged ? 'MODIFIED' : node.is_endpoint ? 'HTTP ROUTE' : node.type.toUpperCase()}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)' }}>
                  L{node.lineno}
                </span>
              </div>

              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.775rem',
                  fontWeight: 600,
                  color: isChanged ? 'var(--accent-lime)' : 'var(--text-primary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
                title={node.name}
              >
                {node.name}()
              </div>

              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.65rem',
                  color: 'var(--text-dim)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
                title={node.file_path}
              >
                {node.file_path.split('/').pop()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Graph Toolbar Controls */}
      <div
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          display: 'flex',
          gap: '4px',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: '3px',
          padding: '2px',
        }}
      >
        <button
          onClick={() => handleZoom(0.15)}
          className="wb-btn-secondary"
          style={{ padding: '4px 6px', fontSize: '0.7rem' }}
          title="Zoom In"
        >
          <ZoomIn size={13} />
        </button>
        <button
          onClick={() => handleZoom(-0.15)}
          className="wb-btn-secondary"
          style={{ padding: '4px 6px', fontSize: '0.7rem' }}
          title="Zoom Out"
        >
          <ZoomOut size={13} />
        </button>
        <button
          onClick={handleFit}
          className="wb-btn-secondary"
          style={{ padding: '4px 6px', fontSize: '0.7rem' }}
          title="Fit View"
        >
          <Maximize2 size={13} />
        </button>
        <button
          onClick={() => {
            setZoom(1);
            setPan({ x: 30, y: 30 });
          }}
          className="wb-btn-secondary"
          style={{ padding: '4px 6px', fontSize: '0.7rem' }}
          title="Reset"
        >
          <RotateCcw size={13} />
        </button>
      </div>

      {/* Graph Legend */}
      <div
        style={{
          position: 'absolute',
          bottom: '10px',
          left: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          backgroundColor: 'rgba(20, 26, 22, 0.9)',
          border: '1px solid var(--border)',
          borderRadius: '3px',
          padding: '4px 8px',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.675rem',
          color: 'var(--text-dim)',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '8px', height: '8px', backgroundColor: 'var(--accent-lime)', borderRadius: '1px' }} />
          Changed Source
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '8px', height: '8px', backgroundColor: 'var(--info-cyan)', borderRadius: '1px' }} />
          HTTP Endpoint
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '8px', height: '8px', backgroundColor: 'var(--border-focus)', borderRadius: '1px' }} />
          Internal Caller
        </span>
      </div>
    </div>
  );
};
