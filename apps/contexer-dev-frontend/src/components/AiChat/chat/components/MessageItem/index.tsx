import React, { useState, useCallback, useMemo, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { ArtifactView } from "../ArtifactView";
import { ImageGrid } from "../ImageGrid";
import { Message } from "ai";
import { memo } from "react";
import { ThinkingAnimation } from "../ThinkingAnimation";

import classNames from "classnames";
import useUserStore from "../../../../../stores/userSlice";
import useThemeStore from "@/stores/themeSlice";
import hljs from "highlight.js";
import remarkGfm from "remark-gfm";
import "highlight.js/styles/github-dark.css"; // Dark theme
import { message } from "antd";
import { useTranslation } from 'react-i18next';

const codeStyles = `
  .hljs-attr {
    color: #36ACE3;
  }
  .hljs-string {
    color: #FF6B6B;
  }
  .hljs-number {
    color: #FF9F43;
  }
  .hljs-boolean {
    color: #2ED573;
  }
  .hljs-null {
    color: #A367DC;
  }
  
  .dark .hljs-attr {
    color: #9CDCFE;
  }
  .dark .hljs-string {
    color: #CE9178;
  }
  .dark .hljs-number {
    color: #B5CEA8;
  }
  .dark .hljs-boolean {
    color: #4EC9B0;
  }
  .dark .hljs-null {
    color: #C586C0;
  }
`;

function filterContent(message: Message): Message {
  if (message.role !== 'user') {
    return message;
  }

  const cloneMessage: Message = JSON.parse(JSON.stringify(message));
  const weD2cRegex = /<weD2c>[\s\S]*?<\/weD2c>/g;

  cloneMessage.content = cloneMessage.content.replace(weD2cRegex, '');
  if (cloneMessage.parts) {
    cloneMessage.parts = cloneMessage.parts.map((item) => {
      if (item.type === 'text') {
        item.text = item.text.replace(weD2cRegex, '');
      }
      return item;
    });
  }

  return cloneMessage;
}
// Add function to process streaming parts
export const processStreamParts = (parts: Message["parts"]): string => {
  let result = "";
  let thinkContent = "";

  // 首先处理所有reasoning类型的内容
  parts?.forEach((part) => {
    if (part.type === "reasoning") {
      thinkContent += part.reasoning;
    }
  });

  // 如果有reasoning内容，将其转换为markdown引用格式
  if (thinkContent) {
    result +=
      thinkContent
        .split("\n")
        .map((line) => `> ${line}`)
        .join("\n") + "\n\n";
  }

  // 添加其他类型的内容
  parts?.forEach((part) => {
    if (part.type === "text") {
      // 检查是否包含think标签，如果有则进行处理
      if (isThinkContent(part.text)) {
        result += processThinkContent(part.text);
      } else {
        result += part.text;
      }
    }
  });

  const artifactIndex = result.indexOf("<boltArtifact");
  const preContent =
    artifactIndex > 0 ? result.substring(0, artifactIndex) : result;
  return preContent.trim();
};

interface MessageItemProps {
  message: Message & {
    experimental_attachments?: Array<{
      id: string;
      name: string;
      type: string;
      localUrl: string;
      contentType: string;
      url: string;
    }>;
  };
  isLoading: boolean;
  isEndMessage: boolean;
  handleRetry: () => void;
  onUpdateMessage?: (messageId: string, content: {
    text: string;
    type: string;
  }[]) => void;
}

const isArtifactContent = (content: string) => {
  return content.includes("<boltArtifact");
};

const getArtifactTitle = (content: string) => {
  const match = content.match(/title="([^"]+)"/);
  return match ? match[1] : "Task";
};

// 如果生成结束了，user在最后，就要展示重试
const isShowRetry = (isUser: boolean, isLoading: boolean, isEndMessage:boolean) => {
  return isUser && !isLoading && isEndMessage; 
};

// 添加图片预览组件
const ImagePreview = ({
  src,
  onClose,
}: {
  src: string;
  onClose: () => void;
}) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
      onClick={onClose}
    >
      <div className="relative max-w-[90vw] max-h-[90vh]">
        <img
          src={src}
          alt="Preview"
          className="object-contain max-w-full max-h-[90vh]"
        />
        <button
          className="absolute text-white top-4 right-4 hover:text-gray-300"
          onClick={onClose}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

