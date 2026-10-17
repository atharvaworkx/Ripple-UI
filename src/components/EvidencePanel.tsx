import React from 'react';
import { Shield, Layers } from 'lucide-react';
import type { GraphNode, GraphEdge, Finding } from '../types';

interface EvidencePanelProps {
  selectedNode: GraphNode | null;
  selectedFinding: Finding | null;
  edges: GraphEdge[];
  findings: Finding[];
  onSelectFinding: (finding: Finding) => void;
}

export const EvidencePanel: React.FC<EvidencePanelProps> = ({
  selectedNode,
  selectedFinding,
  edges,
  findings,
  onSelectFinding,
}) => {
  // If finding is selected
  if (selectedFinding) {
    return (
      <div className="wb-panel" style={{ position: 'sticky', top: '1rem' }}>
        <div className="wb-panel-header">
          <span className="wb-panel-title">
            <Shield size={14} color="var(--accent-lime)" />
            Evidence Inspector
          </span>
          <span className="wb-badge wb-badge-lime font-mono">{selectedFinding.id}</span>
        </div>

        <div className="wb-panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div>
            <div style={{ fontSize: '0.675rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
              Impacted Component
            </div>
            <div style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)' }}>
              {selectedFinding.affected_component}
            </div>
            <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
              {selectedFinding.file_path}:{selectedFinding.line_number}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.675rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
              Analysis Reasoning
            </div>
            <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', lineHeight: 1.45, backgroundColor: 'var(--bg-app)', padding: '0.5rem 0.65rem', borderRadius: '3px', border: '1px solid var(--border)' }}>
              {selectedFinding.explanation}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.675rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
              AST Call Traversal Chain
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontFamily: 'var(--font-mono)', fontSize: '0.725rem' }}>
              {selectedFinding.dependency_path?.map((step, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: 'var(--text-dim)', width: '12px' }}>{idx + 1}.</span>
                  <span style={{ color: idx === 0 ? 'var(--accent-lime)' : 'var(--text-primary)', backgroundColor: 'var(--bg-app)', padding: '2px 5px', borderRadius: '2px', border: '1px solid var(--border-subtle)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.675rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
              Verification Action
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--accent-lime)', backgroundColor: 'var(--accent-lime-dim)', padding: '0.45rem 0.65rem', borderRadius: '3px', border: '1px solid var(--accent-lime-border)' }}>
              {selectedFinding.recommended_validation}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '0.65rem', fontSize: '0.7rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
            <span>Method: AST Static Call</span>
            <span style={{ color: selectedFinding.verified_by_execution ? 'var(--error-red)' : 'var(--text-secondary)' }}>
              {selectedFinding.verified_by_execution ? 'Verified by Pytest' : 'Static Trace'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // If node is selected
  if (selectedNode) {
    const incoming = edges.filter((e) => e.target === selectedNode.id);
    const outgoing = edges.filter((e) => e.source === selectedNode.id);
    const relatedFindings = findings.filter((f) => f.affected_component.includes(selectedNode.name));

    return (
      <div className="wb-panel" style={{ position: 'sticky', top: '1rem' }}>
        <div className="wb-panel-header">
          <span className="wb-panel-title">
            <Layers size={14} color="var(--accent-lime)" />
            Node Evidence
          </span>
          <span className="wb-badge wb-badge-neutral font-mono">{selectedNode.type}</span>
        </div>

        <div className="wb-panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div>
            <div style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-primary)' }}>
              {selectedNode.name}()
            </div>
            <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
              {selectedNode.file_path}:L{selectedNode.lineno}-{selectedNode.end_lineno}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.675rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
              Direct Callers ({incoming.length})
            </div>
            {incoming.length === 0 ? (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>
                No incoming callers detected (Entrypoint or isolated)
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {incoming.map((e, idx) => (
                  <div key={idx} style={{ fontSize: '0.725rem', fontFamily: 'var(--font-mono)', color: 'var(--warning-amber)', backgroundColor: 'var(--bg-app)', padding: '2px 6px', border: '1px solid var(--border-subtle)' }}>
                    &larr; {e.source.split('::').pop()}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <div style={{ fontSize: '0.675rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
              Outgoing Invocations ({outgoing.length})
            </div>
            {outgoing.length === 0 ? (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>
                Leaf node (no further calls)
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {outgoing.map((e, idx) => (
                  <div key={idx} style={{ fontSize: '0.725rem', fontFamily: 'var(--font-mono)', color: 'var(--info-cyan)', backgroundColor: 'var(--bg-app)', padding: '2px 6px', border: '1px solid var(--border-subtle)' }}>
                    &rarr; {e.target.split('::').pop()}
                  </div>
                ))}
              </div>
            )}
          </div>

          {relatedFindings.length > 0 && (
            <div>
              <div style={{ fontSize: '0.675rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                Associated Findings ({relatedFindings.length})
              </div>
              {relatedFindings.map((f) => (
                <div
                  key={f.id}
                  onClick={() => onSelectFinding(f)}
                  style={{
                    padding: '0.4rem 0.6rem',
                    backgroundColor: 'var(--bg-app)',
                    border: '1px solid var(--border)',
                    borderRadius: '2px',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    marginBottom: '4px',
                  }}
                >
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{f.title}</div>
                  <div style={{ fontSize: '0.675rem', color: 'var(--text-dim)' }}>Click to inspect reasoning &rarr;</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Default empty state / general inspector
  return (
    <div className="wb-panel" style={{ position: 'sticky', top: '1rem' }}>
      <div className="wb-panel-header">
        <span className="wb-panel-title">
          <Shield size={14} color="var(--accent-lime)" />
          Evidence Inspector
        </span>
        <span className="wb-badge wb-badge-neutral font-mono">STANDBY</span>
      </div>
      <div className="wb-panel-body" style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-dim)', fontSize: '0.775rem' }}>
        <p style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Select any node in the Dependency Map or a Finding card to inspect source evidence.</p>
        <span className="font-mono" style={{ fontSize: '0.7rem' }}>All connections backed by Python AST parser</span>
      </div>
    </div>
  );
};
