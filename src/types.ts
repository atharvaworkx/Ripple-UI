export interface MetricSummary {
  total_analyses: number;
  test_failures_detected: number;
  unresolved_impact_findings: number;
}

export interface AnalysisSummary {
  id: string;
  mode: 'demo' | 'github';
  repository: string;
  pr_title: string;
  pr_number?: number;
  base_ref: string;
  head_ref: string;
  status: 'completed' | 'failed' | 'partial';
  created_at: string;
  findings_count: number;
  test_failures_count: number;
  error_message?: string;
}

export interface Finding {
  id: string;
  title: string;
  category: 'verified_test_failure' | 'statically_established_dependency' | 'potential_behavioral_risk' | 'missing_or_insufficient_test_coverage' | 'unresolved_or_uncertain_dependency';
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  affected_component: string;
  explanation: string;
  dependency_path: string[];
  file_path: string;
  line_number: number;
  relevant_tests: string[];
  recommended_validation: string;
  verified_by_execution: boolean;
}

export interface TestResult {
  test_spec: string;
  test_name: string;
  status: 'passed' | 'failed' | 'skipped' | 'unavailable';
  duration?: string;
  output_snippet?: string;
  failure_details?: string;
}

export interface ExistingTest {
  test_id: string;
  name: string;
  file_path: string;
  lineno: number;
  reason: string;
  inferred: boolean;
}

export interface SuggestedTest {
  target_function: string;
  target_file: string;
  title: string;
  description: string;
  code: string;
  syntactically_valid: boolean;
  syntax_error?: string;
}

export interface GraphNode {
  id: string;
  name: string;
  type: string;
  file_path: string;
  lineno: number;
  end_lineno: number;
  parent_class?: string;
  is_endpoint?: boolean;
  is_test?: boolean;
  metadata?: Record<string, any>;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: string;
  evidence: string;
  lineno?: number;
}

export interface DependencyGraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface AnalysisDetail {
  id: string;
  mode: 'demo' | 'github';
  repository: string;
  pr_title: string;
  pr_number?: number;
  base_ref: string;
  head_ref: string;
  status: 'completed' | 'failed' | 'partial';
  created_at: string;
  error_message?: string;
  changed_files: string[];
  changed_functions: any[];
  diff_snippet: string;
  findings: Finding[];
  affected_nodes: Record<string, any>;
  existing_tests: ExistingTest[];
  suggested_tests: SuggestedTest[];
  test_results: TestResult[];
  graph: DependencyGraphData;
  metrics: Record<string, any>;
}
