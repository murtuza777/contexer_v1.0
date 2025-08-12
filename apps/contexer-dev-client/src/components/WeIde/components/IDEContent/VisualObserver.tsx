import React, { useState, useRef, useEffect } from "react";
import { Eye, Play, Square, RefreshCw, AlertCircle, CheckCircle, Monitor, Smartphone } from "lucide-react";
import { cn } from "@/utils/cn";

interface VisualObserverProps {
  onFileSelect?: (path: string, line?: number) => void;
}

interface ObservationEvent {
  id: string;
  timestamp: Date;
  type: "error" | "success" | "warning" | "info";
  source: "browser" | "terminal" | "network";
  message: string;
  stack?: string;
  url?: string;
}

interface AcceptanceCheck {
  id: string;
  name: string;
  type: "url_contains" | "element_exists" | "no_console_errors" | "custom";
  value: string;
  enabled: boolean;
  passed?: boolean;
}

export function VisualObserver({ onFileSelect }: VisualObserverProps) {
  const [isObserving, setIsObserving] = useState(false);
  const [events, setEvents] = useState<ObservationEvent[]>([]);
  const [acceptanceChecks, setAcceptanceChecks] = useState<AcceptanceCheck[]>([
    {
      id: "1",
      name: "No Console Errors",
      type: "no_console_errors",
      value: "",
      enabled: true
    },
    {
      id: "2", 
      name: "Page Loads Successfully",
      type: "url_contains",
      value: "localhost",
      enabled: true
    }
  ]);
  const [previewUrl, setPreviewUrl] = useState("http://localhost:3000");
  const [selectedDevice, setSelectedDevice] = useState<"desktop" | "mobile">("desktop");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const startObservation = () => {
    setIsObserving(true);
    setEvents([]);
    
    // Simulate starting observation
    addEvent({
      type: "info",
      source: "browser",
      message: "Started visual observation session"
    });
  };

  const stopObservation = () => {
    setIsObserving(false);
    addEvent({
      type: "info", 
      source: "browser",
      message: "Stopped visual observation session"
    });
  };

  const addEvent = (eventData: Omit<ObservationEvent, "id" | "timestamp">) => {
    const event: ObservationEvent = {
      id: Date.now().toString(),
      timestamp: new Date(),
      ...eventData
    };
    setEvents(prev => [event, ...prev]);
  };

  const refreshPreview = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
    addEvent({
      type: "info",
      source: "browser", 
      message: "Preview refreshed"
    });
  };

  const addAcceptanceCheck = () => {
    const newCheck: AcceptanceCheck = {
      id: Date.now().toString(),
      name: "New Check",
      type: "element_exists",
      value: "",
      enabled: true
    };
    setAcceptanceChecks(prev => [...prev, newCheck]);
  };

  const updateAcceptanceCheck = (id: string, updates: Partial<AcceptanceCheck>) => {
    setAcceptanceChecks(prev => 
      prev.map(check => 
        check.id === id ? { ...check, ...updates } : check
      )
    );
  };

  const removeAcceptanceCheck = (id: string) => {
    setAcceptanceChecks(prev => prev.filter(check => check.id !== id));
  };

  const runAcceptanceChecks = () => {
    // Simulate running checks
    acceptanceChecks.forEach(check => {
      if (!check.enabled) return;
      
      // Mock check results
      const passed = Math.random() > 0.3; // 70% pass rate for demo
      updateAcceptanceCheck(check.id, { passed });
      
      addEvent({
        type: passed ? "success" : "error",
        source: "browser",
        message: `Acceptance check "${check.name}": ${passed ? "PASSED" : "FAILED"}`
      });
    });
  };

  // Simulate iframe error detection
  useEffect(() => {
    if (!isObserving) return;

    const interval = setInterval(() => {
      // Simulate random events during observation
      if (Math.random() > 0.8) {
        const eventTypes = ["error", "warning", "info"] as const;
        const sources = ["browser", "terminal", "network"] as const;
        const messages = [
          "Console error detected",
          "Network request failed", 
          "Component rendered successfully",
          "API call completed",
          "DOM updated"
        ];

        addEvent({
          type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
          source: sources[Math.floor(Math.random() * sources.length)],
          message: messages[Math.floor(Math.random() * messages.length)]
        });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isObserving]);

  const getEventIcon = (type: ObservationEvent["type"]) => {
    switch (type) {
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "warning":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#f8f8f8] dark:bg-[#18181a]">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-[#e4e4e4] dark:border-[#333] bg-white dark:bg-[#1a1a1c]">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-green-500" />
          <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
            Visual Observer
          </span>
          {isObserving && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-red-500">Recording</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setSelectedDevice(selectedDevice === "desktop" ? "mobile" : "desktop")}
            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-[#2c2c2c] text-gray-600 dark:text-gray-400"
            title={`Switch to ${selectedDevice === "desktop" ? "mobile" : "desktop"} view`}
          >
            {selectedDevice === "desktop" ? (
              <Monitor className="w-4 h-4" />
            ) : (
              <Smartphone className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={refreshPreview}
            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-[#2c2c2c] text-gray-600 dark:text-gray-400"
            title="Refresh preview"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={isObserving ? stopObservation : startObservation}
            className={cn(
              "p-1.5 rounded hover:bg-gray-100 dark:hover:bg-[#2c2c2c]",
              isObserving ? "text-red-500" : "text-green-500"
            )}
            title={isObserving ? "Stop observation" : "Start observation"}
          >
            {isObserving ? (
              <Square className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Preview Panel */}
        <div className="flex-1 flex flex-col border-r border-[#e4e4e4] dark:border-[#333]">
          {/* Preview URL Bar */}
          <div className="p-2 border-b border-[#e4e4e4] dark:border-[#333] bg-white dark:bg-[#1a1a1c]">
            <input
              type="text"
              value={previewUrl}
              onChange={(e) => setPreviewUrl(e.target.value)}
              className="w-full px-3 py-1 text-sm border border-gray-200 dark:border-gray-600 rounded 
                       bg-white dark:bg-[#1a1a1c] text-gray-900 dark:text-gray-100
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter preview URL..."
            />
          </div>

          {/* Preview Iframe */}
          <div className="flex-1 bg-white p-4">
            <div 
              className={cn(
                "mx-auto bg-white border border-gray-200 rounded-lg overflow-hidden",
                selectedDevice === "mobile" ? "w-80 h-96" : "w-full h-full"
              )}
            >
              <iframe
                ref={iframeRef}
                src={previewUrl}
                className="w-full h-full"
                title="Visual Observer Preview"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              />
            </div>
          </div>
        </div>

        {/* Events & Controls Panel */}
        <div className="w-80 flex flex-col bg-white dark:bg-[#1a1a1c]">
          {/* Acceptance Checks */}
          <div className="border-b border-[#e4e4e4] dark:border-[#333] p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Acceptance Checks
              </h3>
              <button
                onClick={addAcceptanceCheck}
                className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add
              </button>
            </div>
            <div className="space-y-2 mb-3">
              {acceptanceChecks.map((check) => (
                <div key={check.id} className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={check.enabled}
                    onChange={(e) => updateAcceptanceCheck(check.id, { enabled: e.target.checked })}
                    className="w-3 h-3"
                  />
                  <input
                    type="text"
                    value={check.name}
                    onChange={(e) => updateAcceptanceCheck(check.id, { name: e.target.value })}
                    className="flex-1 px-1 py-0.5 border border-gray-200 dark:border-gray-600 rounded text-xs
                             bg-white dark:bg-[#1a1a1c] text-gray-900 dark:text-gray-100"
                  />
                  {check.passed !== undefined && (
                    <div className="w-3 h-3">
                      {check.passed ? (
                        <CheckCircle className="w-3 h-3 text-green-500" />
                      ) : (
                        <AlertCircle className="w-3 h-3 text-red-500" />
                      )}
                    </div>
                  )}
                  <button
                    onClick={() => removeAcceptanceCheck(check.id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={runAcceptanceChecks}
              className="w-full px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
            >
              Run Checks
            </button>
          </div>

          {/* Events Log */}
          <div className="flex-1 flex flex-col">
            <div className="p-3 border-b border-[#e4e4e4] dark:border-[#333]">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Events ({events.length})
              </h3>
            </div>
            <div className="flex-1 overflow-auto">
              {events.length === 0 ? (
                <div className="p-3 text-xs text-gray-500 text-center">
                  {isObserving ? "Waiting for events..." : "Start observation to see events"}
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      className="p-2 rounded border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-[#18181a]"
                    >
                      <div className="flex items-start gap-2">
                        {getEventIcon(event.type)}
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                            {event.message}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {event.timestamp.toLocaleTimeString()} • {event.source}
                          </div>
                          {event.stack && (
                            <pre className="text-xs text-gray-600 dark:text-gray-300 mt-1 whitespace-pre-wrap">
                              {event.stack}
                            </pre>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
