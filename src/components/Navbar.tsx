import React from 'react';
import { Terminal, GitPullRequest, Layers, History, Play, Sliders, Cpu } from 'lucide-react';

interface NavigationRailProps {
  activeTab: 'overview' | 'analyses' | 'explorer' | 'report' | 'settings';
  setActiveTab: (tab: 'overview' | 'analyses' | 'explorer' | 'report' | 'settings') => void;
  onOpenNewAnalysis: () => void;
  onRunDemo: () => void;
  isBackendHealthy: boolean;
  hasActiveReport: boolean;
  theme: 'acid-lime' | 'amber-orange';
  onToggleTheme: () => void;
}

export const NavigationRail: React.FC<NavigationRailProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewAnalysis,
  onRunDemo,
  isBackendHealthy,
  hasActiveReport,
  theme,
  onToggleTheme,
}) => {
  return (
    <aside className="nav-rail">
      {/* Brand */}
      <div className="rail-brand" onClick={() => setActiveTab('overview')}>
        <div className="brand-dot" />
        <span className="brand-title">Ripple</span>
        <span className="brand-sub">v1.0</span>
      </div>

      {/* Main Navigation */}
      <nav className="rail-menu">
        <button
          className={`rail-item ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <Terminal size={15} />
          Overview
        </button>

        {hasActiveReport && (
          <button
            className={`rail-item ${activeTab === 'report' ? 'active' : ''}`}
            onClick={() => setActiveTab('report')}
          >
            <Cpu size={15} />
            Active Report
          </button>
        )}

        <button
          className={`rail-item ${activeTab === 'explorer' ? 'active' : ''}`}
          onClick={() => setActiveTab('explorer')}
        >
          <Layers size={15} />
          Dependency Map
        </button>

        <button
          className={`rail-item ${activeTab === 'analyses' ? 'active' : ''}`}
          onClick={() => setActiveTab('analyses')}
        >
          <History size={15} />
          Analyses
        </button>

        <button
          className={`rail-item ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <Sliders size={15} />
          Environment
        </button>
      </nav>

      {/* Quick Action Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', margin: '1rem 0' }}>
        <button className="wb-btn wb-btn-primary" onClick={onOpenNewAnalysis} style={{ justifyContent: 'center' }}>
          <GitPullRequest size={13} />
          Analyze PR
        </button>

        <button
          className="wb-btn wb-btn-secondary"
          onClick={onRunDemo}
          style={{ justifyContent: 'center' }}
          title="Analyze built-in seeded Python scenario"
        >
          <Play size={12} fill="var(--accent-lime)" color="var(--accent-lime)" />
          Sample Demo
        </button>
      </div>

      {/* Footer Status & Theme Switcher */}
      <div className="rail-footer">
        <button
          onClick={onToggleTheme}
          className="wb-btn-secondary"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '5px 8px',
            borderRadius: '3px',
            fontSize: '0.675rem',
            fontFamily: 'var(--font-mono)',
            cursor: 'pointer',
            border: '1px solid var(--border)'
          }}
          title="Switch Theme (Lime / Orange)"
        >
          <span style={{ color: 'var(--text-dim)' }}>THEME:</span>
          <span style={{ color: 'var(--accent-lime)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', backgroundColor: 'var(--accent-lime)', borderRadius: '2px' }} />
            {theme === 'acid-lime' ? 'LIME' : 'ORANGE'}
          </span>
        </button>

        <div className="status-indicator">
          <div className={`status-dot ${isBackendHealthy ? '' : 'offline'}`} />
          <span>{isBackendHealthy ? 'DRF ENGINE OK' : 'BACKEND OFFLINE'}</span>
        </div>
      </div>
    </aside>
  );
};
