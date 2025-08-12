import React, { useState, useEffect } from "react";
import { AlertTriangle, Wrench, Play, Square, Undo, RotateCcw, CheckCircle, Clock } from "lucide-react";
import { cn } from "@/utils/cn";

interface ErrorFixerProps {
  onFileSelect?: (path: string, line?: number) => void;
}

interface DetectedError {
  id: string;
  timestamp: Date;
  source: "terminal" | "browser" | "linter" | "build";
  type: "syntax" | "runtime" | "logic" | "dependency" | "type";
  severity: "error" | "warning";
  message: string;
  file?: string;
  line?: number;
  stack?: string;
  suggestion?: string;
}

interface FixAttempt {
  id: string;
  errorId: string;
  timestamp: Date;
  status: "pending" | "in_progress" | "success" | "failed";
  strategy: string;
  changes?: {
    file: string;
    oldContent: string;
    newContent: string;
  }[];
  result?: string;
}

export function ErrorFixer({ onFileSelect }: ErrorFixerProps) {
  const [isAutoFixEnabled, setIsAutoFixEnabled] = useState(false);
  const [errors, setErrors] = useState<DetectedError[]>([]);
  const [fixAttempts, setFixAttempts] = useState<FixAttempt[]>([]);
  const [selectedError, setSelectedError] = useState<string | null>(null);

  const addError = (errorData: Omit<DetectedError, "id" | "timestamp">) => {
    const error: DetectedError = {
      id: Date.now().toString() + Math.random(),
      timestamp: new Date(),
      ...errorData
    };
    setErrors(prev => [error, ...prev]);

    // Auto-fix if enabled
    if (isAutoFixEnabled && error.severity === "error") {
      setTimeout(() => {
        attemptFix(error.id);
      }, 1000);
    }
  };

  const attemptFix = async (errorId: string) => {
    const error = errors.find(e => e.id === errorId);
    if (!error) return;

    const fixAttempt: FixAttempt = {
      id: Date.now().toString(),
      errorId,
      timestamp: new Date(),
      status: "in_progress",
      strategy: getFixStrategy(error)
    };

    setFixAttempts(prev => [fixAttempt, ...prev]);

    // Simulate fix attempt
    try {
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
      
      const success = Math.random() > 0.3; // 70% success rate for demo
      
      setFixAttempts(prev => 
        prev.map(attempt => 
          attempt.id === fixAttempt.id 
            ? { 
                ...attempt, 
                status: success ? "success" : "failed",
                result: success ? "Fix applied successfully" : "Fix attempt failed - manual intervention required",
                changes: success ? [{
                  file: error.file || "unknown.ts",
                  oldContent: "// old code",
                  newContent: "// fixed code"
                }] : undefined
              }
            : attempt
        )
      );

      if (success) {
        // Remove the error if fix was successful
        setErrors(prev => prev.filter(e => e.id !== errorId));
      }
    } catch (err) {
      setFixAttempts(prev => 
        prev.map(attempt => 
          attempt.id === fixAttempt.id 
            ? { ...attempt, status: "failed", result: "Fix attempt crashed" }
            : attempt
        )
      );
    }
  };

  const getFixStrategy = (error: DetectedError): string => {
    switch (error.type) {
      case "syntax":
        return "Syntax repair based on error pattern";
      case "runtime":
        return "Runtime error handling injection";
      case "logic":
        return "Logic flow analysis and correction";
      case "dependency":
        return "Dependency resolution and import fixing";
      case "type":
        return "TypeScript type inference and fixing";
      default:
        return "General error resolution";
    }
  };

  const revertFix = (attemptId: string) => {
    const attempt = fixAttempts.find(f => f.id === attemptId);
    if (!attempt?.changes) return;

    // Simulate reverting changes
    console.log("Reverting fix:", attempt);
    
    // Re-add the original error
    const originalError = {
      source: "terminal" as const,
      type: "runtime" as const,
      severity: "error" as const,
      message: "Error restored after revert"
    };
    addError(originalError);
  };

  const clearAllErrors = () => {
    setErrors([]);
    setFixAttempts([]);
    setSelectedError(null);
  };

  // Simulate incoming errors
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.85) { // 15% chance every 3 seconds
        const errorTypes = ["syntax", "runtime", "logic", "dependency", "type"] as const;
        const sources = ["terminal", "browser", "linter", "build"] as const;
        const severities = ["error", "warning"] as const;
        const messages = [
          "TypeError: Cannot read property 'map' of undefined",
          "SyntaxError: Unexpected token }",
          "Module not found: Can't resolve './component'",
          "Property 'title' does not exist on type 'Props'",
          "Warning: React Hook useEffect has a missing dependency",
          "Build failed: TypeScript compilation error",
          "Network request failed with status 404"
        ];

        addError({
          source: sources[Math.floor(Math.random() * sources.length)],
          type: errorTypes[Math.floor(Math.random() * errorTypes.length)],
          severity: severities[Math.floor(Math.random() * severities.length)],
          message: messages[Math.floor(Math.random() * messages.length)],
          file: Math.random() > 0.5 ? `src/components/Component${Math.floor(Math.random() * 5)}.tsx` : undefined,
          line: Math.random() > 0.5 ? Math.floor(Math.random() * 100) + 1 : undefined
        });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isAutoFixEnabled]);

  const getStatusIcon = (status: FixAttempt["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-gray-500" />;
      case "in_progress":
        return <Wrench className="w-4 h-4 text-blue-500 animate-pulse" />;
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "failed":
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
    }
  };

  const getSeverityColor = (severity: DetectedError["severity"]) => {
    return severity === "error" ? "text-red-500" : "text-yellow-500";
  };

  return (
    <div className="h-full flex flex-col bg-[#f8f8f8] dark:bg-[#18181a]">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-[#e4e4e4] dark:border-[#333] bg-white dark:bg-[#1a1a1c]">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-orange-500" />
          <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
            Error Fixer
          </span>
          <span className="text-xs px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded">
            {errors.length} errors
          </span>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={isAutoFixEnabled}
              onChange={(e) => setIsAutoFixEnabled(e.target.checked)}
              className="w-3 h-3"
            />
            <span className="text-gray-700 dark:text-gray-300">Auto-fix</span>
          </label>
          <button
            onClick={clearAllErrors}
            className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Clear All
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Errors List */}
        <div className="w-1/2 flex flex-col border-r border-[#e4e4e4] dark:border-[#333]">
          <div className="p-3 border-b border-[#e4e4e4] dark:border-[#333] bg-white dark:bg-[#1a1a1c]">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Detected Errors
            </h3>
          </div>
          <div className="flex-1 overflow-auto bg-white dark:bg-[#1a1a1c]">
            {errors.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                No errors detected. Your code is clean! ✨
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {errors.map((error) => (
                  <div
                    key={error.id}
                    onClick={() => setSelectedError(error.id)}
                    className={cn(
                      "p-3 rounded border cursor-pointer transition-colors",
                      selectedError === error.id
                        ? "border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <AlertTriangle className={cn("w-4 h-4 mt-0.5", getSeverityColor(error.severity))} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {error.message}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {error.source} • {error.type} • {error.timestamp.toLocaleTimeString()}
                        </div>
                        {error.file && (
                          <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                            {error.file}{error.line ? `:${error.line}` : ""}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          attemptFix(error.id);
                        }}
                        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                        title="Attempt fix"
                      >
                        <Wrench className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Fix Attempts */}
        <div className="w-1/2 flex flex-col">
          <div className="p-3 border-b border-[#e4e4e4] dark:border-[#333] bg-white dark:bg-[#1a1a1c]">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Fix Attempts ({fixAttempts.length})
            </h3>
          </div>
          <div className="flex-1 overflow-auto bg-white dark:bg-[#1a1a1c]">
            {fixAttempts.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                No fix attempts yet. Enable auto-fix or manually trigger fixes.
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {fixAttempts.map((attempt) => (
                  <div
                    key={attempt.id}
                    className="p-3 rounded border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-[#18181a]"
                  >
                    <div className="flex items-start gap-2">
                      {getStatusIcon(attempt.status)}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {attempt.strategy}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {attempt.timestamp.toLocaleTimeString()} • {attempt.status}
                        </div>
                        {attempt.result && (
                          <div className={cn(
                            "text-xs mt-2 p-2 rounded",
                            attempt.status === "success" 
                              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                              : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                          )}>
                            {attempt.result}
                          </div>
                        )}
                        {attempt.changes && (
                          <div className="text-xs mt-2">
                            <div className="text-gray-600 dark:text-gray-400">Changes made:</div>
                            {attempt.changes.map((change, idx) => (
                              <div key={idx} className="text-blue-600 dark:text-blue-400">
                                • {change.file}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      {attempt.status === "success" && attempt.changes && (
                        <button
                          onClick={() => revertFix(attempt.id)}
                          className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                          title="Revert fix"
                        >
                          <Undo className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
