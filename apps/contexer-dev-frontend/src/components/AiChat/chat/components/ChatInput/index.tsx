import React, { useRef, useState, useCallback, useEffect } from "react";
import { FileText, Code2, Bot } from "lucide-react";
import { toast } from "react-hot-toast";
import { uploadImage } from "@/api/chat";
import classNames from "classnames";
import { useFileStore } from "../../../../WeIde/stores/fileStore";
import type { MentionOption } from "../MentionMenu";
import { ErrorDisplay } from "./ErrorDisplay";
import { ImagePreviewGrid } from "./ImagePreviewGrid";
import { SendButton } from "./SendButton";
import type { ChatInputProps as ChatInputPropsType } from "./types";
import { useTranslation } from "react-i18next";
import useChatModeStore from "../../../../../stores/chatModeSlice";
import useChatStore from "@/stores/chatSlice";
import useThemeStore from "@/stores/themeSlice";
import { v4 as uuidv4 } from "uuid";
import OptimizedPromptWord from "./OptimizedPromptWord";
import useUserStore from "@/stores/userSlice";
// import type { ModelOption } from './UploadButtons';

export enum ChatMode {
  Chat = "chat",
  Builder = "builder",
}
export const modePlaceholders = {
  [ChatMode.Chat]: "chat.modePlaceholders.chat",
  [ChatMode.Builder]: "chat.modePlaceholders.builder",
};
export const ChatInput: React.FC<ChatInputPropsType> = ({
  input,
  stopRuning,
  isLoading,
  isUploading,
  append,
  uploadedImages,
  setMessages,
  messages,
  handleInputChange,
  handleKeySubmit,
  handleSubmitWithFiles,
  handleFileSelect,
  removeImage,
  addImages,
  setInput,
  setIsUploading,
  handleSketchUpload,
  baseModal,
  setBaseModal,
}) => {
  const { errors, removeError, getCurrentFiles } = useFileStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sketchInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { t } = useTranslation();
  const { user } = useUserStore();
  const [showMentionMenu, setShowMentionMenu] = useState(false);
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
  const [filteredMentionOptions, setFilteredMentionOptions] = useState<
    MentionOption[]
  >([]);
  const [highlightRange, setHighlightRange] = useState<{
    start: number;
    end: number;
  } | null>(null);
  const [mentions, setMentions] = useState<
    Array<{ start: number; end: number; path: string }>
  >([]);
  const { mode: chatMode, setMode } = useChatModeStore();
  const { isDarkMode } = useThemeStore();
  const [isViberMode, setIsViberMode] = useState(false);

  const getFileOptions = () => {
    const files = getCurrentFiles();
    return Object.entries(files).map(([path]) => ({
      id: path,
      icon: <FileText className="w-3 h-3" />,
      label: path,
      path: path,
    }));
  };

  const handleFileInputClick = () => {
    fileInputRef.current?.click();
  };

  const handleSketchClick = () => {
    sketchInputRef.current?.click();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.nativeEvent.isComposing || e.keyCode === 229) {
      e.preventDefault(); // 阻止默认行为
      return;
    }

    if (e.key === "Backspace" || e.key === "Delete") {
      const cursorPosition = e.currentTarget.selectionStart;
      const mention = mentions.find((m) => m.end === cursorPosition);

      if (mention) {
        e.preventDefault();
        const newValue =
          input.slice(0, mention.start) + input.slice(mention.end);
        const event = {
          target: { value: newValue },
        } as React.ChangeEvent<HTMLTextAreaElement>;
        handleInputChange(event);
        setHighlightRange(null);
        setMentions(mentions.filter((m) => m !== mention));
        return;
      }
    }

    if (e.key === "Enter") {
      setHighlightRange(null);
    }

    if (showMentionMenu) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedMentionIndex((prev) =>
          prev < filteredMentionOptions.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedMentionIndex((prev) => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (
          filteredMentionOptions.length > 0 &&
          filteredMentionOptions[selectedMentionIndex]
        ) {
          handleMentionSelect(filteredMentionOptions[selectedMentionIndex]);
        }
      } else if (e.key === "Escape") {
        setShowMentionMenu(false);
      }
    } else {
      handleKeySubmit(e);
    }
  };

  const debounce = (fn: Function, delay: number) => {
    let timer: NodeJS.Timeout;
    return (...args: unknown[]) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  };

  const getCursorPosition = (textarea: HTMLTextAreaElement) => {
    const style = window.getComputedStyle(textarea);
    const pos = textarea.selectionStart || 0;

    const div = document.createElement("div");
    div.style.position = "absolute";
    div.style.visibility = "hidden";
    div.style.whiteSpace = "pre-wrap";
    div.style.wordWrap = "break-word";
    div.style.width = style.width;
    div.style.padding = style.padding;
    div.style.font = style.font;
    div.style.lineHeight = style.lineHeight;

    const textBeforeCursor = textarea.value.substring(0, pos);
    const textAfterCursor = textarea.value.substring(pos);

    const beforeNode = document.createTextNode(textBeforeCursor);
    div.appendChild(beforeNode);

    const cursorNode = document.createElement("span");
    cursorNode.textContent = "|";
    div.appendChild(cursorNode);

    const afterNode = document.createTextNode(textAfterCursor);
    div.appendChild(afterNode);

    document.body.appendChild(div);

    const cursorRect = cursorNode.getBoundingClientRect();
    const textareaRect = textarea.getBoundingClientRect();

    document.body.removeChild(div);

    const relativeTop = cursorRect.top - textareaRect.top + textarea.scrollTop;
    const relativeLeft = cursorRect.left - textareaRect.left;

    const maxTop = textarea.offsetHeight - 200;
    const adjustedTop = Math.min(relativeTop, maxTop);

    return {
      left: relativeLeft,
      top: adjustedTop,
      height: parseFloat(style.lineHeight) || 20,
    };
  };

  const updateMentionPosition = useCallback(() => {
    if (!showMentionMenu || !textareaRef.current) return;

    const textarea = textareaRef.current;
    const { left, top, height } = getCursorPosition(textarea);
    const textareaRect = textarea.getBoundingClientRect();
    const menuWidth = 200;

    const adjustedLeft = Math.min(left, textareaRect.width - menuWidth - 10);

    setMentionPosition({
      top: top + height,
      left: adjustedLeft,
    });
  }, [showMentionMenu]);

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      const oldValue = input;
      handleInputChange(e);

      if (newValue.length < oldValue.length) {
        const deletedStart = e.target.selectionStart;
        const mention = mentions.find(
          (m) => deletedStart > m.start && deletedStart < m.end
        );

        if (mention) {
          e.preventDefault();
          return;
        }

        const diff = oldValue.length - newValue.length;
        const updatedMentions = mentions.map((m) => {
          if (m.start > deletedStart) {
            return {
              ...m,
              start: m.start - diff,
              end: m.end - diff,
            };
          }
          return m;
        });
        setMentions(updatedMentions);
      }

      const lastAtIndex = newValue.lastIndexOf("@");
      const textAfterLastAt = newValue.substring(lastAtIndex + 1);

      if (lastAtIndex !== -1 && !textAfterLastAt.includes(" ")) {
        const searchTerm = textAfterLastAt.toLowerCase();
        const fileOptions = getFileOptions();
        const filteredOptions = fileOptions.filter(
          (option) =>
            option.label.toLowerCase().includes(searchTerm) ||
            option.path?.toLowerCase().includes(searchTerm)
        );

        if (filteredOptions.length > 0) {
          updateMentionPosition();
          setFilteredMentionOptions(filteredOptions);
          setShowMentionMenu(true);
          setSelectedMentionIndex(0);
        } else {
          setShowMentionMenu(false);
        }
      } else {
        setShowMentionMenu(false);
      }
    },
    [input, mentions, handleInputChange, updateMentionPosition]
  );

  const handleMentionSelect = (option: MentionOption) => {
    const textarea = textareaRef.current;
    if (!textarea || !option.path) return;

    const cursorPosition = textarea.selectionEnd;
    const textBeforeCursor = textarea.value.substring(0, cursorPosition);
    const textAfterCursor = textarea.value.substring(cursorPosition);

    const lastAtIndex = textBeforeCursor.lastIndexOf("@");
    if (lastAtIndex === -1) return;

    const mentionText = `@${option.path} `;
    const newValue =
      textBeforeCursor.substring(0, lastAtIndex) +
      mentionText +
      textAfterCursor;

    const newMention = {
      start: lastAtIndex,
      end: lastAtIndex + mentionText.length,
      path: option.path,
    };
    setMentions([...mentions, newMention]);

    setHighlightRange({
      start: lastAtIndex,
      end: lastAtIndex + (option.path?.length || 0) + 1,
    });

    const event = {
      target: { value: newValue },
    } as React.ChangeEvent<HTMLTextAreaElement>;

    handleInputChange(event);
    setShowMentionMenu(false);
  };

  const handlePaste = async (e: ClipboardEvent) => {
    console.log(baseModal, "useImage");
    if (!baseModal.useImage) return;
    if (isUploading) return;

    const items = e.clipboardData?.items;
    if (!items) return;

    const imageItems = Array.from(items).filter(
      (item) => item.type.indexOf("image") !== -1
    );

    if (imageItems.length > 0) {
      e.preventDefault();
      setIsUploading(true);

      try {
        const uploadResults = await Promise.all(
          imageItems.map(async (item) => {
            const file = item.getAsFile();
            if (!file) throw new Error("Failed to get file from clipboard");

            const url = await uploadImage(file);
            return {
              id: uuidv4(),
              file,
              url,
              localUrl: URL.createObjectURL(file),
              status: "done" as const,
            };
          })
        );

        addImages(uploadResults);

        if (uploadResults.length === 1) {
          toast.success("Image pasted successfully");
        } else {
          toast.success(`${uploadResults.length} images pasted successfully`);
        }
      } catch (error) {
        console.error("Failed to upload pasted images:", error);
        toast.error("Failed to upload pasted images");
      } finally {
        setIsUploading(false);
      }
    }
  };

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.addEventListener("paste", handlePaste);
    return () => {
      textarea.removeEventListener("paste", handlePaste);
    };
  }, [isUploading, baseModal?.label]);

  useEffect(() => {
    if (showMentionMenu) {
      updateMentionPosition();
    }
  }, [input, showMentionMenu, updateMentionPosition]);

  useEffect(() => {
    const handleResize = debounce(() => {
      if (showMentionMenu) {
        updateMentionPosition();
      }
    }, 100);

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [showMentionMenu, updateMentionPosition]);

  return (
    <div className="px-4 py-3">
      <div className="max-w-4xl w-full mx-auto">
        <ErrorDisplay
          errors={errors}
          onAttemptFix={async (error, index) => {
            const errorText = `Please help me fix this error:\n${error.code}`;
            handleSubmitWithFiles(null, errorText);
            removeError(index);
          }}
          onRemoveError={removeError}
        />

        <ImagePreviewGrid
          uploadedImages={uploadedImages}
          onRemoveImage={removeImage}
        />

          <div className="flex flex-row">
        <OptimizedPromptWord input={input} setInput={setInput}></OptimizedPromptWord>
        </div>

        <div className={`relative bg-slate-900/30 backdrop-blur-sm border border-slate-700/20 rounded-2xl transition-all duration-500 ${input?.trim() ? 'border-cyan-500/50 shadow-lg shadow-cyan-500/20 bg-gradient-to-br from-slate-900/50 via-slate-800/40 to-cyan-900/30' : ''}`}>
          <div
            className={classNames(
              "relative",
              isUploading && "opacity-50 pointer-events-none"
            )}
          >
            {isUploading && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/30 backdrop-blur-sm rounded-2xl">
                <div className="relative">
                  <div className="w-10 h-10 border-2 border-cyan-400 rounded-full animate-spin border-t-transparent"></div>
                  <div className="absolute inset-0 w-10 h-10 border-2 border-purple-400/50 rounded-full animate-ping"></div>
                </div>

            {/* Thinking animation during generation */}
            {isLoading && (
              <div className="px-5 py-2.5 flex items-center gap-3 text-cyan-300/80">
                <div className="flex -space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/80 animate-bounce [animation-delay:-200ms]"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-300/80 animate-bounce [animation-delay:-100ms]"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-200/80 animate-bounce"></span>
                </div>
                <div className="flex-1 h-2 rounded-full bg-gradient-to-r from-cyan-500/20 via-cyan-400/30 to-cyan-500/20 animate-pulse"></div>
                <span className="text-xs tracking-wide uppercase text-cyan-200/70">Thinking…</span>
              </div>
            )}
              </div>
            )}
            <div className="relative ">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={onInputChange}
                onKeyDown={handleKeyDown}
                placeholder={
                  chatMode === ChatMode.Builder
                    ? isViberMode
                      ? "Describe the component..."
                      : "Describe the feature..."
                    : "Ask anything..."
                }
                className="w-full min-h-[48px] max-h-[120px] px-4 py-3 bg-transparent text-gray-200 placeholder-gray-500 resize-none focus:outline-none text-sm leading-relaxed selection:bg-slate-600/30 rounded-t-2xl"
                rows={1}
              />

              {highlightRange && (
                <div
                  className="absolute top-0 bottom-0 left-0 right-0 p-4 text-sm break-words whitespace-pre-wrap pointer-events-none"
                  style={{
                    fontFamily: "inherit",
                    lineHeight: "inherit",
                    overflow: "hidden",
                  }}
                >
                  <span className="invisible">
                    {input.substring(0, highlightRange.start)}
                  </span>
                  <span className="text-transparent bg-neon-blue/20">
                    {input.substring(highlightRange.start, highlightRange.end)}
                  </span>
                  <span className="invisible">
                    {input.substring(highlightRange.end)}
                  </span>
                </div>
              )}
            </div>

            {showMentionMenu && (
              <div
                className="absolute z-50 transition-all duration-100"
                style={{
                  top: `${mentionPosition.top + 100}px`,
                  left: `${mentionPosition.left + 40}px`,
                  maxHeight: "200px",
                  width: "200px",
                }}
              >
                <div className="bg-slate-900/95 backdrop-blur-xl rounded-xl border border-cyan-400/50 shadow-2xl shadow-cyan-500/20 overflow-hidden">
                  <div className="max-h-[180px] overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-500/50 scrollbar-track-transparent">
                    {filteredMentionOptions.map((option, index) => (
                      <div
                        key={option.id}
                        className={classNames(
                          "px-3 py-2 flex items-center gap-3 text-sm cursor-pointer font-mono transition-all duration-200",
                          selectedMentionIndex === index
                            ? "bg-cyan-500/20 text-cyan-300 border-l-2 border-cyan-400"
                            : "text-slate-300 hover:bg-cyan-500/10 hover:text-cyan-200"
                        )}
                        onClick={() => {
                          handleMentionSelect(option);
                        }}
                        ref={
                          index === selectedMentionIndex
                            ? (el) => {
                                if (el) {
                                  el.scrollIntoView({ block: "nearest" });
                                }
                              }
                            : null
                        }
                      >
                        {option.icon}
                        <span className="truncate">{option.path}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}


            <div className="flex items-center justify-between px-3 py-2 border-t border-slate-700/10">
              <div className="flex items-center gap-2">
                {/* Upload buttons temporarily disabled due to module resolution issues */}
                {/* <UploadButtons 
                isLoading={isLoading}
                isUploading={isUploading}
                append={append}
                onImageClick={handleFileInputClick}
                baseModal={baseModal}
                messages={messages}
                handleSubmitWithFiles={handleSubmitWithFiles}
                setMessages={setMessages}
                setBaseModal={setBaseModal}
                onSketchClick={handleSketchClick}
              /> */}
                
                {/* Mode toggle button */}
                <button
                  onClick={() => setMode(chatMode === ChatMode.Chat ? ChatMode.Builder : ChatMode.Chat)}
                  className="p-2 text-gray-400 bg-slate-800/30 border border-slate-700/20 rounded-lg transition-colors hover:bg-slate-700/40 hover:text-gray-200 flex items-center justify-center"
                  title={chatMode === ChatMode.Chat ? "Switch to Builder Mode" : "Switch to Chat Mode"}
                >
                  {chatMode === ChatMode.Chat ? (
                    <Bot className="w-4 h-4" />
                  ) : (
                    <Code2 className="w-4 h-4" />
                  )}
                </button>

                {/* AI Agent toggle */}
                <button
                  onClick={() => setIsViberMode(!isViberMode)}
                  className="p-2 text-gray-400 bg-slate-800/30 border border-slate-700/20 rounded-lg transition-colors hover:bg-slate-700/40 hover:text-gray-200 flex items-center justify-center"
                  title={isViberMode ? "Deactivate AI Agent" : "Activate AI Agent"}
                >
                  <Bot className={`w-4 h-4 transition-colors ${isViberMode ? 'text-cyan-400' : ''}`} />
                </button>
              </div>

              <div className="flex items-center">
                <SendButton
                  isLoading={isLoading}
                  stop={stopRuning}
                  isUploading={isUploading}
                  hasInput={!!(input?.trim())}
                  hasUploadingImages={uploadedImages.some(
                    (img) => img.status === "uploading"
                  )}
                  onClick={handleSubmitWithFiles}
                />
              </div>
            </div>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
          multiple
          accept="image/*"
        />
        
        {/* fileInputRef这个应该是没有用的（没验证） */}
        <input
          ref={sketchInputRef}
          type="file"
          onChange={handleSketchUpload}
          className="hidden"
          accept=".sketch"
        />
      </div>
    </div>
  );
};
