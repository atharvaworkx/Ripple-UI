import type { AnalysisSummary, AnalysisDetail, MetricSummary } from './types';

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

export async function fetchHealth(): Promise<{ status: string; service: string }> {
  const res = await fetch(`${API_BASE}/api/health/`);
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
}

export async function fetchDashboard(): Promise<{ metrics: MetricSummary; recent_analyses: AnalysisSummary[] }> {
  const res = await fetch(`${API_BASE}/api/dashboard/`);
  if (!res.ok) throw new Error('Failed to load dashboard metrics');
  return res.json();
}

export async function runDemoAnalysis(): Promise<AnalysisDetail> {
  const res = await fetch(`${API_BASE}/api/analyses/demo/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to run sample demo analysis');
  }
  return res.json();
}

export async function runGitHubAnalysis(prUrl: string, token?: string): Promise<AnalysisDetail> {
  const res = await fetch(`${API_BASE}/api/analyses/github/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pr_url: prUrl, github_token: token || '' }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.pr_url?.[0] || 'Failed to analyze GitHub pull request');
  }
  return res.json();
}

export async function fetchAnalyses(): Promise<AnalysisSummary[]> {
  const res = await fetch(`${API_BASE}/api/analyses/`);
  if (!res.ok) throw new Error('Failed to fetch analysis history');
  return res.json();
}

export async function fetchAnalysisDetail(id: string): Promise<AnalysisDetail> {
  const res = await fetch(`${API_BASE}/api/analyses/${id}/`);
  if (!res.ok) throw new Error('Analysis report not found');
  return res.json();
}
