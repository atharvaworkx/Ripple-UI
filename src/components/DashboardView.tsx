import React, { useState } from 'react';
import { Terminal, GitPullRequest, Play, Cpu } from 'lucide-react';
import type { MetricSummary, AnalysisSummary } from '../types';

interface DashboardViewProps {
  metrics: MetricSummary;
  recentAnalyses: AnalysisSummary[];
  onOpenNewAnalysis: () => void;
  onRunDemo: () => void;
  onSubmitPR: (prUrl: string, token: string) => Promise<void>;
  onSelectAnalysis: (id: string) => void;
  isLoadingDemo: boolean;
  isLoadingPR: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  metrics,
  recentAnalyses,
  onOpenNewAnalysis,
  onRunDemo,
  onSubmitPR,
  onSelectAnalysis,
  isLoadingDemo,
  isLoadingPR,
}) => {
  const [inlineUrl, setInlineUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Curated public Python PR examples for zero-friction testing
  const samplePRs = [
    { label: 'requests #6677', url: 'https://github.com/psf/requests/pull/6677', desc: 'Fix chunked upload logic' },
    { label: 'httpx #3147', url: 'https://github.com/encode/httpx/pull/3147', desc: 'Update stream response handlers' },
    { label: 'flask #5300', url: 'https://github.com/pallets/flask/pull/5300', desc: 'Refactor URL route matching' },
  ];

  const handleInlineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!inlineUrl.trim()) {
      setErrorMsg('Enter a GitHub pull request URL (e.g. https://github.com/psf/requests/pull/6677)');
      return;
    }
    try {
      await onSubmitPR(inlineUrl.trim(), '');
    } catch (err: any) {
      setErrorMsg(err.message || 'Analysis failed');
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Workspace Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.85rem' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            WORKSPACE / OVERVIEW
          </div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
            Code Impact Analysis & Regression Workbench
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="wb-btn wb-btn-secondary" onClick={onRunDemo} disabled={isLoadingDemo}>
            <Play size={12} fill="var(--accent-lime)" color="var(--accent-lime)" />
            {isLoadingDemo ? 'Analyzing...' : 'Run Seeded Demo'}
          </button>
          <button className="wb-btn wb-btn-primary" onClick={onOpenNewAnalysis}>
            <GitPullRequest size={13} />
            Analyze a PR
          </button>
        </div>
      </div>

      {/* Investigation Entry Console */}
      <div className="wb-panel" style={{ borderLeft: '3px solid var(--accent-lime)' }}>
        <div className="wb-panel-header">
          <span className="wb-panel-title">
            <Terminal size={14} color="var(--accent-lime)" />
            Investigate Pull Request
          </span>
          <span className="wb-badge wb-badge-lime font-mono">AST Engine Ready</span>
        </div>

        <div className="wb-panel-body">
          <form onSubmit={handleInlineSubmit} style={{ display: 'flex', gap: '8px', marginBottom: '0.85rem' }}>
            <input
              type="text"
              className="wb-input"
              placeholder="Paste public GitHub Pull Request URL: https://github.com/owner/repo/pull/123"
              value={inlineUrl}
              onChange={(e) => setInlineUrl(e.target.value)}
              disabled={isLoadingPR}
            />
            <button
              type="submit"
              className="wb-btn wb-btn-primary"
              disabled={isLoadingPR}
              style={{ whiteSpace: 'nowrap' }}
            >
              <GitPullRequest size={14} />
              {isLoadingPR ? 'Analyzing Diff...' : 'Analyze PR'}
            </button>
          </form>

          {errorMsg && (
            <div style={{ fontSize: '0.75rem', color: 'var(--error-red)', fontFamily: 'var(--font-mono)', marginBottom: '0.65rem' }}>
              [ERROR] {errorMsg}
            </div>
          )}

          {/* Quick 1-click testable PR examples */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', fontSize: '0.75rem' }}>
            <span style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>Quick Test Examples:</span>
            {samplePRs.map((pr, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setInlineUrl(pr.url)}
                className="wb-badge wb-badge-neutral font-mono"
                style={{ cursor: 'pointer', background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
                title={pr.desc}
              >
                {pr.label}
              </button>
            ))}
            <button
              type="button"
              onClick={onRunDemo}
              className="wb-badge wb-badge-lime font-mono"
              style={{ cursor: 'pointer', marginLeft: 'auto' }}
            >
              Or Run Built-in Seeded Regression Demo &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Dense Activity Summary Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', marginBottom: '1.25rem' }}>
        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', padding: '0.75rem 1rem', borderRadius: '3px' }}>
          <div style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
            Total Analyses
          </div>
          <div style={{ fontSize: '1.4rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-primary)' }}>
            {metrics.total_analyses}
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', padding: '0.75rem 1rem', borderRadius: '3px' }}>
          <div style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
            Pytest Regressions Caught
          </div>
          <div style={{ fontSize: '1.4rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: metrics.test_failures_detected > 0 ? 'var(--error-red)' : 'var(--accent-lime)' }}>
            {metrics.test_failures_detected}
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', padding: '0.75rem 1rem', borderRadius: '3px' }}>
          <div style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
            Impact Findings Traced
          </div>
          <div style={{ fontSize: '1.4rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-primary)' }}>
            {metrics.unresolved_impact_findings}
          </div>
        </div>
      </div>

      {/* Recent Analyses Workbench Table */}
      <div className="wb-panel">
        <div className="wb-panel-header">
          <span className="wb-panel-title">
            <Cpu size={14} color="var(--accent-lime)" />
            Recent Impact Analyses
          </span>
          <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
            SQLite Storage &bull; {recentAnalyses.length} runs recorded
          </span>
        </div>

        {recentAnalyses.length === 0 ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
            <p style={{ marginBottom: '0.75rem' }}>No code impact analyses logged yet.</p>
            <button className="wb-btn wb-btn-primary" onClick={onRunDemo} style={{ margin: '0 auto' }}>
              Run First Analysis Demo
            </button>
          </div>
        ) : (
          <table className="wb-table">
            <thead>
              <tr>
                <th>Mode</th>
                <th>Target Repository</th>
                <th>Subject / Commit</th>
                <th>Risk Status</th>
                <th>Findings</th>
                <th>Regressions</th>
                <th>Timestamp</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {recentAnalyses.map((item) => (
                <tr key={item.id} style={{ cursor: 'pointer' }} onClick={() => onSelectAnalysis(item.id)}>
                  <td>
                    <span className={`wb-badge ${item.mode === 'demo' ? 'wb-badge-lime' : 'wb-badge-neutral'}`}>
                      {item.mode}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {item.repository}
                  </td>
                  <td>
                    <div style={{ maxWidth: '320px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-primary)' }}>
                      {item.pr_title || (item.mode === 'demo' ? 'Seeded Pricing Refactor' : 'GitHub PR Analysis')}
                    </div>
                    {item.pr_number && (
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                        #{item.pr_number} ({item.base_ref} &larr; {item.head_ref})
                      </span>
                    )}
                  </td>
                  <td>
                    <span className={`wb-badge ${item.status === 'completed' ? 'wb-badge-lime' : 'wb-badge-red'}`}>
                      {item.status}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{item.findings_count}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: item.test_failures_count > 0 ? 'var(--error-red)' : 'var(--text-dim)' }}>
                    {item.test_failures_count > 0 ? `${item.test_failures_count} FAILED` : '0 FAILED'}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.725rem', color: 'var(--text-dim)' }}>
                    {new Date(item.created_at).toLocaleDateString()} {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="wb-btn wb-btn-secondary"
                      style={{ padding: '2px 8px', fontSize: '0.7rem' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectAnalysis(item.id);
                      }}
                    >
                      Inspect Evidence &rarr;
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
