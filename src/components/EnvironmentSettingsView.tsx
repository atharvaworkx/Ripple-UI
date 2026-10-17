import React from 'react';
import { Sliders, Database, Server, Palette, Check } from 'lucide-react';

interface EnvironmentSettingsViewProps {
  isBackendHealthy: boolean;
  theme: 'acid-lime' | 'amber-orange';
  onSelectTheme: (newTheme: 'acid-lime' | 'amber-orange') => void;
}

export const EnvironmentSettingsView: React.FC<EnvironmentSettingsViewProps> = ({
  isBackendHealthy,
  theme,
  onSelectTheme,
}) => {
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.85rem' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            WORKSPACE / SETTINGS & ENVIRONMENT
          </div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
            Visual Theme & Runtime Configuration
          </h1>
        </div>
      </div>

      {/* Visual Theme Selection Panel */}
      <div className="wb-panel" style={{ marginBottom: '1.25rem' }}>
        <div className="wb-panel-header">
          <span className="wb-panel-title">
            <Palette size={14} color="var(--accent-lime)" />
            Workbench Visual Theme
          </span>
          <span className="wb-badge wb-badge-lime font-mono">
            {theme === 'acid-lime' ? 'ACID LIME (DEFAULT)' : 'TACTICAL ORANGE'}
          </span>
        </div>

        <div className="wb-panel-body">
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Select your preferred developer theme. Themes are persisted in your browser's local storage.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {/* Theme 1: Acid Lime & Forest Dark */}
            <div
              onClick={() => onSelectTheme('acid-lime')}
              style={{
                backgroundColor: '#141A16',
                border: `2px solid ${theme === 'acid-lime' ? '#C5F36B' : '#303832'}`,
                borderRadius: '4px',
                padding: '1rem',
                cursor: 'pointer',
                position: 'relative',
                boxShadow: theme === 'acid-lime' ? '0 0 16px rgba(197, 243, 107, 0.2)' : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.85rem', color: '#F0F0E8' }}>
                  Acid Lime & Forest Dark
                </span>
                {theme === 'acid-lime' && (
                  <span className="wb-badge wb-badge-lime" style={{ fontSize: '0.65rem' }}>
                    <Check size={11} /> ACTIVE
                  </span>
                )}
              </div>
              <p style={{ fontSize: '0.75rem', color: '#9BA69A', marginBottom: '0.85rem' }}>
                The original engineering instrument theme. High-contrast muted forest dark background with acid lime accents.
              </p>

              {/* Color swatches */}
              <div style={{ display: 'flex', gap: '6px' }}>
                <span style={{ width: '22px', height: '22px', backgroundColor: '#0C100F', border: '1px solid #303832', borderRadius: '2px' }} title="Background #0C100F" />
                <span style={{ width: '22px', height: '22px', backgroundColor: '#141A16', border: '1px solid #303832', borderRadius: '2px' }} title="Surface #141A16" />
                <span style={{ width: '22px', height: '22px', backgroundColor: '#C5F36B', borderRadius: '2px' }} title="Accent Lime #C5F36B" />
                <span style={{ width: '22px', height: '22px', backgroundColor: '#F0C078', borderRadius: '2px' }} title="Warning Amber #F0C078" />
              </div>
            </div>

            {/* Theme 2: Tactical Orange & Obsidian Black */}
            <div
              onClick={() => onSelectTheme('amber-orange')}
              style={{
                backgroundColor: '#121314',
                border: `2px solid ${theme === 'amber-orange' ? '#FF7E1D' : '#2D3035'}`,
                borderRadius: '4px',
                padding: '1rem',
                cursor: 'pointer',
                position: 'relative',
                boxShadow: theme === 'amber-orange' ? '0 0 16px rgba(255, 126, 29, 0.2)' : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.85rem', color: '#F5F5F0' }}>
                  Tactical Orange & Obsidian Black
                </span>
                {theme === 'amber-orange' && (
                  <span className="wb-badge wb-badge-lime" style={{ fontSize: '0.65rem' }}>
                    <Check size={11} /> ACTIVE
                  </span>
                )}
              </div>
              <p style={{ fontSize: '0.75rem', color: '#A0A5AD', marginBottom: '0.85rem' }}>
                High-visibility industrial dark room aesthetic. Deep obsidian black background paired with vivid emergency orange accents.
              </p>

              {/* Color swatches */}
              <div style={{ display: 'flex', gap: '6px' }}>
                <span style={{ width: '22px', height: '22px', backgroundColor: '#08090A', border: '1px solid #2D3035', borderRadius: '2px' }} title="Background #08090A" />
                <span style={{ width: '22px', height: '22px', backgroundColor: '#121314', border: '1px solid #2D3035', borderRadius: '2px' }} title="Surface #121314" />
                <span style={{ width: '22px', height: '22px', backgroundColor: '#FF7E1D', borderRadius: '2px' }} title="Tactical Orange #FF7E1D" />
                <span style={{ width: '22px', height: '22px', backgroundColor: '#FFB340', borderRadius: '2px' }} title="Amber #FFB340" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Backend & Runtime Services Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
        {/* Active Backend Engine */}
        <div className="wb-panel">
          <div className="wb-panel-header">
            <span className="wb-panel-title">
              <Server size={14} color="var(--accent-lime)" />
              Backend Service
            </span>
            <span className={`wb-badge ${isBackendHealthy ? 'wb-badge-lime' : 'wb-badge-red'} font-mono`}>
              {isBackendHealthy ? 'ONLINE' : 'UNREACHABLE'}
            </span>
          </div>
          <div className="wb-panel-body" style={{ fontSize: '0.775rem', fontFamily: 'var(--font-mono)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ color: 'var(--text-dim)' }}>Framework:</span>
              <span style={{ color: 'var(--text-primary)' }}>Django 4.2 / DRF</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ color: 'var(--text-dim)' }}>Analysis Engine:</span>
              <span style={{ color: 'var(--text-primary)' }}>Python AST & Directed Adjacency Graph</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ color: 'var(--text-dim)' }}>Test Runner:</span>
              <span style={{ color: 'var(--text-primary)' }}>Pytest Subprocess Sandbox</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-dim)' }}>API Gateway:</span>
              <span style={{ color: 'var(--accent-lime)' }}>/api/ (Same-Origin / Proxy)</span>
            </div>
          </div>
        </div>

        {/* Database Persistence */}
        <div className="wb-panel">
          <div className="wb-panel-header">
            <span className="wb-panel-title">
              <Database size={14} color="var(--accent-lime)" />
              Persistence Layer
            </span>
            <span className="wb-badge wb-badge-neutral font-mono">SQLite / PostgreSQL</span>
          </div>
          <div className="wb-panel-body" style={{ fontSize: '0.775rem', fontFamily: 'var(--font-mono)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ color: 'var(--text-dim)' }}>Default Driver:</span>
              <span style={{ color: 'var(--text-primary)' }}>SQLite (db.sqlite3)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ color: 'var(--text-dim)' }}>Dynamic DB:</span>
              <span style={{ color: 'var(--text-primary)' }}>dj-database-url (Auto PostgreSQL)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-dim)' }}>Dedicated DB Needed?</span>
              <span style={{ color: 'var(--accent-lime)' }}>No (SQLite works out-of-the-box)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Deployment Variables Reference */}
      <div className="wb-panel">
        <div className="wb-panel-header">
          <span className="wb-panel-title">
            <Sliders size={14} color="var(--accent-lime)" />
            Deployment Variables (Railway & Vercel)
          </span>
          <span className="wb-badge wb-badge-lime font-mono">Ready to Deploy</span>
        </div>

        <div className="wb-panel-body" style={{ fontSize: '0.8rem' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '0.85rem' }}>
            Ripple is designed for zero-hassle deployment. You can deploy the Django backend to <strong>Railway</strong> and the React frontend to <strong>Vercel</strong> with only a couple of environment variables.
          </p>

          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
              1. Railway Backend Variables
            </div>
            <pre className="wb-code">
{`PORT=8000
DEBUG=False
SECRET_KEY=your-custom-production-secret-key-here
ALLOWED_HOSTS=*
CORS_ALLOWED_ORIGINS=https://your-ui.vercel.app,http://localhost:5173
CSRF_TRUSTED_ORIGINS=https://your-ui.vercel.app

# Optional (for private repos or high GitHub rate limits):
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx

# Optional (PostgreSQL):
# If you add Railway's free PostgreSQL plugin, Railway automatically sets DATABASE_URL.
# If omitted, default SQLite in backend/db.sqlite3 runs out-of-the-box!`}
            </pre>
          </div>

          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
              2. Vercel Frontend Variables
            </div>
            <pre className="wb-code">
{`# Set this in your Vercel Project Settings -> Environment Variables:
VITE_API_URL=https://your-backend-production.up.railway.app`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
