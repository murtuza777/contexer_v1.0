import React, { useState, useRef, useEffect } from "react";
import { Save, FileText, Loader2, Code2 } from "lucide-react";
import { cn } from "@/utils/cn";
import { contextApi, type Project } from "@/services/contextApi";
import useUserStore from "@/stores/userSlice";
import useProjectStore from "@/stores/projectSlice";
import { convertLegacyToNewContext, convertNewToLegacyContext } from "@/types/context";
import { recommendTechFromText, type DetectionOutcome } from "@/utils/nlp/techStackDetector";
import { parseAndEnhanceUserStories } from "@/utils/nlp/userStoryParser";
import { eventEmitter } from "@/components/AiChat/utils/EventEmitter";

interface ContextComposerProps {
  onFileSelect?: (path: string, line?: number) => void;
}

interface ProjectContext {
  id: string;
  appDescription: string;
  techStack: string[];
  userStories: string;
  readme: string;
  constraints: string;
  lastUpdated: Date;
}

const TECH_STACKS = [
  "React",
  "Next.js",
  "Vue.js",
  "Angular",
  "Node.js",
  "Express",
  "FastAPI",
  "Django",
  "Supabase",
  "PostgreSQL",
  "MongoDB",
  "TypeScript",
  "JavaScript",
  "Python",
  "Tailwind CSS",
  "Material-UI",
  "Chakra UI"
];

