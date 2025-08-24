import React, { useEffect, useRef, useState } from "react";
import { Terminal as TerminalIcon, X } from "lucide-react";
import weTerminal from "./utils/weTerminal"; // 导入 Terminal 类
import useTerminalStore from "../../../../stores/terminalSlice";
import "xterm/css/xterm.css";
import "./styles.css";
import { cn } from "@/utils/cn";
import { eventEmitter } from "@/components/AiChat/utils/EventEmitter";
import { use } from "i18next";
import useChatModeStore from "@/stores/chatModeSlice";
import useThemeStore from "@/stores/themeSlice";
import useChatStore from "@/stores/chatSlice";
import { useFileStore } from "../../stores/fileStore";

// Custom Plus Icon
const PlusIcon = () => (
  <svg className="w-4 h-4 cursor-pointer text-gray-400 hover:text-neon-green transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

interface TerminalItem {
  processId: string | null; // 自增 id
  containerRef: React.RefObject<HTMLDivElement> | null; // 终端的容器
  terminal: weTerminal; // Terminal 类实例
}

// 终端的选项卡
function TerminalTab({
  selectProcessId,
  changeTerminalTab,
  onClose,
  processId,
  terminal,
}: {
  selectProcessId: string;
  changeTerminalTab: () => void;
  onClose: () => void;
  processId: string;
  terminal: weTerminal;
}) {
  const [isReady, setIsReady] = useState(terminal.getIsReady());

  useEffect(() => {
    setIsReady(terminal.getIsReady());
  }, [terminal.getIsReady()]);

  return (
    <div
      className={cn(
        "flex items-center px-4 py-2 cursor-pointer transition-all duration-300",
        "border-b-2 border-neon-green/20",
        processId == selectProcessId
          ? "bg-card-bg text-neon-green border-b-2 border-neon-green shadow-lg shadow-neon-green/25"
          : "bg-dark-bg text-gray-400 hover:bg-neon-green/10 hover:text-neon-cyan border-b-2 border-transparent hover:border-neon-green/30",
        processId,
        selectProcessId
      )}
      onClick={changeTerminalTab}
    >
      {/* 切换至当前终端的按钮 */}
      <div className="flex items-center">
        <TerminalIcon
          className={cn(
            "w-4 h-4 mr-2 transition-colors",
            isReady
              ? "text-neon-green"
              : "text-neon-cyan"
          )}
        />
        <span
          className={cn(
            "text-sm font-medium",
            processId == selectProcessId
              ? "text-neon-green"
              : "text-gray-400"
          )}
        >
          {/* Terminal {!isReady && '(Initializing...)'} */}
          Terminal
        </span>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation()
          onClose()

        }}
        className={cn(
          "p-1.5 rounded-lg transition-all duration-300 ml-auto transform hover:scale-110",
          "hover:bg-neon-green/20 hover:text-neon-green",
          "group"
        )}
      >
        <X
          className={cn(
            "w-4 h-4",
            "text-gray-400",
            "group-hover:text-neon-green"
          )}
        />
      </button>
    </div>
  );
}

let isInit = false;

// 终端本体
function TerminalItem({
  containerRef,
  processId,
  selectProcessId,
  terminal,
}: {
  containerRef: React.RefObject<HTMLDivElement> | null;
  processId: string | null;
  selectProcessId: string;
  terminal: weTerminal;
}) {
  const {isDarkMode} = useThemeStore()

  const { addError } = useFileStore();

  useEffect(() => {
    // 获取当前主题
    if (containerRef?.current && processId) {
      terminal.initialize(containerRef.current, processId, addError);
    }
  }, [containerRef, processId]);
  
  useEffect(()=>{
    terminal.setTheme(isDarkMode)
  },[isDarkMode])
  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-hidden terminal-container bg-dark-bg dark:bg-darker-bg px-3 py-2"
      style={{
        display: processId == selectProcessId ? "block" : "none",
      }}
    />
  );
}

export function Terminal() {
  const { newTerminal, terminals, addTerminal, removeTerminal } =
    useTerminalStore();

  const [selectProcessId, setSelectProcessId] = useState<string | null>(null);
  const [items, setItems] = useState<TerminalItem[]>([]);
  const [updateCount, setUpdateCount] = useState(0);

  // 初始化终端列表（其实不会初始化终端，只是用作渲染 显示终端）

  useEffect(() => {
    if (!isInit) {
      newTerminal();
      isInit = true;
    }
    const update = (processId: string) => {
      setSelectProcessId(processId);
      setUpdateCount((num) => num + 1);
    };
    eventEmitter.on("terminal:update", update);
    return () => {
      eventEmitter.removeListener("terminal:update", update);
    };
  }, []);

  useEffect(() => {
    const newItems = Array.from(terminals).map(([key, terminal]) => ({
      processId: key,
      containerRef: terminal.getContainerRef(),
      terminal: terminal,
    }));
    setItems(newItems);
  }, [terminals.size, updateCount]);

  // Handle close event
  const closeTerminal = (item: TerminalItem) => {
    // Destroy terminal
    if (item.processId) {
      removeTerminal(item.processId);
    }

    // Update terminal list
    const newItems = items.filter((i) => item.processId !== i.processId);
    // setItems(newItems);

    // If the closed terminal is the currently selected one, select the previous terminal
    if (item.processId == selectProcessId) {
      const prevItem = newItems[newItems.length - 1]; // Select the last item
  
      if (prevItem) {
        setSelectProcessId(prevItem.processId);
      } else {

        setSelectProcessId(null); // If no terminals left, set to null
      }
    }
  };

  // Add a terminal
  const addTerminalHandle = async () => {
    newTerminal((t: weTerminal) => {
      setSelectProcessId(t.getProcessId());
    });
  };

  // 切换终端
  const changeTerminalTab = (item: TerminalItem) => {
    setSelectProcessId(item.processId);
  };

  return (
    <div className={`w-full h-full flex flex-col`}>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: "4px",
          padding: "4px 8px",
        }}
      >
        {items.map((item) => {
          if (!item.processId) return null;
          return (
            <TerminalTab
              key={item.processId}
              selectProcessId={selectProcessId || ''}
              changeTerminalTab={() => changeTerminalTab(item)}
              onClose={() => closeTerminal(item)}
              processId={item.processId}
              terminal={item.terminal}
            />
          );
        })}

        <button onClick={addTerminalHandle} className="p-1.5 rounded-lg transition-all duration-300 transform hover:scale-110 hover:bg-neon-green/20">
          <PlusIcon />
        </button>
      </div>

      {/* 终端的本体 */}
      {items.map((item) => (
        <TerminalItem
          key={item.processId}
          containerRef={item.containerRef}
          processId={item.processId}
          selectProcessId={selectProcessId || ''}
          terminal={item.terminal}
        />
      ))}
    </div>
  );
}
