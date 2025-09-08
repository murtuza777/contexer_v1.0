// =============================================================================
// VISUAL OBSERVER TYPES
// =============================================================================
// TypeScript interfaces for Visual Observer functionality

export interface TestAction {
  type: 'click' | 'fill' | 'expect' | 'navigate' | 'wait' | 'hover' | 'select';
  selector: string;
  value?: string;
  expected?: string;
  timeout?: number;
  description: string;
}

export interface ValidationResult {
  storyId: string;
  criteriaResults: CriteriaResult[];
  overallStatus: 'passed' | 'failed' | 'partial';
  confidence: number;
  executionTime: number;
  screenshots: string[];
  errors: string[];
}

export interface CriteriaResult {
  criteria: string;
  status: 'passed' | 'failed' | 'skipped';
  actions: TestAction[];
  error?: string;
  screenshot?: string;
  confidence: number;
}

export interface TestExecutionOptions {
  baseUrl: string;
  timeout: number;
  headless: boolean;
  captureScreenshots: boolean;
  retryAttempts: number;
}

export interface VisualObserverConfig {
  defaultTimeout: number;
  screenshotPath: string;
  testResultsPath: string;
  enableRetries: boolean;
  maxRetries: number;
}

// Selector strategies for smart element detection
export interface SelectorStrategy {
  priority: number;
  selector: string;
  description: string;
  confidence: number;
}

export interface ElementDescription {
  text?: string;
  role?: string;
  type?: string;
  placeholder?: string;
  label?: string;
  testId?: string;
  className?: string;
  id?: string;
}

// Integration with existing systems
export interface VisualObserverState {
  isRunning: boolean;
  currentStory?: string;
  progress: number;
  results: ValidationResult[];
  lastError?: string;
}

export interface ValidationHistory {
  id: string;
  projectId: string;
  storyId: string;
  criteria: string[];
  results: ValidationResult;
  timestamp: Date;
  screenshots: string[];
}
