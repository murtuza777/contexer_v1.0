// =============================================================================
// TEST RUNNER COMPONENT
// =============================================================================
// Controls for starting/stopping test execution

import React from 'react';

interface TestRunnerProps {
  isRunning: boolean;
  progress: number;
  onStart: () => void;
  onStop: () => void;
  disabled?: boolean;
}

export function TestRunner({ isRunning, progress, onStart, onStop, disabled }: TestRunnerProps) {
  return (
    <div className="flex items-center space-x-2">
      {/* Progress Bar */}
      {isRunning && (
        <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      
      {/* Control Buttons */}
      {isRunning ? (
        <button
          onClick={onStop}
          className="px-3 py-1.5 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          Stop
        </button>
      ) : (
        <button
          onClick={onStart}
          disabled={disabled}
          className="px-3 py-1.5 text-sm bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Start Validation
        </button>
      )}
    </div>
  );
}
