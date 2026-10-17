import React from 'react';
import { History, GitPullRequest, Play } from 'lucide-react';
import type { AnalysisSummary } from '../types';

interface HistoryViewProps {
  analyses: AnalysisSummary[];
  onSelectAnalysis: (id: string) => void;
  onRunDemo: () => void;
  onOpenNewAnalysis: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  analyses,
  onSelectAnalysis,
  onRunDemo,
  onOpenNewAnalysis
}) => {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.85rem' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            WORKSPACE / ANALYSES
          </div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
            Impact Investigation History
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="wb-btn wb-btn-secondary" onClick={onRunDemo}>
            <Play size={12} fill="var(--accent-lime)" color="var(--accent-lime)" />
            Run Demo
          </button>
          <button className="wb-btn wb-btn-primary" onClick={onOpenNewAnalysis}>
            <GitPullRequest size={13} />
            Analyze a PR
          </button>
        </div>
      </div>

      <div className="wb-panel">
        <div className="wb-panel-header">
          <span className="wb-panel-title">
            <History size={14} color="var(--accent-lime)" />
            Stored Reports ({analyses.length})
          </span>
          <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
            Persisted in SQLite database
          </span>
        </div>

        {analyses.length === 0 ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
            <p style={{ marginBottom: '0.75rem' }}>No analysis runs stored yet.</p>
            <button className="wb-btn wb-btn-primary" onClick={onRunDemo} style={{ margin: '0 auto' }}>
              Execute Seeded Demo Analysis
            </button>
          </div>
        ) : (
          <table className="wb-table">
            <thead>
              <tr>
                <th>Mode</th>
                <th>Repository</th>
                <th>Subject / Description</th>
                <th>Status</th>
                <th>Findings</th>
                <th>Regressions</th>
                <th>Timestamp</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {analyses.map((item) => (
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
                    <div style={{ maxWidth: '340px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-primary)' }}>
                      {item.pr_title || (item.mode === 'demo' ? 'Pricing Discount Refactor' : 'GitHub PR Analysis')}
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
                    {new Date(item.created_at).toLocaleString()}
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
                      Open &rarr;
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
