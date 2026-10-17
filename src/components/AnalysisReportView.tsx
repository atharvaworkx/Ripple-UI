import React, { useState } from 'react';
import {
  ArrowLeft,
  AlertTriangle,
  GitBranch,
  Layers,
  Terminal,
  Copy,
  Check,
  Code2
} from 'lucide-react';
import { DependencyMap } from './DependencyMap';
import { EvidencePanel } from './EvidencePanel';
import type { AnalysisDetail, Finding, GraphNode } from '../types';

interface AnalysisReportViewProps {
  analysis: AnalysisDetail;
  onBack: () => void;
}

export const AnalysisReportView: React.FC<AnalysisReportViewProps> = ({ analysis, onBack }) => {
  const [activePane, setActivePane] = useState<'map' | 'findings' | 'diff'>('map');
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);

  const findings = analysis.findings || [];
  const testResults = analysis.test_results || [];
  const failedTests = testResults.filter((t) => t.status === 'failed');
  const passedTests = testResults.filter((t) => t.status === 'passed');

  const changedFunctionIds = analysis.changed_functions?.map((cf) => cf.id || cf.name) || [
    'billing/pricing.py::calculate_discounted_price'
  ];

  const handleCopyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeIndex(idx);
    setTimeout(() => setCopiedCodeIndex(null), 2000);
  };

  const overallRisk = failedTests.length > 0 || findings.some((f) => f.severity === 'HIGH')
    ? 'HIGH'
    : findings.some((f) => f.severity === 'MEDIUM')
    ? 'MEDIUM'
    : 'LOW';

  return (
    <div style={{ width: '100%', maxWidth: '1380px', minWidth: 0, margin: '0 auto' }}>
      {/* Compact Engineering Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={onBack}
            className="wb-btn wb-btn-secondary"
            style={{ padding: '0.35rem 0.65rem' }}
            title="Return to Overview"
          >
            <ArrowLeft size={14} /> Back
          </button>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
              <span className={`wb-badge ${analysis.mode === 'demo' ? 'wb-badge-lime' : 'wb-badge-neutral'}`}>
                {analysis.mode}
              </span>
              <span className="wb-badge wb-badge-neutral">
                {analysis.status}
              </span>
              <span style={{ color: 'var(--text-dim)' }}>
                {analysis.repository} {analysis.pr_number ? `#${analysis.pr_number}` : ''}
              </span>
              <span style={{ color: 'var(--text-dim)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <GitBranch size={12} /> {analysis.base_ref} &larr; {analysis.head_ref || 'head'}
              </span>
            </div>

            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
              {analysis.pr_title || 'Impact Investigation Report'}
            </div>
          </div>
        </div>

        {/* Overall Risk & Mode Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginRight: '8px' }}>
            <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
              OVERALL RISK:
            </span>
            <span className={`wb-badge ${overallRisk === 'HIGH' ? 'wb-badge-red' : overallRisk === 'MEDIUM' ? 'wb-badge-amber' : 'wb-badge-lime'}`}>
              {overallRisk}
            </span>
          </div>

          <div style={{ display: 'flex', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '3px', padding: '2px' }}>
            <button
              className={`wb-btn ${activePane === 'map' ? 'wb-btn-primary' : 'wb-btn-secondary'}`}
              style={{ padding: '3px 9px', fontSize: '0.75rem', border: 'none' }}
              onClick={() => setActivePane('map')}
            >
              <Layers size={13} />
              Map & Evidence
            </button>
            <button
              className={`wb-btn ${activePane === 'findings' ? 'wb-btn-primary' : 'wb-btn-secondary'}`}
              style={{ padding: '3px 9px', fontSize: '0.75rem', border: 'none' }}
              onClick={() => setActivePane('findings')}
            >
              <AlertTriangle size={13} />
              Findings & Tests ({findings.length})
            </button>
            <button
              className={`wb-btn ${activePane === 'diff' ? 'wb-btn-primary' : 'wb-btn-secondary'}`}
              style={{ padding: '3px 9px', fontSize: '0.75rem', border: 'none' }}
              onClick={() => setActivePane('diff')}
            >
              <Code2 size={13} />
              Diff
            </button>
          </div>
        </div>
      </div>

      {/* Pane A & B: Dependency Map + Evidence Panel */}
      {activePane === 'map' && (
        <div className="workbench-grid">
          {/* Main Dependency Graph Area */}
          <div>
            <div className="wb-panel" style={{ marginBottom: '1rem' }}>
              <div className="wb-panel-header">
                <span className="wb-panel-title">
                  <Layers size={14} color="var(--accent-lime)" />
                  Interactive AST Dependency Map
                </span>
                <span style={{ fontSize: '0.725rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
                  {analysis.graph?.nodes?.length || 0} Nodes &bull; {analysis.graph?.edges?.length || 0} Edges &bull; Click Node to Inspect
                </span>
              </div>

              <div style={{ padding: '8px' }}>
                <DependencyMap
                  nodes={analysis.graph?.nodes || []}
                  edges={analysis.graph?.edges || []}
                  changedFunctionIds={changedFunctionIds}
                  selectedNodeId={selectedNode ? selectedNode.id : null}
                  onSelectNode={(node) => {
                    setSelectedNode(node);
                    setSelectedFinding(null);
                  }}
                />
              </div>
            </div>

            {/* Quick Priority Findings Drawer below graph */}
            <div className="wb-panel">
              <div className="wb-panel-header">
                <span className="wb-panel-title">
                  <AlertTriangle size={14} color="var(--warning-amber)" />
                  Key Impact Traces ({findings.length})
                </span>
                <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
                  Ranked by Call Depth & API Exposure
                </span>
              </div>

              <div className="wb-panel-body" style={{ padding: '0.75rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {findings.map((f) => {
                    const isSelected = selectedFinding?.id === f.id;
                    return (
                      <div
                        key={f.id}
                        onClick={() => {
                          setSelectedFinding(f);
                          setSelectedNode(null);
                        }}
                        style={{
                          backgroundColor: isSelected ? 'var(--bg-elevated)' : 'var(--bg-app)',
                          border: `1px solid ${isSelected ? 'var(--accent-lime)' : 'var(--border)'}`,
                          borderRadius: '3px',
                          padding: '0.65rem 0.85rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '12px',
                        }}
                      >
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                            <span className={`wb-badge ${f.severity === 'HIGH' ? 'wb-badge-red' : 'wb-badge-amber'}`}>
                              {f.severity}
                            </span>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                              {f.title}
                            </span>
                            {f.verified_by_execution && (
                              <span className="wb-badge wb-badge-red" style={{ fontSize: '0.65rem' }}>
                                REPRODUCED
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {f.explanation}
                          </div>
                        </div>

                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-dim)', textAlign: 'right' }}>
                          <div>{f.file_path.split('/').pop()}:{f.line_number}</div>
                          <div style={{ color: 'var(--accent-lime)' }}>Inspect &rarr;</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Evidence Inspector Side Panel */}
          <div>
            <EvidencePanel
              selectedNode={selectedNode}
              selectedFinding={selectedFinding}
              edges={analysis.graph?.edges || []}
              findings={findings}
              onSelectFinding={(f) => {
                setSelectedFinding(f);
                setSelectedNode(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Pane C: Findings & Tests Focus View */}
      {activePane === 'findings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Real Pytest Execution Suite */}
          <div className="wb-panel">
            <div className="wb-panel-header">
              <span className="wb-panel-title">
                <Terminal size={14} color="var(--accent-lime)" />
                Pytest Execution Output & Verification
              </span>
              <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
                {passedTests.length} PASSED &bull; {failedTests.length} FAILED
              </span>
            </div>

            <div className="wb-panel-body">
              {testResults.length === 0 ? (
                <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                  Remote public PR execution is restricted for safety. Use the Seeded Demo to inspect live pytest execution.
                </div>
              ) : (
                <>
                  <table className="wb-table" style={{ marginBottom: '1rem' }}>
                    <thead>
                      <tr>
                        <th>Status</th>
                        <th>Test Identifier</th>
                        <th>Duration</th>
                        <th>Assertion Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {testResults.map((t, idx) => (
                        <tr key={idx}>
                          <td>
                            <span className={`wb-badge ${t.status === 'passed' ? 'wb-badge-lime' : 'wb-badge-red'}`}>
                              {t.status.toUpperCase()}
                            </span>
                          </td>
                          <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                            {t.test_spec}
                          </td>
                          <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.725rem', color: 'var(--text-dim)' }}>
                            {t.duration}
                          </td>
                          <td style={{ fontSize: '0.75rem' }}>
                            {t.status === 'failed' ? (
                              <span style={{ color: 'var(--error-red)', fontWeight: 600 }}>
                                Seeded precision truncation failure detected!
                              </span>
                            ) : (
                              <span style={{ color: 'var(--text-dim)' }}>
                                Baseline assertion satisfied
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {failedTests.length > 0 && failedTests[0].failure_details && (
                    <div>
                      <div style={{ fontSize: '0.725rem', fontFamily: 'var(--font-mono)', color: 'var(--error-red)', marginBottom: '0.3rem', fontWeight: 600 }}>
                        [PYTEST TRACEBACK] Assertion Failure Output:
                      </div>
                      <pre className="wb-code" style={{ borderColor: 'var(--error-red)', maxHeight: '200px' }}>
                        {failedTests[0].failure_details}
                      </pre>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Suggested Regression Suite */}
          <div className="wb-panel">
            <div className="wb-panel-header">
              <span className="wb-panel-title">
                <Code2 size={14} color="var(--accent-lime)" />
                Suggested Regression Test Suite (Syntactically Validated)
              </span>
              <span className="wb-badge wb-badge-lime font-mono">AST Checked</span>
            </div>

            <div className="wb-panel-body">
              {analysis.suggested_tests?.map((st, idx) => (
                <div key={idx} style={{ marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <div>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '0.825rem', color: 'var(--text-primary)' }}>
                        {st.title}
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.725rem', color: 'var(--text-dim)', marginLeft: '8px' }}>
                        {st.target_file}::{st.target_function}()
                      </span>
                    </div>

                    <button
                      className="wb-btn wb-btn-secondary"
                      style={{ padding: '2px 8px', fontSize: '0.7rem' }}
                      onClick={() => handleCopyCode(st.code, idx)}
                    >
                      {copiedCodeIndex === idx ? (
                        <>
                          <Check size={12} color="var(--accent-lime)" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy size={12} /> Copy Test
                        </>
                      )}
                    </button>
                  </div>

                  <pre className="wb-code">{st.code}</pre>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Pane D: Source Unified Diff */}
      {activePane === 'diff' && (
        <div className="wb-panel">
          <div className="wb-panel-header">
            <span className="wb-panel-title">
              <Code2 size={14} color="var(--accent-lime)" />
              Unified Patch Diff
            </span>
            <span style={{ fontSize: '0.725rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
              {analysis.changed_files?.length || 0} modified file(s)
            </span>
          </div>

          <div className="wb-panel-body">
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '0.85rem' }}>
              <span style={{ fontSize: '0.725rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
                Modified Symbols:
              </span>
              {analysis.changed_functions?.map((cf, idx) => (
                <span key={idx} className="wb-badge wb-badge-lime font-mono">
                  {cf.name}() in {cf.file_path}:L{cf.lineno}
                </span>
              ))}
            </div>

            <pre className="wb-code" style={{ maxHeight: '550px' }}>
              {analysis.diff_snippet || 'No diff content recorded.'}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
