import { X } from "lucide-react";
import { useEditorStore } from "../stores/editorStore";
import { useUnsavedChanges } from "../hooks/useUnsavedChanges";
import { cn } from "@/utils/cn";
import FileIcon from "./IDEContent/FileExplorer/components/fileIcon";

interface EditorTabsProps {
  openTabs: string[];
  activeTab: string;
  onTabSelect: (tab: string) => void;
  onTabClose: (tab: string) => void;
  onCloseAll: () => void;
}

export function EditorTabs({
  openTabs,
  activeTab,
  onTabSelect,
  onTabClose,
  onCloseAll,
}: EditorTabsProps) {
  const { isDirty } = useEditorStore();
  const { checkUnsavedChanges } = useUnsavedChanges();

  const handleTabClose = (tab: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isDirty[tab] || checkUnsavedChanges([tab])) {
      onTabClose(tab);
    }
  };

  const handleCloseAll = () => {
    const dirtyTabs = openTabs.filter((tab) => isDirty[tab]);
    if (dirtyTabs.length === 0 || checkUnsavedChanges(dirtyTabs)) {
      onCloseAll();
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    const menu = document.createElement("div");
    menu.className =
      "absolute bg-card-bg border-2 border-neon-green/30 rounded-xl shadow-2xl shadow-neon-green/25 py-2 z-50 transition-opacity duration-300";
    menu.style.left = `${e.clientX}px`;
    menu.style.top = `${e.clientY}px`;

    const closeAllButton = document.createElement("button");
    closeAllButton.className =
      "w-full px-4 py-3 text-sm text-left hover:bg-neon-green/10 hover:text-neon-green text-white transition-all duration-300 font-medium";
    closeAllButton.textContent = "Close All";
    closeAllButton.onclick = () => {
      handleCloseAll();
      document.body.removeChild(menu);
    };

    menu.appendChild(closeAllButton);
    document.body.appendChild(menu);

    const handleClickOutside = (e: MouseEvent) => {
      if (!menu.contains(e.target as Node)) {
        document.body.removeChild(menu);
      }
    };

    document.addEventListener("click", handleClickOutside, { once: true });
  };

  return (
    <div
      className="bg-dark-bg dark:bg-darker-bg flex items-center border-b-2 border-neon-green/20 overflow-x-auto scrollbar-thin scrollbar-thumb-neon-green/50 scrollbar-track-transparent"
      onContextMenu={handleContextMenu}
      role="tablist"
      aria-label="Open editor tabs"
    >
      {openTabs.map((tab) => (
        <div
          key={tab}
          role="tab"
          aria-selected={activeTab === tab}
          tabIndex={activeTab === tab ? 0 : -1}
          className={cn(
            "group relative px-4 py-2.5 flex items-center space-x-3 cursor-pointer border-r-2 border-neon-green/20 min-w-[140px] max-w-[220px] transition-all duration-300 ease-in-out",
            activeTab === tab
              ? "bg-card-bg text-neon-green before:absolute before:bottom-0 before:left-0 before:w-full before:h-1 before:bg-neon-green shadow-lg shadow-neon-green/25"
              : "hover:bg-neon-green/10 text-gray-400 hover:text-neon-cyan border-r-2 border-neon-green/10"
          )}
          onClick={() => onTabSelect(tab)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              onTabSelect(tab);
            }
          }}
        >
          <div className="flex-shrink-0">
            <FileIcon fileName={tab} />
          </div>
          <span className="flex-1 text-sm truncate font-medium">
            {tab}
            {isDirty[tab] && (
              <span className="ml-2 inline-block w-2 h-2 rounded-full bg-neon-green animate-pulse transition-all duration-200" />
            )}
          </span>
          <button
            className={cn(
              "flex items-center justify-center w-6 h-6 rounded-lg transition-all duration-300",
              "opacity-0 group-hover:opacity-100",
              "hover:bg-neon-green/20 hover:text-neon-green active:bg-neon-green/30",
              "focus:outline-none focus:ring-2 focus:ring-neon-green/50 focus:opacity-100 transform hover:scale-110"
            )}
            onClick={(e) => handleTabClose(tab, e)}
            aria-label={`Close ${tab}`}
            title={`Close ${tab}`}
          >
            <X className="w-4 h-4 text-gray-400 group-hover:text-neon-green" />
          </button>
        </div>
      ))}
    </div>
  );
}