export function ContextComposer({ onFileSelect }: ContextComposerProps) {
  const [context, setContext] = useState<ProjectContext>({
    id: "current",
    appDescription: "",
    techStack: [],
    userStories: "",
    readme: "",
    constraints: "",
    lastUpdated: new Date()
  });

  const [isSaved, setIsSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isAuthenticated, token } = useUserStore();
  const [detected, setDetected] = useState<DetectionOutcome | null>(null);
  const [readmePreview, setReadmePreview] = useState<string>("");
  const [isProcessingReadme, setIsProcessingReadme] = useState(false);
  const readmeDebounceRef = useRef<number | null>(null);
  
  // Use project store
  const { 
    currentProject, 
    isLoading, 
    error, 
    setCurrentProject, 
    setError, 
    createProject, 
    updateProject, 
    loadProjects,
    setCurrentProjectByChatUuid,
    createProjectFromChat,
    updateProjectActivity
  } = useProjectStore();

  const handleTechStackToggle = (tech: string) => {
    setContext(prev => {
      const isCurrentlySelected = prev.techStack.includes(tech);
      const newTechStack = isCurrentlySelected
        ? prev.techStack.filter(t => t !== tech)
        : [...prev.techStack, tech];
      
      return {
        ...prev,
        techStack: newTechStack
      };
    });
  };

  // Track current chat UUID from event emitter
  const [currentChatUuid, setCurrentChatUuid] = useState<string | null>(null);

  // Listen for chat selection events - each chat has its own project
  useEffect(() => {
    const handleChatSelect = (chatUuid: string) => {
      console.log('🔄 ContextComposer: Chat selected (chat-as-project):', chatUuid);
      setCurrentChatUuid(chatUuid);
    };

    const unsubscribe = eventEmitter.on('chat:select', handleChatSelect);
    
    return () => {
      unsubscribe();
    };
  }, []);

  // Also listen for chat creation events to immediately bind new chat
  useEffect(() => {
    const handleChatCreate = async (chatUuid: string) => {
      console.log('🆕 ContextComposer: New chat created:', chatUuid)
      setCurrentChatUuid(chatUuid)
      // Proactively set the project by this chat UUID
      await setCurrentProjectByChatUuid(chatUuid)
    }
    const unsubscribe = eventEmitter.on('chat:create', handleChatCreate)
    return () => unsubscribe()
  }, [setCurrentProjectByChatUuid])

  // Load or create the project based on current chat selection
  useEffect(() => {
    const loadOrCreateProject = async () => {
      if (!isAuthenticated || !token) return;

      try {
        // Load projects from store
        await loadProjects();
        
        if (currentChatUuid) {
          console.log('🔄 ContextComposer: Setting project for chat UUID:', currentChatUuid);
          // Set current project based on chat UUID
          await setCurrentProjectByChatUuid(currentChatUuid);
        } else {
          // When no chat UUID, avoid switching to an arbitrary prior project.
          console.log('🔄 ContextComposer: No chat UUID yet, waiting for selection');
        }
      } catch (error) {
        setError("Failed to load project data");
      }
    };

    loadOrCreateProject();
  }, [isAuthenticated, token, currentChatUuid, loadProjects, setError, setCurrentProjectByChatUuid]);

  // Separate effect to load context when currentProject changes
  useEffect(() => {
    const loadProjectContext = async () => {
      if (!currentProject) {
        console.log('🔄 No current project, skipping context load');
        return;
      }

      try {
        console.log('🔄 Loading context for project:', currentProject.id, currentProject.name);
        console.log('🔄 Full project object:', currentProject);
        
        // Convert backend context to legacy format for UI
        if (currentProject.context) {
          console.log('📄 Found context in project:', currentProject.context);
          const legacyContext = convertNewToLegacyContext(currentProject.context);
          console.log('🔄 Converted to legacy context:', legacyContext);
          setContext(legacyContext);
        } else {
          console.log('📄 No context found in project, using default');
          // Reset to default context if no context exists
          setContext({
            id: currentProject.id,
            appDescription: "",
            techStack: [],
            userStories: "",
            readme: "",
            constraints: "",
            lastUpdated: new Date()
          });
        }
      } catch (error) {
        console.error('Failed to load project context:', error);
        setError("Failed to load project context");
      }
    };

    loadProjectContext();
  }, [currentProject, setError]);

  // Listen for view changes to refresh context when switching to context tab
  useEffect(() => {
    const handleViewChange = (event: CustomEvent<{ view: string }>) => {
      if (event.detail.view === 'context' && currentProject) {
        console.log('🔄 Context view activated');
        // In chat-as-project model, each chat has exactly one project
        if (currentChatUuid && currentProject.chat_uuid !== currentChatUuid) {
          console.log('🔄 Chat-project mismatch, syncing to chat UUID:', currentChatUuid)
          setCurrentProjectByChatUuid(currentChatUuid)
            .then(() => refreshContext())
        } else {
          // Otherwise refresh context of current project
          refreshContext();
        }
      }
    };

    window.addEventListener('view:change', handleViewChange as EventListener);
    return () => {
      window.removeEventListener('view:change', handleViewChange as EventListener);
    };
  }, [currentProject]);

  // Also refresh context when component becomes visible (fallback)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && currentProject) {
        console.log('🔄 Page became visible, refreshing context');
        refreshContext();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [currentProject]);

  // Auto-detect tech stack from description and suggest/apply
  useEffect(() => {
    const text = context.appDescription || "";
    
    const outcome = recommendTechFromText(text, 0.3);
    
    setDetected(outcome);
    
    // Auto-apply if high confidence and not already selected
    if (outcome.detected && outcome.detected.score >= 0.6) {
      const canonical = outcome.recommended;
      setContext(prev => (
        prev.techStack.includes(canonical)
          ? prev
          : { ...prev, techStack: [...prev.techStack, canonical] }
      ));
    }
  }, [context.appDescription]);

  // Auto-save context when it changes (debounced)
  useEffect(() => {
    if (!currentProject || !context.appDescription) return;

    const timeoutId = setTimeout(async () => {
      try {
        const newContext = convertLegacyToNewContext(context);
        const deriveName = (raw: string) => {
          const base = (raw || '').split('\n')[0].trim();
          if (!base) return 'New Project';
          return base.length > 120 ? base.slice(0, 120) + '…' : base;
        };

        await updateProject(currentProject.id, {
          context: newContext,
          name: deriveName(context.appDescription),
          description: context.appDescription?.trim() || "Auto-saved from Context Composer"
        });

        await updateProjectActivity(currentProject.id);
        console.log('💾 Auto-saved context for project:', currentProject.id);
      } catch (error) {
        console.error('Failed to auto-save context:', error);
      }
    }, 2000); // 2 second debounce

    return () => clearTimeout(timeoutId);
  }, [context, currentProject, updateProject, updateProjectActivity]);

  const applyRecommendedTech = () => {
    if (!detected) return;
    const canonical = detected.recommended;
    setContext(prev => (
      prev.techStack.includes(canonical)
        ? prev
        : { ...prev, techStack: [...prev.techStack, canonical] }
    ));
  };

  // Function to refresh context from current project
  const refreshContext = async () => {
    if (!currentProject) {
      console.log('🔄 No current project to refresh');
      return;
    }
    
    try {
      console.log('🔄 Manually refreshing context for project:', currentProject.id);
      
      // Reload the project to get latest data
      await loadProjects();
      
      // Get the updated project from store
      const { projects } = useProjectStore.getState();
      const updatedProject = projects.find(p => p.id === currentProject.id);
      
      if (updatedProject && updatedProject.context) {
        console.log('📄 Found updated context:', updatedProject.context);
        const legacyContext = convertNewToLegacyContext(updatedProject.context);
        console.log('🔄 Setting refreshed context:', legacyContext);
        setContext(legacyContext);
      } else {
        console.log('📄 No context found in updated project');
      }
    } catch (error) {
      console.error('Failed to refresh context:', error);
      setError("Failed to refresh context");
    }
  };

  const handleSave = async () => {
    if (!isAuthenticated || !token) {
      setError("Please log in to save your context");
      return;
    }

    setError(null);

    try {
      // Convert legacy context to new format
      const newContext = convertLegacyToNewContext(context);
      
      // Derive a safe project name (UI may contain long description)
      const deriveName = (raw: string) => {
        const base = (raw || '').split('\n')[0].trim();
        if (!base) return 'New Project';
        return base.length > 120 ? base.slice(0, 120) + '…' : base;
      };

      // Use tracked chat UUID
      const chatUuid = currentChatUuid;
      
      if (currentProject) {
        // Update existing project
        const success = await updateProject(currentProject.id, {
          context: newContext,
          name: deriveName(context.appDescription),
          description: context.appDescription?.trim() || "Updated from Context Composer"
        });
        
        if (success) {
          setIsSaved(true);
          setTimeout(() => setIsSaved(false), 2000);
        }
      } else if (chatUuid) {
        // Create new project from chat
        const projectName = deriveName(context.appDescription);
        const newProject = await createProjectFromChat(chatUuid, {
          name: projectName,
          description: context.appDescription?.trim() || "Created from Context Composer",
          context: newContext,
          status: 'draft',
          generation_status: 'context_only'
        });
        
        if (newProject) {
          // Set the newly created project as current project
          setCurrentProject(newProject);
          setIsSaved(true);
          setTimeout(() => setIsSaved(false), 2000);
        }
      } else {
        // Fallback: create project without chat UUID
        const projectName = deriveName(context.appDescription);
        const newProject = await createProject({
          name: projectName,
          description: context.appDescription?.trim() || "Created from Context Composer",
          context: newContext,
          status: 'draft',
          generation_status: 'context_only',
          chat_uuid: currentChatUuid || ''
        });
        
        if (newProject) {
          setCurrentProject(newProject);
          setIsSaved(true);
          setTimeout(() => setIsSaved(false), 2000);
        }
      }
    } catch (error) {
      setError("Network error: Failed to save context");
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.name.toLowerCase().includes("readme")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setContext(prev => ({
          ...prev,
          readme: content
        }));
        processReadmeContent(content);
      };
      reader.readAsText(file);
    }
  };

  const processReadmeContent = async (content: string) => {
    if (!content || content.trim().length === 0) return;
    
    try {
      setIsProcessingReadme(true);
      
      const res = await contextApi.processReadme(content);
      
      if (res.success && res.data) {
        const { html, context: extracted } = res.data as any;
        
        setReadmePreview(html);
        
        // Merge description and stories conservatively (no tech suggestions)
        if (extracted) {
          setContext(prev => {
            const updated = {
              ...prev,
              appDescription: extracted.goal || prev.appDescription,
              techStack: prev.techStack,
              userStories: prev.userStories && prev.userStories.trim().length > 0
                ? prev.userStories
                : (extracted.user_stories || []).map((s: any) => `- ${s.description}`).join('\n')
            };
            return updated;
          });
        }
      } else {
        setError(res.errors?.join(', ') || 'Failed to process README');
      }
    } catch (e) {
      setError('Failed to process README');
    } finally {
      setIsProcessingReadme(false);
    }
  };

  const generateFromProject = () => {
    // setIsLoading(true); // Remove this as setIsLoading doesn't exist
    try {
      // TODO: Implement auto-detection from current project files
      
      // Simulate analysis
      setTimeout(() => {
        const testContext = {
          appDescription: "Web application generated from project analysis",
          techStack: ["React", "TypeScript", "Next.js"],
          userStories: "- User can navigate the application\n- User can interact with components\n- User can view data"
        };
        
        setContext(prev => ({
          ...prev,
          ...testContext
        }));
        // setIsLoading(false); // Remove this as setIsLoading doesn't exist
      }, 2000);
    } catch (error) {
      // setIsLoading(false); // Remove this as setIsLoading doesn't exist
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#f8f8f8] dark:bg-[#18181a]">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-[#e4e4e4] dark:border-[#333] bg-white dark:bg-[#1a1a1c]">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-blue-500" />
          <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
            Context Composer
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={generateFromProject}
            disabled={isLoading}
            className={cn(
              "p-1.5 rounded hover:bg-gray-100 dark:hover:bg-[#2c2c2c] text-gray-600 dark:text-gray-400",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            title="Auto-generate from project"
          >
            <Loader2 className={cn("w-4 h-4", isLoading && "animate-spin")} />
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-[#2c2c2c] text-gray-600 dark:text-gray-400"
            title="Upload README"
          >
            <FileText className="w-4 h-4" />
          </button>
          <button
            onClick={refreshContext}
            disabled={isLoading}
            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-[#2c2c2c] text-blue-600 dark:text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Refresh context from project"
          >
            <Loader2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className={cn(
              "p-1.5 rounded hover:bg-gray-100 dark:hover:bg-[#2c2c2c]",
              isSaved ? "text-green-500" : "text-gray-600 dark:text-gray-400",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            title="Save context"
          >
            <Save className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-3">
            <div className="text-sm text-red-700 dark:text-red-300">
              {error}
            </div>
          </div>
        )}

        {/* Success Display */}
        {isSaved && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-3">
            <div className="text-sm text-green-700 dark:text-green-300">
              ✅ Context saved successfully!
            </div>
          </div>
        )}

        {/* Authentication Warning */}
        {!isAuthenticated && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3">
            <div className="text-sm text-yellow-700 dark:text-yellow-300">
              ⚠️ Please log in to save your context to the database
            </div>
          </div>
        )}
        {/* App Description */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <FileText className="w-4 h-4" />
            App Description
          </label>
          <textarea
            value={context.appDescription}
            onChange={(e) => setContext(prev => ({ ...prev, appDescription: e.target.value }))}
            placeholder="Describe your application in plain English..."
            className="w-full h-24 p-3 text-sm border border-gray-200 dark:border-gray-600 rounded-lg 
                     bg-white dark:bg-[#1a1a1c] text-gray-900 dark:text-gray-100
                     focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* Tech Stack */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <Code2 className="w-4 h-4" />
            Tech Stack
          </label>
          {detected && (
            <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
              <div>
                Detected: <span className="font-medium">{detected.recommended}</span>
                {detected.detected?.version && (
                  <span className="ml-1 text-gray-500">v{detected.detected.version}</span>
                )}
                {typeof detected.detected?.score === 'number' && (
                  <span className="ml-2">({Math.round((detected.detected.score || 0) * 100)}%)</span>
                )}
              </div>
              <button
                type="button"
                onClick={applyRecommendedTech}
                className="px-2 py-1 rounded border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-[#2c2c2c]"
              >
                Apply
              </button>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
            {TECH_STACKS.map((tech) => (
              <button
                key={tech}
                onClick={() => handleTechStackToggle(tech)}
                className={cn(
                  "p-2 text-xs rounded-lg border transition-colors text-left",
                  context.techStack.includes(tech)
                    ? "bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300"
                    : "bg-white dark:bg-[#1a1a1c] border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                )}
              >
                {tech}
              </button>
            ))}
          </div>
        </div>

        {/* User Stories */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            User Stories / Requirements
          </label>
          <textarea
            value={context.userStories}
            onChange={(e) => setContext(prev => ({ ...prev, userStories: e.target.value }))}
            placeholder="- As a user, I want to...&#10;- As a user, I need to...&#10;- The system should..."
            className="w-full h-32 p-3 text-sm border border-gray-200 dark:border-gray-600 rounded-lg 
                     bg-white dark:bg-[#1a1a1c] text-gray-900 dark:text-gray-100
                     focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
                     {/* Parsed stories preview */}
           {(() => {
             const stories = parseAndEnhanceUserStories(context.userStories || "");
             if (!stories || stories.length === 0) return null;
             return (
              <div className="mt-2 border border-gray-200 dark:border-gray-600 rounded-lg p-3 bg-gray-50 dark:bg-[#1f1f22]">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Parsed {stories.length} stor{stories.length === 1 ? 'y' : 'ies'}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const bulletText = stories.map(s => `- ${s.description}`).join("\n");
                      setContext(prev => ({ ...prev, userStories: bulletText }));
                    }}
                    className="px-2 py-1 text-xs rounded border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-[#2c2c2c]"
                  >
                    Insert into text
                  </button>
                </div>
                <div className="mt-2 space-y-2">
                  {stories.map((s, i) => (
                    <div key={s.id || i} className="text-xs">
                      <div className="font-medium text-gray-800 dark:text-gray-200">{s.description}</div>
                      {s.acceptance_criteria?.length > 0 && (
                        <ul className="list-disc ml-5 mt-1 text-gray-700 dark:text-gray-300">
                          {s.acceptance_criteria.slice(0, 5).map((c, idx) => (
                            <li key={idx}>{c}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>

        {/* README Content */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            README Content
          </label>
          {/* Auto-process on paste with debounce for UX */}
          <textarea
            value={context.readme}
            onChange={(e) => {
              const val = e.target.value;
              setContext(prev => ({ ...prev, readme: val }));
              if (readmeDebounceRef.current) {
                window.clearTimeout(readmeDebounceRef.current);
              }
              readmeDebounceRef.current = window.setTimeout(() => {
                if (val && val.trim().length > 0) {
                  processReadmeContent(val);
                }
              }, 600);
            }}
            placeholder="Paste or upload your README.md content here..."
            className="w-full h-32 p-3 text-sm border border-gray-200 dark:border-gray-600 rounded-lg 
                     bg-white dark:bg-[#1a1a1c] text-gray-900 dark:text-gray-100
                     focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          {/* Removed README tech suggestions UI */}
          {readmePreview && (
            <span className="text-xs text-gray-600 dark:text-gray-400">Preview generated below</span>
          )}
          {readmePreview && (
            <div className="mt-2 border border-gray-200 dark:border-gray-600 rounded-lg p-3 bg-gray-50 dark:bg-[#1f1f22]">
              <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">README Preview</div>
              <div className="prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: readmePreview }} />
            </div>
          )}
        </div>

        {/* Constraints */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Constraints & Non-functional Requirements
          </label>
          <textarea
            value={context.constraints}
            onChange={(e) => setContext(prev => ({ ...prev, constraints: e.target.value }))}
            placeholder="Performance requirements, browser support, accessibility needs, etc..."
            className="w-full h-24 p-3 text-sm border border-gray-200 dark:border-gray-600 rounded-lg 
                     bg-white dark:bg-[#1a1a1c] text-gray-900 dark:text-gray-100
                     focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* Status */}
        {context.lastUpdated && (
          <div className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-600">
            Last updated: {context.lastUpdated.toLocaleString()}
          </div>
        )}
        
        {/* Debug Info */}
        <div className="text-xs text-gray-400 dark:text-gray-500 pt-2 border-t border-gray-200 dark:border-gray-600">
          <div>Chat UUID: {currentChatUuid || 'None'}</div>
          <div>Project ID: {currentProject?.id || 'None'}</div>
          <div>Project Name: {currentProject?.name || 'None'}</div>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".md,.txt"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  );
}
