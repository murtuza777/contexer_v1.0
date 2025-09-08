// =============================================================================
// VALIDATION PANEL COMPONENT
// =============================================================================
// Displays validation results for a selected story

import React from 'react';
import { ValidationResult } from '@/types/visualObserver';

interface ValidationPanelProps {
  result: ValidationResult;
  onClose: () => void;
  onFileSelect?: (path: string, line?: number) => void;
}

export function ValidationPanel({ result, onClose, onFileSelect }: ValidationPanelProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'text-green-600 dark:text-green-400';
      case 'failed': return 'text-red-600 dark:text-red-400';
      case 'partial': return 'text-yellow-600 dark:text-yellow-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return (
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'failed':
        return (
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'partial':
        return (
          <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-[#2c2c2c]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center space-x-3">
          {getStatusIcon(result.overallStatus)}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Validation Results
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Story: {result.storyId} • Confidence: {Math.round(result.confidence * 100)}%
            </p>
          </div>
        </div>
        
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Summary Stats */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-600">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {result.criteriaResults.length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Criteria</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {result.criteriaResults.filter(r => r.status === 'passed').length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Passed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {result.criteriaResults.filter(r => r.status === 'failed').length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Failed</div>
          </div>
        </div>
        
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>Execution Time: {result.executionTime}ms</span>
          <span>Screenshots: {result.screenshots.length}</span>
        </div>
      </div>

      {/* Criteria Results */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
            Acceptance Criteria Results
          </h4>
          
          <div className="space-y-3">
            {result.criteriaResults.map((criteriaResult, index) => (
              <div
                key={index}
                className="border border-gray-200 dark:border-gray-600 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(criteriaResult.status)}
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {criteriaResult.criteria}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {Math.round(criteriaResult.confidence * 100)}% confidence
                  </span>
                </div>
                
                {/* Actions */}
                {criteriaResult.actions.length > 0 && (
                  <div className="mt-2">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Actions:</div>
                    <div className="space-y-1">
                      {criteriaResult.actions.map((action, actionIndex) => (
                        <div
                          key={actionIndex}
                          className="flex items-center space-x-2 text-xs bg-gray-50 dark:bg-[#3c3c3c] rounded px-2 py-1"
                        >
                          <span className="font-mono text-blue-600 dark:text-blue-400">
                            {action.type}
                          </span>
                          <span className="text-gray-600 dark:text-gray-400">
                            {action.selector}
                          </span>
                          {action.value && (
                            <span className="text-green-600 dark:text-green-400">
                              "{action.value}"
                            </span>
                          )}
                          {action.expected && (
                            <span className="text-purple-600 dark:text-purple-400">
                              → {action.expected}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Error */}
                {criteriaResult.error && (
                  <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
                    <div className="text-xs text-red-700 dark:text-red-400">
                      <strong>Error:</strong> {criteriaResult.error}
                    </div>
                  </div>
                )}
                
                {/* Screenshot */}
                {criteriaResult.screenshot && (
                  <div className="mt-2">
                    <button
                      onClick={() => onFileSelect?.(criteriaResult.screenshot!, 1)}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      View Screenshot
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Errors */}
      {result.errors.length > 0 && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-600 bg-red-50 dark:bg-red-900/20">
          <h4 className="text-sm font-medium text-red-700 dark:text-red-400 mb-2">
            Execution Errors
          </h4>
          <div className="space-y-1">
            {result.errors.map((error, index) => (
              <div key={index} className="text-xs text-red-600 dark:text-red-400">
                • {error}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
