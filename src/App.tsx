import React, { useState, useEffect } from 'react';
import { NavigationRail } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { AnalysisReportView } from './components/AnalysisReportView';
import { HistoryView } from './components/HistoryView';
import { EnvironmentSettingsView } from './components/EnvironmentSettingsView';
import { NewAnalysisModal } from './components/NewAnalysisModal';
import { DependencyMap } from './components/DependencyMap';
import { EvidencePanel } from './components/EvidencePanel';
import {
  fetchHealth,
  fetchDashboard,
  fetchAnalyses,
  fetchAnalysisDetail,
  runDemoAnalysis,
  runGitHubAnalysis
} from './api';
import type { AnalysisDetail, AnalysisSummary, MetricSummary, GraphNode, Finding } from './types';
import { Layers, Play, GitPullRequest } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'analyses' | 'explorer' | 'report' | 'settings'>('overview');
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisDetail | null>(null);
  const [metrics, setMetrics] = useState<MetricSummary>({
    total_analyses: 0,
    test_failures_detected: 0,
    unresolved_impact_findings: 0,
  });
  const [recentAnalyses, setRecentAnalyses] = useState<AnalysisSummary[]>([]);
  const [allAnalyses, setAllAnalyses] = useState<AnalysisSummary[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);
  const [isLoadingPR, setIsLoadingPR] = useState(false);
  const [isBackendHealthy, setIsBackendHealthy] = useState(true);

  const [theme, setTheme] = useState<'acid-lime' | 'amber-orange'>(() => {
    return (localStorage.getItem('ripple-theme') as 'acid-lime' | 'amber-orange') || 'acid-lime';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ripple-theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'acid-lime' ? 'amber-orange' : 'acid-lime'));
  };

  // Explorer specific state
  const [explorerSelectedNode, setExplorerSelectedNode] = useState<GraphNode | null>(null);
  const [explorerSelectedFinding, setExplorerSelectedFinding] = useState<Finding | null>(null);

  const loadDashboardData = async () => {
    try {
      const [dash, health] = await Promise.all([
        fetchDashboard(),
        fetchHealth().catch(() => ({ status: 'down' }))
      ]);
      setMetrics(dash.metrics);
      setRecentAnalyses(dash.recent_analyses);
      setIsBackendHealthy(health.status === 'healthy');

      // If we don't have an active report loaded, load the most recent one if available
      if (!selectedAnalysis && dash.recent_analyses.length > 0) {
        try {
          const latest = await fetchAnalysisDetail(dash.recent_analyses[0].id);
          setSelectedAnalysis(latest);
        } catch {
          // ignore
        }
      }
    } catch {
      setIsBackendHealthy(false);
    }
  };

  const loadAllAnalyses = async () => {
    try {
      const list = await fetchAnalyses();
      setAllAnalyses(list);
    } catch (e) {
      console.error('Failed to load analyses', e);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (activeTab === 'analyses') {
      loadAllAnalyses();
    }
  }, [activeTab]);

  const handleRunDemo = async () => {
    setIsLoadingDemo(true);
    try {
      const report = await runDemoAnalysis();
      setSelectedAnalysis(report);
      setActiveTab('report');
      await loadDashboardData();
    } catch (err: any) {
      alert(`Demo analysis failed: ${err.message}`);
    } finally {
      setIsLoadingDemo(false);
    }
  };

  const handleRunGitHub = async (prUrl: string, token: string) => {
    setIsLoadingPR(true);
    try {
      const report = await runGitHubAnalysis(prUrl, token);
      setSelectedAnalysis(report);
      setActiveTab('report');
      await loadDashboardData();
    } finally {
      setIsLoadingPR(false);
    }
  };

  const handleSelectAnalysis = async (id: string) => {
    try {
      const report = await fetchAnalysisDetail(id);
      setSelectedAnalysis(report);
      setActiveTab('report');
    } catch (err: any) {
      alert(`Could not load report: ${err.message}`);
    }
  };

  return (
    <div className="workbench-shell">
      {/* Compact Navigation Rail */}
      <NavigationRail
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewAnalysis={() => setIsModalOpen(true)}
        onRunDemo={handleRunDemo}
        isBackendHealthy={isBackendHealthy}
        hasActiveReport={selectedAnalysis !== null}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Content Workspace */}
      <div className="workbench-content">
        {/* Top Header */}
        <header className="workbench-header">
          <div className="header-crumb">
            <span>WORKBENCH</span>
            <span>/</span>
            <strong>{activeTab.toUpperCase()}</strong>
            {selectedAnalysis && activeTab === 'report' && (
              <>
                <span>/</span>
                <span style={{ color: 'var(--accent-lime)' }}>{selectedAnalysis.repository}</span>
              </>
            )}
          </div>

          <div className="header-actions">
            <button
              onClick={handleToggleTheme}
              className="wb-btn wb-btn-secondary"
              style={{ padding: '3px 8px', fontSize: '0.675rem', display: 'flex', alignItems: 'center', gap: '5px' }}
              title="Toggle Theme"
            >
              <span style={{ width: '8px', height: '8px', backgroundColor: 'var(--accent-lime)', borderRadius: '2px' }} />
              {theme === 'acid-lime' ? 'LIME' : 'ORANGE'}
            </button>

            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-dim)' }}>
              MODE: {selectedAnalysis?.mode ? selectedAnalysis.mode.toUpperCase() : 'STANDBY'}
            </span>
          </div>
        </header>

        {/* Workspace View Container */}
        <main className="workbench-view">
          {activeTab === 'overview' && (
            <DashboardView
              metrics={metrics}
              recentAnalyses={recentAnalyses}
              onOpenNewAnalysis={() => setIsModalOpen(true)}
              onRunDemo={handleRunDemo}
              onSubmitPR={handleRunGitHub}
              onSelectAnalysis={handleSelectAnalysis}
              isLoadingDemo={isLoadingDemo}
              isLoadingPR={isLoadingPR}
            />
          )}

          {activeTab === 'analyses' && (
            <HistoryView
              analyses={allAnalyses}
              onSelectAnalysis={handleSelectAnalysis}
              onRunDemo={handleRunDemo}
              onOpenNewAnalysis={() => setIsModalOpen(true)}
            />
          )}

          {activeTab === 'report' && selectedAnalysis && (
            <AnalysisReportView
              analysis={selectedAnalysis}
              onBack={() => setActiveTab('overview')}
            />
          )}

          {activeTab === 'explorer' && (
            <div style={{ width: '100%', maxWidth: '1380px', minWidth: 0, margin: '0 auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.85rem' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    WORKSPACE / DEPENDENCY MAP
                  </div>
                  <h1 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                    Interactive AST Call Graph & Impact Navigator
                  </h1>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="wb-btn wb-btn-secondary" onClick={handleRunDemo}>
                    <Play size={12} fill="var(--accent-lime)" color="var(--accent-lime)" />
                    Reload Seeded Scenario
                  </button>
                  <button className="wb-btn wb-btn-primary" onClick={() => setIsModalOpen(true)}>
                    <GitPullRequest size={13} />
                    Map External PR
                  </button>
                </div>
              </div>

              {selectedAnalysis ? (
                <div className="workbench-grid">
                  <div className="wb-panel">
                    <div className="wb-panel-header">
                      <span className="wb-panel-title">
                        <Layers size={14} color="var(--accent-lime)" />
                        Graph View: {selectedAnalysis.repository}
                      </span>
                      <span style={{ fontSize: '0.725rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
                        {selectedAnalysis.graph?.nodes?.length || 0} Nodes &bull; {selectedAnalysis.graph?.edges?.length || 0} Edges
                      </span>
                    </div>

                    <div style={{ padding: '8px' }}>
                      <DependencyMap
                        nodes={selectedAnalysis.graph?.nodes || []}
                        edges={selectedAnalysis.graph?.edges || []}
                        changedFunctionIds={
                          selectedAnalysis.changed_functions?.map((cf) => cf.id || cf.name) || [
                            'billing/pricing.py::calculate_discounted_price'
                          ]
                        }
                        selectedNodeId={explorerSelectedNode?.id || null}
                        onSelectNode={(node) => {
                          setExplorerSelectedNode(node);
                          setExplorerSelectedFinding(null);
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <EvidencePanel
                      selectedNode={explorerSelectedNode}
                      selectedFinding={explorerSelectedFinding}
                      edges={selectedAnalysis.graph?.edges || []}
                      findings={selectedAnalysis.findings || []}
                      onSelectFinding={(f) => {
                        setExplorerSelectedFinding(f);
                        setExplorerSelectedNode(null);
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="wb-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-dim)' }}>
                  <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                    No active codebase graph in memory. Run an analysis to construct the AST dependency map.
                  </p>
                  <button className="wb-btn wb-btn-primary" onClick={handleRunDemo} style={{ margin: '0 auto' }}>
                    Generate Seeded Dependency Map
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <EnvironmentSettingsView
              isBackendHealthy={isBackendHealthy}
              theme={theme}
              onSelectTheme={setTheme}
            />
          )}
        </main>
      </div>

      {/* Analysis Modal */}
      <NewAnalysisModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleRunGitHub}
        onRunDemo={handleRunDemo}
        isLoading={isLoadingPR}
      />
    </div>
  );
};

export default App;
