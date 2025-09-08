import PreviewIframe from "./PreviewIframe";
import { useState } from "react";
import { useFileStore } from "./WeIde/stores/fileStore";
import WeIde from "./WeIde";
import useTerminalStore from "@/stores/terminalSlice";
import WeAPI from "./WeAPI";
import { useTranslation } from "react-i18next";
import { ContextComposer } from "./WeIde/components/IDEContent/ContextComposer";
import { ErrorFixer } from "./WeIde/components/IDEContent/ErrorFixer";
import { VisualObserver } from "./WeIde/components/VisualObserver";
import { useFeatureNav } from "@/stores/featureNavSlice";

// Feature Icons
const ContextIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const FixerIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
);

const VisualIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const ipcRenderer = window?.electron?.ipcRenderer;

// Find WeChat DevTools path
export async function findWeChatDevToolsPath() {
  try {
    // Get operating system type through IPC call to main process
      const platform = await ipcRenderer?.invoke?.("node-container:platform");
    console.log(platform, "platform");
    if (platform === "win32") {
      // Windows platform
      const defaultPath =
        (typeof process !== 'undefined' && process.env?.Path ? process.env.Path : '').split(";")
          .find((value) => {
            value.includes("WeChat Web DevTools");
          })
          ?.split("WeChat Web DevTools")[0] + "WeChat Web DevTools/cli.bat";

      try {
        // Check if file exists
        await ipcRenderer?.invoke(
          "node-container:check-file-exists",
          defaultPath
        );
        return defaultPath;
      } catch {
        // If default path doesn't exist, use where command to find
        const result = await ipcRenderer?.invoke(
          "node-container:exec-command",
          "where cli.bat"
        );
        if (!result?.trim()) {
          throw new Error("WeChat DevTools path not found");
        }
        return result.trim();
      }
    } else if (platform === "darwin") {
      // macOS platform
      const defaultPath =
        "/Applications/wechatwebdevtools.app/Contents/MacOS/cli";

      try {
        // Check if file exists
        await ipcRenderer?.invoke(
          "node-container:check-file-exists",
          defaultPath
        );
        return defaultPath;
      } catch {
        // If default path doesn't exist, use find command to search globally
        const result = await ipcRenderer?.invoke(
          "node-container:exec-command",
          'find / -name "cli" -type f 2>/dev/null'
        );

        const paths = result
          ?.split("\n")
          ?.filter((path: string) => path.includes("wechatwebdevtools.app"));
        if (paths && paths.length > 0) {
          return paths[0];
        }
        throw new Error("WeChat DevTools path not found");
      }
    } else {
      throw new Error("Unsupported operating system");
    }
  } catch (error) {
    throw new Error(`Failed to find WeChat DevTools: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
const EditorPreviewTabs: React.FC = () => {
  const { getFiles } = useFileStore();
  const [showIframe, setShowIframe] = useState<string>("editor");
  const [frameStyleMap, setFrameStyleMap] = useState<Record<string, string>>({
    editor: "translate-x-0 opacity-100",
    weApi: "translate-x-full opacity-100",
    preview: "translate-x-full opacity-100",
    diff: "translate-x-full opacity-100",
    context: "translate-x-full opacity-100",
    fixer: "translate-x-full opacity-100",
    visual: "translate-x-full opacity-100"
  });
  const { t } = useTranslation();

  const isMinPrograme = getFiles().includes("app.json");

  const openWeChatEditor = async () => {
    if (!window.electron) {
      console.error("Electron not available");
      return;
    }

    try {
      const cliPath = await findWeChatDevToolsPath();   
      if (getFiles().includes("app.json") || getFiles().includes("miniprogram/app.json")) {
        const defaultRoot = await ipcRenderer?.invoke(
          "node-container:get-project-root"
        );
        const command = `"${cliPath}" -o "${defaultRoot}" --auto-port`;
        await ipcRenderer?.invoke("node-container:exec-command", command);
      }
    } catch (error) {
      console.error("Failed to open WeChat editor:", error);
    }
  };

  const onToggle = (name: string) => {
    setShowIframe(name);
    const newFrameStyleMap = { ...frameStyleMap };
    Object.keys(newFrameStyleMap).forEach((key) => {
      newFrameStyleMap[key] = "translate-x-full opacity-100";
    });
    newFrameStyleMap[name] = "translate-x-0 opacity-100";
    setFrameStyleMap(newFrameStyleMap);
  };

  return (
    <div className="m-3 flex-1 relative flex flex-col bg-card-bg rounded-2xl border-2 border-neon-green/20 shadow-lg shadow-neon-green/10 overflow-hidden">
      <div className="flex h-12 gap-1 bg-dark-bg pl-0 pt-1 rounded-t-2xl justify-between border-b-2 border-neon-green/20">
        <div className="flex-1 flex">
          <TabButton
            active={showIframe == "editor" || !showIframe}
            onClick={() => {
              onToggle("editor");
            }}
            icon={<EditorIcon />}
            label={t("editor.editor")}
          />
          <TabButton
            active={showIframe == "preview"}
            onClick={() => {
              onToggle("preview");
              openWeChatEditor();
            }}
            icon={<PreviewIcon />}
            label={t("editor.preview")}
          />
          {/* <TabButton
            active={showIframe == "diff"}
            onClick={() => {
              onToggle("diff");
            }}
            icon={<APITestIcon />}
            label={t("editor.diff")}
          /> */}
          <TabButton
            active={showIframe == "weApi"}
            onClick={() => {
              onToggle("weApi");
            }}
            icon={<APITestIcon />}
            label={t("editor.apiTest")}
          />
          
          {/* Feature Tabs */}
          <TabButton
            active={showIframe == "context"}
            onClick={() => {
              onToggle("context");
            }}
            icon={<ContextIcon />}
            label="Context"
          />
          <TabButton
            active={showIframe == "fixer"}
            onClick={() => {
              onToggle("fixer");
            }}
            icon={<FixerIcon />}
            label="Error Fixer"
          />
          <TabButton
            active={showIframe == "visual"}
            onClick={() => {
              onToggle("visual");
            }}
            icon={<VisualIcon />}
            label="Visual Observer"
          />
          
        </div>

        {/* <div className="flex items-center gap-2 mr-2">
          {(window as any).electron && <OpenDirectoryButton />}
        </div> */}
      </div>

      <div className="flex-1 relative overflow-hidden">
        <div
          className={`
          absolute inset-0
          transform transition-all duration-500 ease-in-out
      ${frameStyleMap["editor"]}
        `}
        >
          <WeIde /> 
        </div>
        <div
          className={`
          absolute inset-0
          transform transition-all duration-500 ease-in-out
      ${frameStyleMap["preview"]}
        `}
        >
          <PreviewIframe
            isMinPrograme={isMinPrograme}
            setShowIframe={(show) => {
              onToggle("preview");
              setShowIframe(show ? "preview" : "");
            }}
          />
        </div>
        <div
          className={`
          absolute inset-0
          transform transition-all duration-500 ease-in-out
          ${frameStyleMap["weApi"]}
        `}
        >
          <WeAPI />
        </div>
        
        {/* Feature Content Areas */}
        <div
          className={`
          absolute inset-0
          transform transition-all duration-500 ease-in-out
          ${frameStyleMap["context"]}
        `}
        >
          <ContextComposer />
        </div>
        <div
          className={`
          absolute inset-0
          transform transition-all duration-500 ease-in-out
          ${frameStyleMap["fixer"]}
        `}
        >
          <ErrorFixer />
        </div>
        <div
          className={`
          absolute inset-0
          transform transition-all duration-500 ease-in-out
          ${frameStyleMap["visual"]}
        `}
        >
          <VisualObserver />
        </div>
         {/* <div
          className={`
          absolute inset-0
          transform transition-all duration-500 ease-in-out
          ${frameStyleMap["diff"]}
        `}
        >
           <Diff oldFiles={oldFiles} newFiles={files} />
        </div> */}
      </div>
    </div>
  );
};

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const TabButton: React.FC<TabButtonProps> = ({
  active,
  onClick,
  icon,
  label,
}) => (
  <div
    onClick={onClick}
    className={`
      px-6 cursor-pointer flex items-center gap-3 text-sm rounded-t-xl
      transition-all duration-300 ease-in-out min-w-[120px] h-11
      hover:bg-neon-green/10 hover:text-neon-green hover:scale-105
      ${
        active
          ? "bg-card-bg text-neon-green font-semibold border-t-2 border-x-2 border-neon-green/50 shadow-lg shadow-neon-green/25"
          : "bg-transparent text-gray-400 hover:text-neon-cyan"
      }
    `}
  >
    {icon}
    <span className="translate font-medium">{label}</span>
  </div>
);

const EditorIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3 3L21 3V21H3L3 3Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M7 7L17 7"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M7 12L17 12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const PreviewIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21Z"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M12 7L12 17"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M7 12L17 12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);
const APITestIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* API text box */}
    <rect
      x="3"
      y="6"
      width="18"
      height="12"
      rx="2"
      stroke="currentColor"
      strokeWidth="2"
    />
    {/* Left bracket { */}
    <path
      d="M8 10L7 12L8 14"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Right bracket } */}
    <path
      d="M16 10L17 12L16 14"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Middle dot */}
    <circle cx="12" cy="12" r="1" fill="currentColor" />
  </svg>
);

export default EditorPreviewTabs;
