import React, { useState, useRef, useEffect } from "react";
import { Save, Upload, RefreshCw, BookOpen, Code, FileText } from "lucide-react";
import { cn } from "@/utils/cn";
import { contextApi, type Project } from "@/services/contextApi";
import useUserStore from "@/stores/userSlice";
import { convertLegacyToNewContext, convertNewToLegacyContext } from "@/types/context";

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

  const handleTechStackToggle = (tech: string) => {
    setContext(prev => ({
      ...prev,
      techStack: prev.techStack.includes(tech)
        ? prev.techStack.filter(t => t !== tech)
        : [...prev.techStack, tech]
    }));
  };

  // Load existing project or create new one
  useEffect(() => {
    const loadOrCreateProject = async () => {
      if (!isAuthenticated || !token) return;

      setIsLoading(true);
      setError(null);

      try {
        // Try to get existing projects
        const projectsResponse = await contextApi.getProjects();
        
        if (projectsResponse.success && projectsResponse.data && projectsResponse.data.length > 0) {
          // Use the first/most recent project
          const project = projectsResponse.data[0];
          setCurrentProject(project);
          
          // Convert backend context to legacy format for UI
          if (project.context) {
            const legacyContext = convertNewToLegacyContext(project.context);
            setContext(legacyContext);
          }
        } else {
          // No projects exist, will create one on first save
          console.log("No existing projects found");
        }
      } catch (error) {
        console.error("Failed to load projects:", error);
        setError("Failed to load project data");
      } finally {
        setIsLoading(false);
      }
    };

    loadOrCreateProject();
  }, [isAuthenticated, token]);

  const handleSave = async () => {
    if (!isAuthenticated || !token) {
      setError("Please log in to save your context");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Convert legacy context to new format
      const newContext = convertLegacyToNewContext(context);
      
      let response;
      
      // Derive a safe project name (UI may contain long description)
      const deriveName = (raw: string) => {
        const base = (raw || '').split('\n')[0].trim();
        if (!base) return 'New Project';
        return base.length > 120 ? base.slice(0, 120) + '…' : base;
      };

      if (currentProject) {
        // Update existing project
        response = await contextApi.saveContext(currentProject.id, newContext);
      } else {
        // Create new project
        response = await contextApi.createProject({
          name: deriveName(context.appDescription),
          description: context.appDescription?.trim() || "Created from Context Composer",
          context: newContext
        });
      }

      if (response.success && response.data) {
        setCurrentProject(response.data);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
        console.log("Context saved successfully!");
      } else {
        setError(response.errors?.join(", ") || "Failed to save context");
      }
    } catch (error) {
      console.error("Failed to save context:", error);
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
      };
      reader.readAsText(file);
    }
  };

  const generateFromProject = () => {
    setIsLoading(true);
    try {
      // TODO: Implement auto-detection from current project files
      console.log("Generating context from current project...");
      
      // Simulate analysis
      setTimeout(() => {
        setContext(prev => ({
          ...prev,
          appDescription: "Web application generated from project analysis",
          techStack: ["React", "TypeScript", "Next.js"],
          userStories: "- User can navigate the application\n- User can interact with components\n- User can view data"
        }));
        setIsLoading(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to generate context:", error);
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
        </div>

        {/* README Content */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            README Content
          </label>
          <textarea
            value={context.readme}
            onChange={(e) => setContext(prev => ({ ...prev, readme: e.target.value }))}
            placeholder="Paste or upload your README.md content here..."
            className="w-full h-32 p-3 text-sm border border-gray-200 dark:border-gray-600 rounded-lg 
                     bg-white dark:bg-[#1a1a1c] text-gray-900 dark:text-gray-100
                     focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
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
