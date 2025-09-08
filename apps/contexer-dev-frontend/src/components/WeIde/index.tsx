import { useState, useEffect, useRef } from "react";
import { ActivityBar } from "./components/ActivityBar";
import { Terminal } from "./components/Terminal"
import { Editor } from "./components/Editor"
import { EditorTabs } from "./components/EditorTabs"
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels"
import { useEditorStore } from "./stores/editorStore"
import { FileExplorer } from "./components/IDEContent/FileExplorer"
import { Search } from "./components/IDEContent/Search"
import { ContextComposer } from "./components/IDEContent/ContextComposer"
import { ErrorFixer } from "./components/IDEContent/ErrorFixer"
import { TeamExample } from "../Role"
import { useProjectInit } from "../../hooks/useProjectInit"
import { useChatProjectSync } from "../../hooks/useChatProjectSync"
import { useSeamlessStateManagement } from "../../hooks/useSeamlessStateManagement"
import { useChatStatePersistence } from "../../hooks/useChatStatePersistence"
import useProjectStore from "../../stores/projectSlice"

export default function WeIde() {
  const [activeTab, setActiveTab] = useState("");
  const [showTerminal, setShowTerminal] = useState(true);
  const [openTabs, setOpenTabs] = useState<string[]>([]);
  const { setDirty } = useEditorStore();
  const { currentProject } = useProjectStore();
  const [activeView, setActiveView] = useState<"files" | "search" | "context" | "fixer">("files");
  
  // Handle view changes and emit events
  const handleViewChange = (view: "files" | "search" | "context" | "fixer") => {
    setActiveView(view);
    // Emit custom event for view change
    const event = new CustomEvent('view:change', { detail: { view } });
    window.dispatchEvent(event);
  };
  const [currentLine, setCurrentLine] = useState<number | undefined>();
  
  // Initialize project state
  useProjectInit();
  
  // Sync chat selection with project selection
  useChatProjectSync();
  
  // Seamless state management between context and builder
  useSeamlessStateManagement();
  
  // Chat state persistence
  useChatStatePersistence();

  useEffect(() => {
    const handleEmit = (
      event: CustomEvent<{ path: string; line?: number }>
    ) => {
      handleFileSelectAiFile(event.detail.path, event.detail.line);
    };

    window.addEventListener("openFile", handleEmit as EventListener);
    return () => {
      window.removeEventListener("openFile", handleEmit as EventListener);
    };
  }, [openTabs]);


  const handleFileSelectAiFile = (path: string, line?: number) => {
    setActiveTab(path);
    setCurrentLine(line);
    if (!openTabs.includes(path)) {
      const newTabs = [...openTabs];
      newTabs[0] = path;
      setOpenTabs(newTabs);
    }
    setDirty(path, false);
  };

  const handleFileSelect = (path: string, line?: number) => {
    setActiveTab(path);
    setCurrentLine(line);
    if (!openTabs.includes(path)) {
      setOpenTabs([...openTabs, path]);
    }
  };

  const handleTabClose = (tab: string) => {
    const newTabs = openTabs.filter((t) => t !== tab);
    setOpenTabs(newTabs);
    if (activeTab === tab && newTabs.length > 0) {
      setActiveTab(newTabs[0]);
    }
  };

  const handleCloseAll = () => {
    setOpenTabs([]);
    setActiveTab("");
  };

  return (
    <div
      style={{
        borderRadius: "0px",
        borderTopRightRadius: "0px",
        borderTopLeftRadius: "0px",
      }}
      className="h-full w-full bg-dark-bg dark:bg-darker-bg text-white flex overflow-hidden border-2 border-neon-green/20"
    >
      {/* Activity Bar (Icon Bar) */}
      <ActivityBar
        activeView={activeView}
        onViewChange={handleViewChange}
        onToggleTerminal={() => setShowTerminal(!showTerminal)}
        showTerminal={showTerminal}
      />



      <PanelGroup direction="horizontal">
        {/* File List */}
        <Panel
          defaultSize={25}
          minSize={16}
          maxSize={30}
          className="flex-shrink-0 border-r-2 border-neon-green/20 bg-card-bg"
        >
          {activeView === "files" && <FileExplorer onFileSelect={handleFileSelect} />}
          {activeView === "search" && <Search onFileSelect={handleFileSelect} />}
          {activeView === "context" && <ContextComposer onFileSelect={handleFileSelect} />}
          {activeView === "fixer" && <ErrorFixer onFileSelect={handleFileSelect} />}
        </Panel>

        {/* File List Drag Handle */}
        <PanelResizeHandle className="w-1 bg-neon-green/30 hover:bg-neon-green/50 transition-all duration-300 cursor-col-resize hover:w-2" />
      
        {/* Coding Area and Terminal */}
        <Panel className="min-w-0 ml-[-1px]">
          <PanelGroup direction="vertical">
            {/* Coding Area */}
            <Panel className="flex flex-col min-h-0">
              <EditorTabs
                openTabs={openTabs}
                activeTab={activeTab}
                onTabSelect={setActiveTab}
                onTabClose={handleTabClose}
                onCloseAll={handleCloseAll}
              />
              <div className="flex-1 overflow-hidden bg-dark-bg dark:bg-darker-bg">
                {activeTab && (
                  <Editor fileName={activeTab} initialLine={currentLine} />
                )}
              </div>
            </Panel>

            {/* Terminal area */}
       
              <>
                {/* Vertical drag area */}
                <PanelResizeHandle
                  style={{ display: showTerminal ? "flex" : "none" }}
                  className="h-1 hover:bg-neon-green/50 dark:hover:bg-neon-green/50 transition-all duration-300 cursor-row-resize hover:h-2"
                />

                {/* Create container for terminal */}
                <Panel
                  defaultSize={30}
                  minSize={10}
                  maxSize={80}
                  style={{
                    display: showTerminal ? "flex" : "none",
                    flexDirection: "column",
                  }}
                  className="bg-card-bg dark:bg-card-bg border-t-2 border-neon-green/20"
                >
                  {/* Terminal icon + Terminal body */}
                  <Terminal />
                </Panel>
              </>
          
          </PanelGroup>
        </Panel>
      </PanelGroup>
    </div>
  );
}
