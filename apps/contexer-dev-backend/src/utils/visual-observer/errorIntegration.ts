// =============================================================================
// ERROR INTEGRATION ENGINE (Backend)
// =============================================================================
// Integrates Visual Observer with existing error handling systems

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

export interface TestAction {
  type: 'click' | 'fill' | 'expect' | 'navigate' | 'wait' | 'hover' | 'select';
  selector: string;
  value?: string;
  expected?: string;
  timeout?: number;
  description: string;
}

export interface VisualObserverError {
  type: 'validation_failure' | 'selector_not_found' | 'timeout' | 'network_error' | 'assertion_failed';
  message: string;
  storyId: string;
  criteria?: string;
  selector?: string;
  screenshot?: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  suggestions: string[];
}

export class ErrorIntegration {
  private static readonly ERROR_PATTERNS = {
    selector_not_found: /Element not found|Selector not found|Could not find element/i,
    timeout: /Timeout|Timed out|Timeout exceeded/i,
    network_error: /Network error|Connection failed|Failed to load/i,
    assertion_failed: /Assertion failed|Expected.*but got|Test failed/i,
    validation_failure: /Validation failed|Test validation failed/i
  };

  private static readonly ERROR_SUGGESTIONS = {
    selector_not_found: [
      'Check if the element exists on the page',
      'Verify the selector is correct',
      'Try using a different selector strategy',
      'Check if the page has loaded completely',
      'Consider adding data-testid attributes to elements'
    ],
    timeout: [
      'Increase the timeout value',
      'Check if the page is loading slowly',
      'Verify the element appears within the timeout period',
      'Consider adding explicit waits for dynamic content'
    ],
    network_error: [
      'Check your internet connection',
      'Verify the project URL is correct',
      'Ensure the development server is running',
      'Check for CORS issues'
    ],
    assertion_failed: [
      'Verify the expected value is correct',
      'Check if the element state has changed',
      'Review the test logic',
      'Consider adding more specific assertions'
    ],
    validation_failure: [
      'Review the acceptance criteria',
      'Check if the feature is implemented correctly',
      'Verify the test steps are accurate',
      'Consider updating the test expectations'
    ]
  };

  static processValidationErrors(result: ValidationResult): VisualObserverError[] {
    const errors: VisualObserverError[] = [];

    if (result.overallStatus === 'failed') {
      errors.push({
        type: 'validation_failure',
        message: `Story ${result.storyId} validation failed`,
        storyId: result.storyId,
        timestamp: new Date(),
        severity: 'high',
        suggestions: this.ERROR_SUGGESTIONS.validation_failure
      });
    }

    for (const criteriaResult of result.criteriaResults) {
      if (criteriaResult.status === 'failed' && criteriaResult.error) {
        const error = this.parseCriteriaError(criteriaResult, result.storyId);
        if (error) {
          errors.push(error);
        }
      }
    }

    for (const errorMessage of result.errors) {
      const error = this.parseExecutionError(errorMessage, result.storyId);
      if (error) {
        errors.push(error);
      }
    }

    return errors;
  }

  private static parseCriteriaError(criteriaResult: CriteriaResult, storyId: string): VisualObserverError | null {
    if (!criteriaResult.error) return null;

    const errorType = this.classifyError(criteriaResult.error);
    const severity = this.determineSeverity(errorType, criteriaResult.error);

    return {
      type: errorType,
      message: criteriaResult.error,
      storyId,
      criteria: criteriaResult.criteria,
      selector: criteriaResult.actions[0]?.selector,
      screenshot: criteriaResult.screenshot,
      timestamp: new Date(),
      severity,
      suggestions: this.ERROR_SUGGESTIONS[errorType] || []
    };
  }

  private static parseExecutionError(errorMessage: string, storyId: string): VisualObserverError | null {
    const errorType = this.classifyError(errorMessage);
    const severity = this.determineSeverity(errorType, errorMessage);

    return {
      type: errorType,
      message: errorMessage,
      storyId,
      timestamp: new Date(),
      severity,
      suggestions: this.ERROR_SUGGESTIONS[errorType] || []
    };
  }

  private static classifyError(errorMessage: string): VisualObserverError['type'] {
    for (const [type, pattern] of Object.entries(this.ERROR_PATTERNS)) {
      if (pattern.test(errorMessage)) {
        return type as VisualObserverError['type'];
      }
    }

    return 'validation_failure';
  }

  private static determineSeverity(errorType: VisualObserverError['type'], errorMessage: string): VisualObserverError['severity'] {
    if (errorType === 'network_error' || errorMessage.includes('critical')) {
      return 'critical';
    }

    if (errorType === 'validation_failure' || errorType === 'assertion_failed') {
      return 'high';
    }

    if (errorType === 'timeout') {
      return 'medium';
    }

    return 'low';
  }

  static emitErrors(errors: VisualObserverError[]): void {
    for (const error of errors) {
      console.log('Visual Observer Error:', {
        type: error.type,
        message: error.message,
        severity: error.severity,
        storyId: error.storyId,
        suggestions: error.suggestions
      });
    }
  }

  static generateErrorReport(errors: VisualObserverError[]): {
    summary: string;
    details: Array<{
      error: VisualObserverError;
      fixSuggestions: string[];
      priority: number;
    }>;
  } {
    const criticalErrors = errors.filter(e => e.severity === 'critical');
    const highErrors = errors.filter(e => e.severity === 'high');
    const mediumErrors = errors.filter(e => e.severity === 'medium');
    const lowErrors = errors.filter(e => e.severity === 'low');

    const summary = `Visual Observer found ${errors.length} issues: ${criticalErrors.length} critical, ${highErrors.length} high, ${mediumErrors.length} medium, ${lowErrors.length} low priority`;

    const details = errors.map(error => ({
      error,
      fixSuggestions: this.generateFixSuggestions(error),
      priority: this.calculatePriority(error)
    })).sort((a, b) => b.priority - a.priority);

    return { summary, details };
  }

  private static generateFixSuggestions(error: VisualObserverError): string[] {
    const suggestions = [...error.suggestions];

    switch (error.type) {
      case 'selector_not_found':
        if (error.selector) {
          suggestions.push(`Update selector: ${error.selector}`);
          suggestions.push('Add data-testid attribute to the target element');
        }
        break;

      case 'timeout':
        suggestions.push('Increase timeout in test configuration');
        suggestions.push('Add explicit wait for element visibility');
        break;

      case 'assertion_failed':
        suggestions.push('Review expected values in test assertions');
        suggestions.push('Check if the application state matches test expectations');
        break;

      case 'validation_failure':
        suggestions.push('Review user story acceptance criteria');
        suggestions.push('Verify feature implementation matches requirements');
        break;
    }

    return suggestions;
  }

  private static calculatePriority(error: VisualObserverError): number {
    let priority = 0;

    switch (error.severity) {
      case 'critical': priority += 100; break;
      case 'high': priority += 75; break;
      case 'medium': priority += 50; break;
      case 'low': priority += 25; break;
    }

    switch (error.type) {
      case 'network_error': priority += 20; break;
      case 'validation_failure': priority += 15; break;
      case 'selector_not_found': priority += 10; break;
      case 'timeout': priority += 5; break;
    }

    if (error.screenshot) {
      priority += 5;
    }

    return priority;
  }
}
