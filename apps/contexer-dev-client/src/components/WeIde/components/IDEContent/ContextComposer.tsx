import React, { useState, useRef, useEffect } from "react";
import { Save, Upload, RefreshCw, BookOpen, Code, FileText } from "lucide-react";
import { cn } from "@/utils/cn";
import { contextApi, type Project } from "@/services/contextApi";
import useUserStore from "@/stores/userSlice";
import { convertLegacyToNewContext, convertNewToLegacyContext } from "@/types/context";
import { recommendTechFromText, type DetectionOutcome } from "@/utils/nlp/techStackDetector";
import { parseAndEnhanceUserStories } from "@/utils/nlp/userStoryParser";

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

  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isAuthenticated, token } = useUserStore();
  const [detected, setDetected] = useState<DetectionOutcome | null>(null);
  const [readmePreview, setReadmePreview] = useState<string>("");
  const [isProcessingReadme, setIsProcessingReadme] = useState(false);
  const readmeDebounceRef = useRef<number | null>(null);

  const handleTechStackToggle = (tech: string) => {
    console.log("🔧 [Tech Stack Toggle] Toggling tech:", tech);
    setContext(prev => {
      const isCurrentlySelected = prev.techStack.includes(tech);
      const newTechStack = isCurrentlySelected
        ? prev.techStack.filter(t => t !== tech)
        : [...prev.techStack, tech];
      
      console.log("🔧 [Tech Stack Toggle] Was selected:", isCurrentlySelected);
      console.log("🔧 [Tech Stack Toggle] New tech stack:", newTechStack);
      
      return {
        ...prev,
        techStack: newTechStack
      };
    });
  };

  // Load existing project or create new one
  useEffect(() => {
    const loadOrCreateProject = async () => {
      if (!isAuthenticated || !token) return;

      console.log("🔄 [Project Loading] Starting project load...");
      setIsLoading(true);
      setError(null);

      try {
        // Try to get existing projects
        console.log("🔄 [Project Loading] Fetching projects...");
        const projectsResponse = await contextApi.getProjects();
        console.log("🔄 [Project Loading] Projects response:", projectsResponse);
        
        if (projectsResponse.success && projectsResponse.data && projectsResponse.data.length > 0) {
          // Use the first/most recent project
          const project = projectsResponse.data[0];
          console.log("🔄 [Project Loading] Using project:", project);
          setCurrentProject(project);
          
          // Convert backend context to legacy format for UI
          if (project.context) {
            console.log("🔄 [Project Loading] Converting context format...");
            const legacyContext = convertNewToLegacyContext(project.context);
            console.log("🔄 [Project Loading] Converted context:", legacyContext);
            setContext(legacyContext);
          }
        } else {
          // No projects exist, will create one on first save
          console.log("🔄 [Project Loading] No existing projects found");
        }
      } catch (error) {
        console.error("❌ [Project Loading] Failed to load projects:", error);
        setError("Failed to load project data");
      } finally {
        setIsLoading(false);
        console.log("🔄 [Project Loading] Project loading complete");
      }
    };

    loadOrCreateProject();
  }, [isAuthenticated, token]);

  // Auto-detect tech stack from description and suggest/apply
  useEffect(() => {
    const text = context.appDescription || "";
    console.log("🔍 [Tech Stack Detection] Analyzing text:", text);
    
    const outcome = recommendTechFromText(text, 0.3);
    console.log("🔍 [Tech Stack Detection] Detection outcome:", outcome);
    
    setDetected(outcome);
    
    // Auto-apply if high confidence and not already selected
    if (outcome.detected && outcome.detected.score >= 0.6) {
      const canonical = outcome.recommended;
      console.log("🔍 [Tech Stack Detection] Auto-applying high confidence tech:", canonical, "score:", outcome.detected.score);
      setContext(prev => (
        prev.techStack.includes(canonical)
          ? prev
          : { ...prev, techStack: [...prev.techStack, canonical] }
      ));
    }
  }, [context.appDescription]);

  const applyRecommendedTech = () => {
    if (!detected) return;
    const canonical = detected.recommended;
    console.log("🔍 [Tech Stack Detection] Manually applying recommended tech:", canonical);
    setContext(prev => (
      prev.techStack.includes(canonical)
        ? prev
        : { ...prev, techStack: [...prev.techStack, canonical] }
    ));
  };

  const handleSave = async () => {
    if (!isAuthenticated || !token) {
      setError("Please log in to save your context");
      return;
    }

    console.log("💾 [Save] Starting save process...");
    console.log("💾 [Save] Current context state:", context);
    
    setIsLoading(true);
    setError(null);

    try {
      // Convert legacy context to new format
      const newContext = convertLegacyToNewContext(context);
      console.log("💾 [Save] Converted to new format:", newContext);
      
      let response;
      
      // Derive a safe project name (UI may contain long description)
      const deriveName = (raw: string) => {
        const base = (raw || '').split('\n')[0].trim();
        if (!base) return 'New Project';
        return base.length > 120 ? base.slice(0, 120) + '…' : base;
      };

      if (currentProject) {
        console.log("💾 [Save] Updating existing project:", currentProject.id);
        // Update existing project
        response = await contextApi.saveContext(currentProject.id, newContext);
      } else {
        const projectName = deriveName(context.appDescription);
        console.log("💾 [Save] Creating new project with name:", projectName);
        // Create new project
        response = await contextApi.createProject({
          name: projectName,
          description: context.appDescription?.trim() || "Created from Context Composer",
          context: newContext
        });
      }

      console.log("💾 [Save] API response:", response);

      if (response.success && response.data) {
        setCurrentProject(response.data);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
        console.log("✅ [Save] Context saved successfully!");
      } else {
        console.error("❌ [Save] Failed to save:", response.errors);
        setError(response.errors?.join(", ") || "Failed to save context");
      }
    } catch (error) {
      console.error("❌ [Save] Exception during save:", error);
      setError("Network error: Failed to save context");
    } finally {
      setIsLoading(false);
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
    
    console.log("📖 [README Processing] Starting README processing...");
    console.log("📖 [README Processing] Content length:", content.length);
    console.log("📖 [README Processing] Content preview:", content.substring(0, 200) + "...");
    
    try {
      setIsProcessingReadme(true);
      console.log("📖 [README Processing] Calling API...");
      
      const res = await contextApi.processReadme(content);
      console.log("📖 [README Processing] API response:", res);
      
      if (res.success && res.data) {
        const { html, context: extracted } = res.data as any;
        console.log("📖 [README Processing] Extracted context:", extracted);
        console.log("📖 [README Processing] HTML preview length:", html?.length || 0);
        
        setReadmePreview(html);
        
        // Merge description and stories conservatively (no tech suggestions)
        if (extracted) {
          console.log("📖 [README Processing] Merging extracted data...");
          console.log("📖 [README Processing] Goal:", extracted.goal);
          console.log("📖 [README Processing] Tech stack:", extracted.tech_stack);
          console.log("📖 [README Processing] User stories:", extracted.user_stories);
          
          setContext(prev => {
            const updated = {
              ...prev,
              appDescription: extracted.goal || prev.appDescription,
              techStack: prev.techStack,
              userStories: prev.userStories && prev.userStories.trim().length > 0
                ? prev.userStories
                : (extracted.user_stories || []).map((s: any) => `- ${s.description}`).join('\n')
            };
            console.log("📖 [README Processing] Updated context:", updated);
            return updated;
          });
        } else {
          console.warn("📖 [README Processing] No extracted context found in response");
        }
      } else {
        console.error("❌ [README Processing] API failed:", res.errors);
        setError(res.errors?.join(', ') || 'Failed to process README');
      }
    } catch (e) {
      console.error("❌ [README Processing] Exception:", e);
      setError('Failed to process README');
    } finally {
      setIsProcessingReadme(false);
      console.log("📖 [README Processing] Processing complete");
    }
  };

  const generateFromProject = () => {
    console.log("🧪 [Test] Starting test generation...");
    setIsLoading(true);
    try {
      // TODO: Implement auto-detection from current project files
      console.log("🧪 [Test] Simulating project analysis...");
      
      // Simulate analysis
      setTimeout(() => {
        const testContext = {
          appDescription: "Web application generated from project analysis",
          techStack: ["React", "TypeScript", "Next.js"],
          userStories: "- User can navigate the application\n- User can interact with components\n- User can view data"
        };
        
        console.log("🧪 [Test] Setting test context:", testContext);
        setContext(prev => ({
          ...prev,
          ...testContext
        }));
        setIsLoading(false);
        console.log("🧪 [Test] Test generation complete");
      }, 2000);
    } catch (error) {
      console.error("❌ [Test] Failed to generate test context:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#f8f8f8] dark:bg-[#18181a]">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-[#e4e4e4] dark:border-[#333] bg-white dark:bg-[#1a1a1c]">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-blue-500" />
          <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
            Context Composer
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              console.log("🧪 [Test] Running comprehensive test...");
              console.log("🧪 [Test] Current context:", context);
              console.log("🧪 [Test] Current detected tech:", detected);
              console.log("🧪 [Test] Current readme preview:", readmePreview);
              
              // Test tech stack detection
              const testText = "I want to build a Next.js 15 app with React 18 and TypeScript";
              console.log("🧪 [Test] Testing tech detection with:", testText);
              const testOutcome = recommendTechFromText(testText, 0.3);
              console.log("🧪 [Test] Tech detection result:", testOutcome);
              
              // Test user story parsing
              const testStories = "As a user, I want to create tasks so that I can organize my work";
              console.log("🧪 [Test] Testing story parsing with:", testStories);
              const parsedStories = parseAndEnhanceUserStories(testStories);
              console.log("🧪 [Test] Story parsing result:", parsedStories);
            }}
            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-[#2c2c2c] text-gray-600 dark:text-gray-400"
            title="Test NLP Features"
          >
            🧪
          </button>
          <button
            onClick={generateFromProject}
            disabled={isLoading}
            className={cn(
              "p-1.5 rounded hover:bg-gray-100 dark:hover:bg-[#2c2c2c] text-gray-600 dark:text-gray-400",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            title="Auto-generate from project"
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-[#2c2c2c] text-gray-600 dark:text-gray-400"
            title="Upload README"
          >
            <Upload className="w-4 h-4" />
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
            <Code className="w-4 h-4" />
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
             console.log("📝 [User Story Parser] Parsed stories:", stories);
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
                  console.log("📖 [README Processing] Debounced auto-process on paste/input");
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