// 添加获取首字母的辅助函数
const getInitial = (name: string | null | undefined): string => {
  if (!name) return "U";

  // 尝试获取第一个英文字母
  const englishMatch = name.match(/[a-zA-Z]/);
  if (englishMatch) {
    return englishMatch[0].toUpperCase();
  }

  // 如果没有英文字母，返回第一个字符
  return name.charAt(0).toUpperCase();
};

// 添加自定义样式处理
const customHighlight = (code: string, language: string) => {
  try {
    if (language.toLowerCase() === 'json') {
      // 自定义 JSON 语法高亮
      const jsonStr = code.trim();
      return jsonStr.replace(
        /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
        function (match) {
          let colorClass = 'hljs-string'; // 字符串颜色
          if (/^"/.test(match)) {
            if (/:$/.test(match)) {
              colorClass = 'hljs-attr'; // key 的颜色
            }
          } else if (/true|false/.test(match)) {
            colorClass = 'hljs-boolean'; // 布尔值颜色
          } else if (/null/.test(match)) {
            colorClass = 'hljs-null'; // null 的颜色
          } else {
            colorClass = 'hljs-number'; // 数字颜色
          }
          return `<span class="${colorClass}">${match}</span>`;
        }
      );
    }

    // 其他语言使用 highlight.js
    return hljs.highlight(code.trim(), {
      language: language || "plaintext",
      ignoreIllegals: true,
    }).value;
  } catch (e) {
    return code;
  }
};

