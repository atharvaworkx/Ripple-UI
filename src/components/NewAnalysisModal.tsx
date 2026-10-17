import React, { useState } from 'react';
import { X, GitPullRequest, AlertCircle, Play, Loader2 } from 'lucide-react';

interface NewAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (prUrl: string, token: string) => Promise<void>;
  onRunDemo: () => void;
  isLoading: boolean;
}

export const NewAnalysisModal: React.FC<NewAnalysisModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onRunDemo,
  isLoading
}) => {
  const [prUrl, setPrUrl] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);

  if (!isOpen) return null;

  const samplePRs = [
    { label: 'psf/requests #6677', url: 'https://github.com/psf/requests/pull/6677' },
    { label: 'encode/httpx #3147', url: 'https://github.com/encode/httpx/pull/3147' },
    { label: 'pallets/flask #5300', url: 'https://github.com/pallets/flask/pull/5300' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!prUrl.trim()) {
      setError('Please provide a GitHub pull request URL.');
      return;
    }

    if (!prUrl.includes('github.com') || !prUrl.includes('/pull/')) {
      setError('URL must follow standard format: https://github.com/owner/repo/pull/123');
      return;
    }

    try {
      setCurrentStep(1);
      const timer1 = setTimeout(() => setCurrentStep(2), 600);
      const timer2 = setTimeout(() => setCurrentStep(3), 1200);

      await onSubmit(prUrl.trim(), token.trim());
      clearTimeout(timer1);
      clearTimeout(timer2);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Analysis failed. Check repository access or rate limits.');
      setCurrentStep(0);
    }
  };

  const steps = [
    'Validating repository parameters',
    'Fetching commit files & diff via GitHub API',
    'Parsing Python AST syntax trees',
    'Tracing call chains & synthesizing impact findings'
  ];

  return (
    <div className="wb-modal-backdrop" onClick={onClose}>
      <div className="wb-modal" onClick={(e) => e.stopPropagation()}>
        <div className="wb-panel-header" style={{ padding: '0.75rem 1rem' }}>
          <span className="wb-panel-title">
            <GitPullRequest size={14} color="var(--accent-lime)" />
            Investigate GitHub Pull Request
          </span>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ padding: '1.25rem' }}>
            {error && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', backgroundColor: 'var(--error-red-dim)', border: '1px solid var(--error-red)', padding: '0.65rem 0.85rem', borderRadius: '3px', color: 'var(--error-red)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', marginBottom: '1rem' }}>
                <AlertCircle size={15} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>{error}</div>
              </div>
            )}

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.725rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                GitHub PR URL <span style={{ color: 'var(--accent-lime)' }}>*</span>
              </label>
              <input
                type="text"
                className="wb-input"
                placeholder="https://github.com/owner/repo/pull/123"
                value={prUrl}
                onChange={(e) => setPrUrl(e.target.value)}
                disabled={isLoading}
                autoFocus
              />

              {/* 1-click test examples */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '6px', fontSize: '0.7rem' }}>
                <span style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>Test PRs:</span>
                {samplePRs.map((pr, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPrUrl(pr.url)}
                    className="wb-badge wb-badge-neutral font-mono"
                    style={{ cursor: 'pointer', background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
                  >
                    {pr.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.725rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                GitHub Token <span style={{ color: 'var(--text-dim)' }}>(Optional)</span>
              </label>
              <input
                type="password"
                className="wb-input"
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                disabled={isLoading}
              />
              <span style={{ fontSize: '0.675rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', marginTop: '4px', display: 'block' }}>
                Optional for private repos or avoiding GitHub API unauthenticated rate limits (60 req/hr).
              </span>
            </div>

            {isLoading && (
              <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-app)', border: '1px solid var(--border)', borderRadius: '3px', marginTop: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-lime)', fontSize: '0.775rem', fontFamily: 'var(--font-mono)', fontWeight: 600, marginBottom: '0.65rem' }}>
                  <Loader2 size={14} className="animate-spin" />
                  ANALYZING CODE IMPACT...
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontFamily: 'var(--font-mono)', fontSize: '0.725rem' }}>
                  {steps.map((st, idx) => (
                    <div
                      key={idx}
                      style={{
                        color: idx <= currentStep ? 'var(--text-primary)' : 'var(--text-dim)',
                        fontWeight: idx === currentStep ? 600 : 400,
                      }}
                    >
                      {idx < currentStep ? '✓' : idx === currentStep ? '→' : '·'} {st}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1.25rem', borderTop: '1px solid var(--border)', backgroundColor: 'var(--bg-elevated)' }}>
            <button
              type="button"
              className="wb-btn wb-btn-secondary"
              onClick={() => {
                onClose();
                onRunDemo();
              }}
              disabled={isLoading}
            >
              <Play size={11} fill="var(--accent-lime)" color="var(--accent-lime)" />
              Or Run Offline Demo
            </button>

            <button type="submit" className="wb-btn wb-btn-primary" disabled={isLoading}>
              {isLoading ? 'Processing...' : 'Run Investigation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
