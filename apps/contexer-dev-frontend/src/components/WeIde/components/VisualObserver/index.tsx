// =============================================================================
// VISUAL OBSERVER MAIN COMPONENT
// =============================================================================
// Simple Visual Observer for validating user stories against live preview

import React, { useState, useEffect } from 'react';
import { UserStory } from '@/types/context';
import { ValidationResult } from '@/types/visualObserver';
import { VisualObserverApi } from '@/services/visualObserverApi';
import useProjectStore from '@/stores/projectSlice';
import { parseAndEnhanceUserStories } from '@/utils/nlp/userStoryParser';
import { ValidationPanel } from './ValidationPanel';
import { TestRunner } from './TestRunner';
import { ScreenshotViewer } from './ScreenshotViewer';

interface VisualObserverProps {
  onFileSelect?: (path: string, line?: number) => void;
}

export function VisualObserver({ onFileSelect }: VisualObserverProps) {
  const [selectedStory, setSelectedStory] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState<ValidationResult | null>(null);
  const [showScreenshotViewer, setShowScreenshotViewer] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [reportJson, setReportJson] = useState<any | null>(null);
  const [reportMarkdown, setReportMarkdown] = useState<string>('');
  const [reportTimestamp, setReportTimestamp] = useState<string>('');

  // Get data from project store
  const { currentProject } = useProjectStore();

  // Get user stories from project context - check both formats
  const userStories: UserStory[] = (() => {
    // Check if we have the new format (array of UserStory objects)
    if (currentProject?.context?.user_stories && Array.isArray(currentProject.context.user_stories)) {
      return currentProject.context.user_stories as UserStory[];
    }
    
    // Check if we have the legacy format (string that needs parsing)
    if (currentProject?.context?.userStories && typeof currentProject.context.userStories === 'string') {
      return parseAndEnhanceUserStories(currentProject.context.userStories);
    }
    
    return [];
  })();
  
  const userStoriesText: string = (() => {
    if (currentProject?.context?.userStories && typeof currentProject.context.userStories === 'string') {
      return currentProject.context.userStories;
    }
    
    if (currentProject?.context?.user_stories && Array.isArray(currentProject.context.user_stories)) {
      return currentProject.context.user_stories.map((story: any) => 
        typeof story === 'string' ? story : story.description
      ).join('\n');
    }
    
    return '';
  })();

  // Debug logging
  console.log('🔍 [VisualObserver] Data check:', {
    hasCurrentProject: !!currentProject,
    hasContext: !!currentProject?.context,
    contextKeys: currentProject?.context ? Object.keys(currentProject.context) : [],
    userStoriesCount: userStories.length,
    userStoriesTextLength: userStoriesText.length,
    userStories: userStories.map(s => ({ id: s.id, description: s.description }))
  });

  // Detect running server URL dynamically
  const detectRunningUrl = async (): Promise<string> => {
    const commonPorts = [5173, 3000, 3001, 8080, 4000];
    const baseUrl = 'http://localhost';
    
    for (const port of commonPorts) {
      try {
        const response = await fetch(`${baseUrl}:${port}`, { 
          method: 'HEAD',
          mode: 'no-cors',
          signal: AbortSignal.timeout(1000)
        });
        return `${baseUrl}:${port}`;
      } catch (error) {
        // Continue to next port
        continue;
      }
    }
    
    // Default fallback
    return 'http://localhost:5173';
  };

  const [detectedUrl, setDetectedUrl] = useState<string>('http://localhost:5173');
  const [backendAvailable, setBackendAvailable] = useState<boolean>(false);

  // Detect URL on component mount
  useEffect(() => {
    detectRunningUrl().then(setDetectedUrl);
    
    // Check if backend is available
    checkBackendAvailability().then(setBackendAvailable);
  }, []);

  // Check if backend API is available
  const checkBackendAvailability = async (): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:3000/api/test', {
        method: 'GET',
        signal: AbortSignal.timeout(2000)
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  };

  // Start validation using backend Playwright service (required)
  const handleStartValidation = async () => {
    if (isRunning || userStories.length === 0) {
      console.log('🎯 [VisualObserver] Validation blocked:', { isRunning, storiesCount: userStories.length });
      return;
    }

    if (!backendAvailable) {
      setErrors(["Backend Visual Observer service is not available. Please start the backend (Next.js) on port 3000 and try again."]);
      return;
    }

    setIsRunning(true);
    setProgress(0);
    setErrors([]);
    setValidationResults([]);
    setReportJson(null);
    setReportMarkdown('');
    setReportTimestamp('');

    try {
      console.log('🎯 [VisualObserver] Starting validation', {
        storiesCount: userStories.length,
        targetUrl: detectedUrl
      });

      for (let i = 0; i < userStories.length; i++) {
        const story = userStories[i];
        
        console.log('🎯 [VisualObserver] Validating story', {
          index: i,
          storyId: story.id,
          description: story.description
        });

        // Update progress
        setProgress((i / userStories.length) * 100);

        // Execute validation via backend API (Playwright)
        const result = await VisualObserverApi.validateStory(
          currentProject?.id || 'current-project',
          story.id,
          story.acceptance_criteria,
          detectedUrl
        );

        console.log('🎯 [VisualObserver] Validation result', { storyId: story.id, result });

        // Store result
        setValidationResults(prev => [...prev, result]);
      }

      setProgress(100);
      console.log('🎯 [VisualObserver] Validation complete');
      const report = buildValidationReport();
      const markdown = buildMarkdownReport(report);
      setReportJson(report);
      setReportMarkdown(markdown);
      setReportTimestamp(new Date().toISOString());

    } catch (error) {
      console.error('❌ [VisualObserver] Validation failed:', error);
      setErrors([error instanceof Error ? error.message : 'Unknown error']);
    } finally {
      setIsRunning(false);
    }
  };

  const handleStopValidation = () => {
    setIsRunning(false);
    setProgress(0);
  };

  // Helper functions
  const canMapStory = (story: UserStory): boolean => {
    return !!(story.acceptance_criteria && story.acceptance_criteria.length > 0);
  };

  const buildValidationReport = () => {
    const projectId = currentProject?.id || 'unknown-project';
    const projectName = currentProject?.name || 'Untitled Project';
    const generatedAt = new Date().toISOString();
    const totalStories = userStories.length;
    const statusCounts = validationResults.reduce((acc, r) => {
      acc[r.overallStatus] = (acc[r.overallStatus] || 0) as number + 1 as number;
      return acc;
    }, { passed: 0 as number, failed: 0 as number, partial: 0 as number } as Record<'passed'|'failed'|'partial', number>);
    const avgConfidence = validationResults.length
      ? validationResults.reduce((s, r) => s + (r.confidence || 0), 0) / validationResults.length
      : 0;

    const stories = userStories.map(story => {
      const res = validationResults.find(r => r.storyId === story.id);
      return {
        id: story.id,
        description: story.description,
        criteriaCount: story.acceptance_criteria?.length || 0,
        status: res?.overallStatus || 'not_run',
        confidence: res?.confidence ?? 0,
        criteria: (res?.criteriaResults || []).map(c => ({
          criteria: c.criteria,
          status: c.status,
          confidence: c.confidence,
          error: c.error || undefined
        }))
      };
    });

    return {
      projectId,
      projectName,
      targetUrl: detectedUrl,
      generatedAt,
      summary: {
        totalStories,
        passed: statusCounts.passed,
        failed: statusCounts.failed,
        partial: statusCounts.partial,
        avgConfidence
      },
      stories
    };
  };

  const buildMarkdownReport = (report: any): string => {
    const lines: string[] = [];
    lines.push(`# Visual Observer Validation Report`);
    lines.push(`Project: ${report.projectName} (${report.projectId})`);
    lines.push(`Target URL: ${report.targetUrl}`);
    lines.push(`Generated: ${report.generatedAt}`);
    lines.push('');
    lines.push(`## Summary`);
    lines.push(`- Total stories: ${report.summary.totalStories}`);
    lines.push(`- Passed: ${report.summary.passed}`);
    lines.push(`- Failed: ${report.summary.failed}`);
    lines.push(`- Partial: ${report.summary.partial}`);
    lines.push(`- Avg confidence: ${(report.summary.avgConfidence * 100).toFixed(0)}%`);
    lines.push('');
    lines.push(`## Stories`);
    report.stories.forEach((s: any, idx: number) => {
      lines.push(`### ${idx + 1}. ${s.description}`);
      lines.push(`- Story ID: ${s.id}`);
      lines.push(`- Criteria: ${s.criteriaCount}`);
      lines.push(`- Status: ${s.status}`);
      lines.push(`- Confidence: ${(s.confidence * 100).toFixed(0)}%`);
      if (s.criteria?.length) {
        lines.push(`- Results:`);
        s.criteria.forEach((c: any) => {
          lines.push(`  - [${c.status}] ${c.criteria} (${Math.round((c.confidence || 0) * 100)}%)${c.error ? ` — ${c.error}` : ''}`);
        });
      }
      lines.push('');
    });
    return lines.join('\n');
  };

  const downloadText = (filename: string, content: string, type = 'text/plain') => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-[#1f1f22]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Visual Observer
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Validate user stories against live preview
            </p>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${backendAvailable ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {backendAvailable ? 'Backend Available' : 'Client-side Validation'}
            </span>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {detectedUrl}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-600 bg-white dark:bg-[#2c2c2c]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <strong>{userStories.length}</strong> user stories found
            </div>
            {isRunning && (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-blue-600 dark:text-blue-400">
                  Validating... {Math.round(progress)}%
                </span>
              </div>
            )}
          </div>
          
          <TestRunner
            isRunning={isRunning}
            progress={progress}
            onStart={handleStartValidation}
            onStop={handleStopValidation}
            disabled={userStories.length === 0}
          />
        </div>

        {/* Error Display */}
        {errors.length > 0 && (
          <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="text-sm text-red-800 dark:text-red-200">
              <strong>Validation Errors:</strong>
            </div>
            {errors.map((error, index) => (
              <div key={index} className="text-sm text-red-700 dark:text-red-300 mt-1">
                • {error}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Stories List */}
        <div className="w-1/3 border-r border-gray-200 dark:border-gray-600 bg-white dark:bg-[#2c2c2c]">
          <div className="p-4 border-b border-gray-200 dark:border-gray-600">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              User Stories ({userStories.length})
            </h3>
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              <div>Target URL: {detectedUrl}</div>
              <div>Stories Available: {userStories.length > 0 ? '✅' : '❌'}</div>
              <div>Raw Text: {userStoriesText ? '✅' : '❌'}</div>
              <div>Validation Mode: {backendAvailable ? '🟢 Backend API' : '🟡 Client-side'}</div>
            </div>
          </div>
          
          <div className="overflow-y-auto">
            {userStories.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                <div className="text-4xl mb-2">📝</div>
                <p className="text-sm">No user stories found</p>
                <p className="text-xs mt-1">Add stories in Context Composer</p>
              </div>
            ) : (
              userStories.map((story) => {
                const canMap = canMapStory(story);
                const result = validationResults.find(r => r.storyId === story.id);
                
                return (
                  <div
                    key={story.id}
                    className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#3c3c3c] ${
                      selectedStory === story.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                    onClick={() => setSelectedStory(story.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {story.description}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {story.acceptance_criteria.length} criteria
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-2">
                        {/* Status indicator */}
                        {result && (
                          <div className={`px-2 py-1 text-xs rounded ${
                            result.overallStatus === 'passed' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                            result.overallStatus === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                          }`}>
                            {result.overallStatus}
                          </div>
                        )}

                        {/* Action buttons */}
                        {canMap && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (result) {
                                setSelectedResult(result);
                              }
                            }}
                            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                          >
                            {result ? 'View' : 'Test'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Results Panel */}
        <div className="flex-1 flex flex-col">
          {selectedResult ? (
            <ValidationPanel
              result={selectedResult}
              onClose={() => setSelectedResult(null)}
              onFileSelect={onFileSelect}
            />
          ) : (
            <div className="flex-1 flex flex-col p-6 space-y-4 overflow-auto">
              {/* Run summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-gray-100 dark:bg-[#2b2b2b]">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Stories</div>
                  <div className="text-xl font-semibold text-gray-900 dark:text-gray-100">{userStories.length}</div>
                </div>
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                  <div className="text-xs text-green-700 dark:text-green-300">Passed</div>
                  <div className="text-xl font-semibold text-green-800 dark:text-green-400">{validationResults.filter(r => r.overallStatus === 'passed').length}</div>
                </div>
                <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                  <div className="text-xs text-yellow-700 dark:text-yellow-300">Partial</div>
                  <div className="text-xl font-semibold text-yellow-800 dark:text-yellow-400">{validationResults.filter(r => r.overallStatus === 'partial').length}</div>
                </div>
                <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20">
                  <div className="text-xs text-red-700 dark:text-red-300">Failed</div>
                  <div className="text-xl font-semibold text-red-800 dark:text-red-400">{validationResults.filter(r => r.overallStatus === 'failed').length}</div>
                </div>
              </div>

              {/* Report actions */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {reportTimestamp ? `Last report: ${new Date(reportTimestamp).toLocaleString()}` : 'Run validation to generate a report'}
                </div>
                <div className="space-x-2">
                  <button
                    className="px-3 py-1.5 text-xs bg-gray-200 dark:bg-[#3a3a3a] text-gray-800 dark:text-gray-100 rounded hover:bg-gray-300"
                    onClick={() => {
                      const report = buildValidationReport();
                      const md = buildMarkdownReport(report);
                      setReportJson(report);
                      setReportMarkdown(md);
                      setReportTimestamp(new Date().toISOString());
                    }}
                  >
                    Generate Report
                  </button>
                  <button
                    className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    disabled={!reportJson && validationResults.length === 0}
                    onClick={() => {
                      const report = reportJson || buildValidationReport();
                      downloadText(`vo-report-${currentProject?.id || 'project'}.json`, JSON.stringify(report, null, 2), 'application/json');
                    }}
                  >
                    Download JSON
                  </button>
                  <button
                    className="px-3 py-1.5 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
                    disabled={!reportMarkdown && validationResults.length === 0}
                    onClick={() => {
                      const report = reportJson || buildValidationReport();
                      const md = reportMarkdown || buildMarkdownReport(report);
                      downloadText(`vo-report-${currentProject?.id || 'project'}.md`, md, 'text/markdown');
                    }}
                  >
                    Download Markdown
                  </button>
                </div>
              </div>

              {/* Helper text */}
              <div className="text-sm text-gray-500 dark:text-gray-400">
                The report is designed for a future assistant ("Viber") to consume: it lists each story, per-criteria results, and confidence. Save and attach it when prompting Viber.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Screenshot Viewer Modal */}
      {showScreenshotViewer && selectedResult && (
        <ScreenshotViewer
          screenshots={selectedResult.screenshots}
          onClose={() => setShowScreenshotViewer(false)}
        />
      )}
    </div>
  );
}