// 使用 memo 包裹 CodeBlock 组件以避免不必要的重渲染
export const CodeBlock = memo(
  ({
    language,
    filePath,
    children,
  }: {
    language: string;
    filePath?: string;
    children: string;
  }) => {
    const [copied, setCopied] = useState(false);
    const [isExpanded, setIsExpanded] = useState(true); // 添加展开/折叠状态
    const { isDarkMode } = useThemeStore();

    const highlightedCode = useMemo(() => {
      return customHighlight(children, language);
    }, [children, language]);

    const handleCopy = useCallback(async () => {
      try {
        await navigator.clipboard.writeText(children);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy:", err);
      }
    }, [children]);

    // 判断是否为 JSON 内容
    const isJson = language.toLowerCase() === 'json';

    return (
      <>
        <style>{codeStyles}</style>
        <div className="my-1">
          <div className="rounded-lg overflow-hidden group border border-slate-700/60 shadow-lg shadow-cyan-500/10 bg-slate-950/60 backdrop-blur">
            <div className="flex items-center justify-between px-2 py-1 border-b border-slate-700/60 bg-gradient-to-r from-slate-900/80 to-slate-800/80">
              <div className="flex items-center gap-2.5">
                {filePath ? (
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-[#6e7681] dark:text-gray-400"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                    >
                      <path d="M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0 1 13.25 16h-9.5A1.75 1.75 0 0 1 2 14.25Zm1.75-.25a.25.25 0 0 0-.25.25v12.5c0 .138.112.25.25.25h9.5a.25.25 0 0 0 .25-.25V6h-2.75A1.75 1.75 0 0 1 9 4.25V1.5Zm6.75.062V4.25c0 .138.112.25.25.25h2.688l-.011-.013-2.914-2.914-.013-.011Z" />
                    </svg>
                    <span className="text-xs font-medium text-slate-300">
                      {filePath}
                    </span>
                  </div>
                ) : language ? (
                  <div className="text-xs font-medium text-slate-300">
                    {language}
                  </div>
                ) : null}
              </div>
              <div className="flex items-center gap-1">
                {/* 为 JSON 添加展开/折叠按钮 */}
                {isJson && (
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center justify-center w-6 h-6 p-1 text-neon-cyan transition-opacity opacity-0 group-hover:opacity-100 hover:text-neon-cyan"
                    title={isExpanded ? "折叠" : "展开"}
                  >
                    <svg
                      className="w-3 h-3"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        d="M19 9l-7 7-7-7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                )}
                <button
                  onClick={handleCopy}
                  className="flex items-center justify-center w-6 h-6 p-1 text-slate-400 transition-opacity opacity-0 group-hover:opacity-100 hover:text-cyan-300"
                >
                  {copied ? (
                    <svg
                      className="w-3 h-3"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        d="M20 6L9 17l-5-5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-3 h-3"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="9" y="9" width="13" height="13" rx="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <div className="overflow-hidden bg-slate-950/70">
              <div
                className={`overflow-x-auto scrollbar-none px-3 py-1 hljs-dark`}
              >
                <pre className={`!m-0 leading-[1.2] transition-all duration-200 ${
                  isJson && !isExpanded ? 'max-h-0' : 'max-h-none'
                }`}>
                  <code
                    dangerouslySetInnerHTML={{ __html: highlightedCode }}
                    className={`language-${language || "plaintext"} text-xs text-slate-100`}
                  />
                </pre>
                {/* JSON 内容折叠时显示渐变遮罩 */}
                {isJson && !isExpanded && (
                  <div className="h-8 -mt-8 bg-gradient-to-t from-slate-950/70 to-transparent pointer-events-none" />
                )}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.language === nextProps.language &&
      prevProps.filePath === nextProps.filePath &&
      prevProps.children === nextProps.children
    );
  }
);

CodeBlock.displayName = "CodeBlock";

// 添加检查是否是 think 内容的函数
export const isThinkContent = (content: string) => {
  return content.includes("<think>") || content.includes("</think>");
};

// 修改 processThinkContent 函数
export const processThinkContent = (content: string) => {
  let isInThinkBlock = false;
  let result = "";

  // 按行处理内容
  const lines = content.split("\n");
  for (let line of lines) {
    if (line.includes("<think>")) {
      isInThinkBlock = true;
      line = line.replace(/<think>/g, "").trim();
      if (line) {
        result += `> ${line}\n`;
      }
      continue;
    }

    if (line.includes("</think>")) {
      isInThinkBlock = false;
      line = line.replace(/<\/think>/g, "").trim();
      if (line) {
        result += `> ${line}\n`;
      }
      result += "\n"; // 在think块结束后添加空行
      continue;
    }

    if (isInThinkBlock) {
      result += line.trim() ? `> ${line}\n` : ">\n";
    } else {
      result += `${line}\n`;
    }
  }

  return result.trim();
};

// 修改 ToolInvocationCard 组件
const ToolInvocationCard = ({ 
  toolInvocation,
  messageId,
  onUpdateMessage,
}: { 
  toolInvocation: {
    args: any;
    state: string;
    step?: number;
    toolCallId: string;
    toolName: string;
  };
  messageId: string;
  onUpdateMessage?: (messageId: string, content: {
    text: string;
    type: string;
  }[]) => void;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [hasInvoked, setHasInvoked] = useState(false);  // 添加状态跟踪是否已调用
  const { t } = useTranslation();
  const toolName = toolInvocation.toolName.split('.');
  if (toolName.length > 2){
    throw new Error(`Tool name: ${toolInvocation.toolName} must be 'string.string'`);
  }
  const handleRetry = async () => {
    try {
      setIsLoading(true);
      const res = await window.myAPI.mcp.callTool({
        client: toolName[0],
        name: toolName[1],
        args: toolInvocation.args,
      });
      const contens: {
        text: string;
        type: string;
      }[] = res?.content || [];
      if (res?.content && onUpdateMessage) {
        // append 到 message 的 content 中
        onUpdateMessage(messageId, contens.map(e => ({
          text: `\`\`\`json\n${e.text}`,
          type: e.type
        })));
        setHasInvoked(true);  // 调用成功后设置状态
      }

    } catch (error) {
      message.error(t('settings.mcp.addError'));
      console.error('工具调用错误:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 mb-4">
      {/* MCP 工具使用提示 */}
      <div className="text-xs text-neon-cyan/80">
        {t('chat.buttons.mcp_tools')}: {toolName.join('.')}
      </div>
      
      <div className="relative rounded-lg border-2 border-neon-cyan/30 bg-slate-950/70 overflow-hidden shadow-lg shadow-cyan-500/10 backdrop-blur-sm">
        <div className="flex items-center gap-2 px-3 py-2 border-b border-neon-cyan/30 bg-gradient-to-r from-slate-900 to-slate-800">
          <svg className="w-4 h-4 text-neon-cyan" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
          <span className="text-sm font-medium text-neon-cyan">
            {toolName?.[2] || t('settings.mcp.title')}
          </span>
        </div>
        <div className="p-3">
          <pre className="whitespace-pre-wrap text-sm text-slate-100 font-mono bg-slate-900/80 border border-neon-cyan/20 rounded p-2">
            {JSON.stringify(toolInvocation?.args, null, 2)}
          </pre>
        </div>
        
        {/* Right-aligned button, only shown if not invoked */}
        {!hasInvoked && (
          <div className="absolute bottom-3 right-3">
            <button
              onClick={handleRetry}
              disabled={isLoading}
              className={classNames(
                "flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md transition-all duration-300 transform hover:scale-105",
                "bg-slate-800/80 border border-cyan-400/30 text-cyan-300 hover:bg-cyan-400/20 shadow-lg shadow-cyan-500/20",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
              <span>
                {isLoading ? t('settings.mcp.invoke_tooling') : t('settings.mcp.invoke_tool')}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isLoading,
  isEndMessage,
  handleRetry,
  onUpdateMessage,
}) => {
  const { user } = useUserStore();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";
  const handleCopyMessage = useCallback(async () => {
    try {
      const textContent = processStreamParts(message.parts);
      await navigator.clipboard.writeText(textContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("复制失败:", err);
    }
  }, [message.parts]);

  const initial = isUser ? getInitial(user?.username) : "AI";
  return (
    <div className="group relative">
      {/* Show thinking animation for AI when loading */}
      {!isUser && isLoading && (
        <div className="mb-4">
          <ThinkingAnimation isVisible={true} message="Analyzing and generating response..." />
        </div>
      )}
      
      <div className="flex flex-col gap-3 px-4 py-3 rounded-2xl hover:bg-gradient-to-r hover:from-slate-900/20 hover:to-slate-800/20 transition-all duration-500 border border-transparent hover:border-cyan-500/20 backdrop-blur-sm">
        <div className="flex items-start gap-4">
          <div
            className={classNames(
              "w-10 h-10 rounded-xl flex items-center justify-center text-sm border overflow-hidden transition-all duration-300 shadow-lg",
              isUser 
                ? "bg-gradient-to-br from-cyan-500 to-purple-500 border-cyan-400/50 shadow-cyan-500/25" 
                : "bg-gradient-to-br from-slate-800 to-slate-700 border-purple-400/50 shadow-purple-500/25",
              isUser ? "text-white" : "text-purple-300"
            )}
          >
            {isUser ? (
              user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.username || "User"}
                  className="object-cover w-full h-full rounded-xl"
                />
              ) : (
                <span className="font-bold">{initial}</span>
              )
            ) : (
              <span className="font-bold text-xs">AI</span>
            )}
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            {isArtifactContent(message.content) ? (
              <ArtifactView
                isUser={isUser}
                title={getArtifactTitle(message.content)}
                message={message}
                isComplete={!isLoading}
              />
            ) : (
              <div className="flex flex-col gap-2">
                <div className="leading-relaxed prose prose-lg text-white dark:text-white dark:prose-invert max-w-none font-mono">
                  {/* 修改工具调用卡片的渲染 */}
                  {message.parts?.map((part, index) => {
                    if (part.type === "tool-invocation") {
                      return (
                        <ToolInvocationCard 
                          key={index} 
                          toolInvocation={part.toolInvocation}
                          messageId={message.id}
                          onUpdateMessage={onUpdateMessage}
                        />
                      );
                    }
                    return null;
                  })}
                  
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code({ node, className, children, ...props }) {
                        const match = /language-(\w+)(?::(.+))?/.exec(
                          className || ""
                        );
                        const isInline = !match;

                        if (isInline) {
                          return (
                            <code
                              className="font-mono text-sm px-2 py-1 rounded-lg bg-slate-800/80 border border-cyan-400/30 text-cyan-300 shadow-lg"
                              {...props}
                            >
                              {children}
                            </code>
                          );
                        }

                        const language = match?.[1] || "";
                        const filePath = match?.[2];
                        // 确保 children 是字符串类型
                        const content = Array.isArray(children)
                          ? children.join("")
                          : String(children).replace(/\n$/, "");

                        return (
                          <CodeBlock language={language} filePath={filePath}>
                            {content}
                          </CodeBlock>
                        );
                      },
                      pre({ children }) {
                        // 直接返回子元素，不需要额外的包装
                        return children;
                      },
                      p({ children }) {
                        return <p className="mb-3 last:mb-0 text-slate-100 leading-relaxed">{children}</p>;
                      },
                      ul({ children }) {
                        return (
                          <ul className="pl-6 mb-3 space-y-2 list-disc text-slate-100 marker:text-cyan-400">
                            {children}
                          </ul>
                        );
                      },
                      ol({ children }) {
                        return (
                          <ol className="pl-6 mb-3 space-y-2 list-decimal text-slate-100 marker:text-purple-400">
                            {children}
                          </ol>
                        );
                      },
                      li({ children }) {
                        return (
                          <li className="text-slate-100 leading-relaxed">
                            {children}
                          </li>
                        );
                      },
                      a({ children, href }) {
                        return (
                          <a
                            href={href}
                            className="text-cyan-400 hover:text-cyan-300 hover:underline transition-all duration-300 font-medium"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {children}
                          </a>
                        );
                      },
                      blockquote({ children }) {
                        return (
                          <blockquote className="relative py-3 pl-6 my-4 text-sm text-slate-300 border-l-4 border-purple-400/60 rounded-r-xl bg-gradient-to-r from-purple-500/10 to-transparent backdrop-blur-sm group shadow-lg">
                            <div
                              className={`overflow-hidden transition-all duration-300 ${
                                isCollapsed ? "h-6" : "max-h-none"
                              }`}
                            >
                              {children}
                            </div>
                            {/* 渐变遮罩 */}
                            {isCollapsed && (
                              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-purple-500/10 to-transparent" />
                            )}
                            {/* 折叠/展开按钮 */}
                            <button
                              onClick={() => setIsCollapsed(!isCollapsed)}
                              className="absolute p-2 text-purple-400 rounded-full bottom-2 right-3 hover:text-purple-300 hover:bg-purple-500/20 transition-all duration-300 backdrop-blur-sm"
                            >
                              <svg
                                className="w-4 h-4"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                {isCollapsed ? (
                                  <path
                                    d="M12 5v14M5 12h14"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                ) : (
                                  <path
                                    d="M5 12h14"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                )}
                              </svg>
                            </button>
                          </blockquote>
                        );
                      },
                      strong({ children }) {
                        return <strong className="text-cyan-300 font-bold">{children}</strong>;
                      },
                      em({ children }) {
                        return <em className="text-purple-300 font-medium">{children}</em>;
                      },
                      table({ children }) {
                        return (
                          <div className="my-6 overflow-x-auto rounded-xl border border-slate-600/50 shadow-2xl">
                            <table className="min-w-full border-collapse bg-slate-900/50 backdrop-blur-sm">
                              {children}
                            </table>
                          </div>
                        );
                      },
                      thead({ children }) {
                        return (
                          <thead className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20">
                            {children}
                          </thead>
                        );
                      },
                      tbody({ children }) {
                        return (
                          <tbody className="divide-y divide-slate-600/30">
                            {children}
                          </tbody>
                        );
                      },
                      tr({ children }) {
                        return (
                          <tr className="hover:bg-slate-800/50 transition-colors duration-300">
                            {children}
                          </tr>
                        );
                      },
                      th({ children }) {
                        return (
                          <th className="px-6 py-3 text-sm font-bold text-left text-cyan-300 border border-slate-600/30">
                            {children}
                          </th>
                        );
                      },
                      td({ children }) {
                        return (
                          <td className="px-6 py-3 text-sm text-slate-100 border border-slate-600/30">
                            {children}
                          </td>
                        );
                      },
                    }}
                  >
                    {(() => {
                      const filterMessages = filterContent(message)
                      return processStreamParts(filterMessages.parts);
                    })()}
                  </ReactMarkdown>
                </div>
              </div>
            )}

            {message.experimental_attachments &&
              message.experimental_attachments.length > 0 && (
                <div className="mt-2">
                  <ImageGrid
                    images={message.experimental_attachments}
                    onImageClick={(url) => setPreviewImage(url)}
                  />
                </div>
              )}
          </div>
        </div>
      </div>
      {previewImage && (
        <ImagePreview
          src={previewImage}
          onClose={() => setPreviewImage(null)}
        />
      )}
      <>
        {!isArtifactContent(message.content) ? (
          <div className="flex items-center justify-end ">
            <button
              onClick={handleCopyMessage}
              className="opacity-0 group-hover:opacity-100 transition-all duration-300 p-1.5 rounded-lg hover:bg-neon-green/20 hover:text-neon-green border border-transparent hover:border-neon-green/50"
            >
              {copied ? (
                <svg
                  className="w-4 h-4 text-neon-green"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    d="M20 6L9 17l-5-5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4 text-gray-400 hover:text-neon-green transition-colors duration-300"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              )}
            </button>
            {isShowRetry(isUser, isLoading, isEndMessage) ? (
              <button
                onClick={() => {
                  handleRetry?.()
                }}
                className="opacity-0 group-hover:opacity-100 transition-all duration-300 p-1.5 rounded-lg hover:bg-neon-green/20 hover:text-neon-green border border-transparent hover:border-neon-green/50"
                title="重试"
              >
                <svg
                  className="w-4 h-4 text-gray-400 hover:text-neon-green transition-colors duration-300"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            ) : null}
          </div>
        ) : null}
      </>
    </div>
  );
};
