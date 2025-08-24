import { Tooltip } from "./Tooltip";
import { cn } from "@/utils/cn";

// Custom SVG Icons
const FilesIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
  </svg>
);

const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const TerminalIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const GithubIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
  </svg>
);

interface ActivityBarProps {
  activeView: "files" | "search" | "context" | "observer" | "fixer";
  showTerminal: boolean;
  onViewChange: (view: "files" | "search" | "context" | "observer" | "fixer") => void;
  onToggleTerminal: () => void;
}

export function ActivityBar({
  activeView,
  onViewChange,
  onToggleTerminal,
  showTerminal
}: ActivityBarProps) {
  // GitHub 仓库链接
  const handleGithubClick = () => {
            window.open('https://github.com/contexer-dev/contexer', '_blank');
  };

  return (
    <div className="w-14 bg-dark-bg dark:bg-darker-bg flex flex-col items-center py-3 border-r-2 border-neon-green/20">
      <Tooltip content="File Explorer" side="right">
        <button
          aria-label="File Explorer"
          className={cn(
            "p-2 rounded-xl mb-3 transition-all duration-300 relative group transform hover:scale-110",
            activeView === "files"
              ? "bg-neon-green/20 text-neon-green border-2 border-neon-green/50 shadow-lg shadow-neon-green/25"
              : "text-gray-400 hover:text-neon-green hover:bg-neon-green/10 border-2 border-transparent hover:border-neon-green/30",
            activeView === "files" &&
              "before:absolute before:left-0 before:top-[20%] before:h-[60%] before:w-1 before:bg-neon-green before:-ml-3 before:rounded-r-full"
          )}
          onClick={() => onViewChange("files")}
        >
          <FilesIcon />
        </button>
      </Tooltip>

      <Tooltip content="Search" side="right">
        <button
          aria-label="Search"
          className={cn(
            "p-2 rounded-xl mb-3 transition-all duration-300 relative group transform hover:scale-110",
            activeView === "search"
              ? "bg-neon-green/20 text-neon-green border-2 border-neon-green/50 shadow-lg shadow-neon-green/25"
              : "text-gray-400 hover:text-neon-green hover:bg-neon-green/10 border-2 border-transparent hover:border-neon-green/30",
            activeView === "search" &&
              "before:absolute before:left-0 before:top-[20%] before:h-[60%] before:w-1 before:bg-neon-green before:-ml-3 before:rounded-r-full"
          )}
          onClick={() => onViewChange("search")}
        >
          <SearchIcon />
        </button>
      </Tooltip>

      {/* Top-level nav now controls these features; hide duplicates in activity bar */}

      <div className="flex-grow" />

      <Tooltip content="Terminal" side="right">
        <button
          aria-label="Terminal"
          className={cn(
            "p-2 opacity-70 rounded-xl mb-3 transition-all duration-300 relative group transform hover:scale-110",
            showTerminal
              ? "bg-neon-green/20 text-neon-green border-2 border-neon-green/50 shadow-lg shadow-neon-green/25"
              : "text-gray-400 hover:text-neon-green hover:bg-neon-green/10 border-2 border-transparent hover:border-neon-green/30",
              showTerminal &&
              "before:absolute before:left-0 before:top-[20%] before:h-[60%] before:w-1 before:bg-neon-green before:-ml-3 before:rounded-r-full"
          )}
          onClick={onToggleTerminal}
        >
          <TerminalIcon />
        </button>
      </Tooltip>

      <Tooltip content="GitHub" side="right">
        <button
          aria-label="GitHub"
          onClick={handleGithubClick}
          className="p-2 rounded-xl mb-3 transition-all duration-300 text-gray-400 hover:text-neon-green hover:bg-neon-green/10 border-2 border-transparent hover:border-neon-green/30 transform hover:scale-110"
        >
          <GithubIcon />
        </button>
      </Tooltip>
    </div>
  );
}
