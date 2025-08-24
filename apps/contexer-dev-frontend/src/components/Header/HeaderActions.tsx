import { useFileStore } from "../WeIde/stores/fileStore";
import JSZip from "jszip";
import { OpenDirectoryButton } from "../OpenDirectoryButton";
import { useTranslation } from "react-i18next";
import useChatModeStore from "@/stores/chatModeSlice";
import { ChatMode } from "@/types/chat";
import useTerminalStore from "@/stores/terminalSlice";
import { getWebContainerInstance } from "../WeIde/services/webcontainer";
import { useState } from "react";
import { toast } from "react-toastify";


  // Add a helper function to recursively get files
const getAllFiles = async (webcontainer: any, dirPath: string, zip: JSZip, baseDir: string = '') => {
  try {
    const entries = await webcontainer.fs.readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = `${dirPath}/${entry.name}`;
      try {
        if (entry.isDirectory()) {
          // If it's a directory, handle recursively
          await getAllFiles(webcontainer, fullPath, zip, `${baseDir}${entry.name}/`);
        } else {
          // If it's a file, read content and add to zip
          const content = await webcontainer.fs.readFile(fullPath);
          const relativePath = `${baseDir}${entry.name}`;
          console.log('Adding file:', relativePath);
          zip.file(relativePath, content);
        }
      } catch (error) {
        console.error(`处理文件 ${entry.name} 失败:`, error);
      }
    }
  } catch (error) {
    console.error(`读取目录 ${dirPath} 失败:`, error);
    
    // 如果不支持 withFileTypes，尝试普通的 readdir
    const files = await webcontainer.fs.readdir(dirPath);
    
    for (const file of files) {
      const fullPath = `${dirPath}/${file}`;
      try {
        // 尝试读取文件内容
        const content = await webcontainer.fs.readFile(fullPath);
        const relativePath = `${baseDir}${file}`;
        console.log('Adding file:', relativePath);
        zip.file(relativePath, content);
      } catch (error) {
        // 如果读取失败，可能是目录，尝试递归
        try {
          await getAllFiles(webcontainer, fullPath, zip, `${baseDir}${file}/`);
        } catch (dirError) {
          console.error(`处理文件/目录 ${file} 失败:`, dirError);
        }
      }
    }
  }
};

export function HeaderActions() {
  const { files } = useFileStore();
  const { t } = useTranslation();
  const { getTerminal, newTerminal, getEndTerminal } = useTerminalStore();
  const { mode } = useChatModeStore();
  const [showModal, setShowModal] = useState(false);
  const [deployUrl, setDeployUrl] = useState("");
  const [isDeploying, setIsDeploying] = useState(false);

  const handleDownload = async () => {
    try {
      const zip = new JSZip();
      Object.entries(files).forEach(([path, content]) => {
        // 打包dist目录
        zip.file(path, content as string);
      });
      const blob = await zip.generateAsync({ type: "blob" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "project.zip";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("下载失败:", error);
    }
  };
  const publish = async () => {
    setIsDeploying(true);
    const API_BASE = (import.meta as any).env?.VITE_APP_BASE_URL;
    
    try {
      const webcontainer = await getWebContainerInstance();
      
      newTerminal(async () => {
        const res = await getEndTerminal().executeCommand("npm run build");
        if (res.exitCode === 127) {
          await getEndTerminal().executeCommand("npm install");
          await getEndTerminal().executeCommand("npm run build");
        }

        try {
          const zip = new JSZip();
          
          // 使用新的递归函数获取所有文件
          await getAllFiles(webcontainer, "dist", zip);

          // 生成并下载 zip 文件
          const blob = await zip.generateAsync({ type: "blob" });
          const formData = new FormData();
          formData.append('file', new File([blob], 'dist.zip', { type: 'application/zip' }));
          
          // 发送请求
          const response = await fetch(`${API_BASE}/api/deploy`, {
            method: "POST",
            body: formData,
          });
          const data = await response.json();
          
          if(data.success){
            setDeployUrl(data.url);
            setShowModal(true);
            toast.success(t('header.deploySuccess'));
          }
        } catch (error) {
          console.error("读取 dist 目录失败:", error);
          toast.error(t('header.error.deploy_failed'));
        } finally {
          setIsDeploying(false);
        }
      });
    } catch (error) {
      console.error("部署失败:", error);
      toast.error(t('header.error.deploy_failed'));
      setIsDeploying(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(deployUrl);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {mode === ChatMode.Builder && (
        <div className="flex items-center gap-3">
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-white bg-card-bg border-2 border-gray-700 hover:border-neon-green/50 hover:bg-neon-green/10 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-neon-green/25"
          >
            <svg
              className="w-4 h-4 text-neon-green"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            <span className="font-medium">{t("header.download")}</span>
          </button>
          {!window.electron && (
            <button
              onClick={publish}
              disabled={isDeploying}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg ${
                isDeploying 
                  ? 'bg-gradient-to-r from-neon-cyan/50 to-neon-blue/50 text-white opacity-75 cursor-not-allowed'
                  : 'bg-gradient-to-r from-neon-green to-neon-blue hover:from-neon-green/90 hover:to-neon-blue/90 text-black shadow-neon-green/25 hover:shadow-neon-green/50'
              }`}
            >
              {isDeploying ? (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              )}
              <span>{isDeploying ? t('header.deploying') : t('header.deploy')}</span>
            </button>
          )}
          {window.electron && <OpenDirectoryButton />}
        </div>
      )}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card-bg border-2 border-neon-green/30 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl shadow-neon-green/25 transform transition-all animate-fade-in-up">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4 animate-bounce">🚀</div>
              <h3 className="text-2xl font-bold text-neon-green mb-2">
                {t('header.deploySuccess')}
              </h3>
              <p className="text-gray-300">
                {t('header.deployToCloud')}
              </p>
            </div>
            
            <div className="bg-dark-bg border border-neon-green/20 rounded-xl p-4 mb-6">
              <p className="text-sm text-neon-cyan mb-3 font-medium">
                {t('header.accessLink')}
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={deployUrl}
                  readOnly
                  className="flex-1 p-3 text-sm border-2 border-gray-700 rounded-lg bg-dark-bg text-white focus:border-neon-green focus:outline-none transition-all duration-300"
                />
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-3 bg-neon-green/20 border-2 border-neon-green/50 text-neon-green rounded-lg hover:bg-neon-green hover:text-black transition-all duration-300 flex items-center gap-2 transform hover:scale-105"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  {t('header.copy')}
                </button>
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-3 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-xl transition-all duration-300 border-2 border-gray-700 hover:border-neon-green/30"
              >
                {t('header.close')}
              </button>
              <button
                onClick={() => window.open(deployUrl, '_blank')}
                className="px-6 py-3 bg-gradient-to-r from-neon-green to-neon-blue text-black font-medium rounded-xl hover:from-neon-green/90 hover:to-neon-blue/90 transition-all duration-300 flex items-center gap-2 shadow-lg shadow-neon-green/25 hover:shadow-neon-green/50 transform hover:scale-105"
              >
                <span>{t('header.visitSite')}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

