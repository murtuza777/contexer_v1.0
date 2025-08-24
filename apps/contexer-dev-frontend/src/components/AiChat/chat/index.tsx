import {useEffect, useMemo, useRef, useState} from "react";
import {Message, useChat} from "ai/react";
import {toast} from "react-toastify";
import {uploadImage} from "@/api/chat";
import useChatStore from "../../../stores/chatSlice";
import {useFileStore} from "../../WeIde/stores/fileStore";
import {db} from "../../../utils/indexDB";
import {v4 as uuidv4} from "uuid";
import {eventEmitter} from "../utils/EventEmitter";
import {MessageItem} from "./components/MessageItem";
import {ChatInput, ChatMode} from "./components/ChatInput";
import Tips from "./components/Tips";
import {parseMessage} from "../../../utils/messagepParseJson";
import useUserStore from "../../../stores/userSlice";
import {useLimitModalStore} from "../../UserModal";
import {updateFileSystemNow} from "../../WeIde/services";
import {parseMessages} from "../useMessageParser";
import {createMpIcon} from "@/utils/createWtrite";
import {useTranslation} from "react-i18next";
import useChatModeStore from "../../../stores/chatModeSlice";
import useTerminalStore from "@/stores/terminalSlice";
import {checkExecList, checkFinish} from "../utils/checkFinish";
import {useUrlData} from "@/hooks/useUrlData";
import {MCPTool} from "@/types/mcp";
import useMCPTools from "@/hooks/useMCPTools";

type WeMessages = (Message & {
    experimental_attachments?: Array<{
        id: string;
        name: string;
        type: string;
        localUrl: string;
        contentType: string;
        url: string;
    }>
})[]
type TextUIPart = {
    type: 'text';
    /**
     * The text content.
     */
    text: string;
};
const ipcRenderer = window?.electron?.ipcRenderer;
export const excludeFiles = [
    "components/weicon/base64.js",
    "components/weicon/icon.css",
    "components/weicon/index.js",
    "components/weicon/index.json",
    "components/weicon/index.wxml",
    "components/weicon/icondata.js",
    "components/weicon/index.css",
    "/miniprogram/components/weicon/base64.js",
    "/miniprogram/components/weicon/icon.css",
    "/miniprogram/components/weicon/index.js",
    "/miniprogram/components/weicon/index.json",
    "/miniprogram/components/weicon/index.wxml",
    "/miniprogram/components/weicon/icondata.js",
    "/miniprogram/components/weicon/index.css",
];

// Backend API configuration (use Vite env and safe fallback)
const API_BASE = (import.meta as any).env?.VITE_APP_BASE_URL || window.location.origin || 'http://localhost:3000';
console.log(API_BASE, 'API_BASE')

enum ModelTypes {
    Claude37sonnet = "claude-3-7-sonnet-20250219",
    Claude35sonnet = "claude-3-5-sonnet-20240620",
    gpt4oMini = "gpt-4o-mini",
    DeepseekR1 = "DeepSeek-R1",
    DeepseekV3 = "deepseek-chat",
    GptOss120b = "openai/gpt-oss-120b",
}

export interface IModelOption {
    value: string;
    label: string;
    useImage: boolean;
    quota: number;
    from?: string;
    icon?: React.FC<React.SVGProps<SVGSVGElement>>;
    provider?: string;
    functionCall?: boolean;
}

function convertToBoltAction(obj: Record<string, string>): string {
    return Object.entries(obj)
        .filter(([filePath]) => !excludeFiles.includes(filePath))
        .map(
            ([filePath, content]) =>
                `<boltAction type="file" filePath="${filePath}">\n${content}\n</boltAction>`
        )
        .join("\n\n");
}

export const BaseChat = ({uuid: propUuid}: { uuid?: string }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const {otherConfig} = useChatStore();
    const {t} = useTranslation();
    const [checkCount, setCheckCount] = useState(0);
    const [visible, setVisible] = useState(false);
    const [baseModal, setBaseModal] = useState<IModelOption>({
        value: ModelTypes.GptOss120b,
        label: "OpenAI OSS 120B",
        useImage: false,
        from: "default",
        quota: 5,
        provider: "openai",
        functionCall: true,
    });
    const {
        files,
        isFirstSend,
        isUpdateSend,
        setIsFirstSend,
        setIsUpdateSend,
        setFiles,
        setEmptyFiles,
        errors,
        updateContent,
        clearErrors,
        setOldFiles
    } = useFileStore();
    const {mode} = useChatModeStore();
    // Use global state
    const {
        uploadedImages,
        addImages,
        removeImage,
        clearImages,
        setModelOptions,
    } = useChatStore();
    const {resetTerminals} = useTerminalStore();
    const filesInitObj = {} as Record<string, string>;
    const filesUpdateObj = {} as Record<string, string>;
    Object.keys(isFirstSend).forEach((key) => {
        isFirstSend[key] && (filesInitObj[key] = files[key]);
    });
    Object.keys(isUpdateSend).forEach((key) => {
        isUpdateSend[key] && (filesUpdateObj[key] = files[key]);
    });

    const initConvertToBoltAction = convertToBoltAction({
        ...filesInitObj,
        ...filesUpdateObj,
    });

    const updateConvertToBoltAction = convertToBoltAction(filesUpdateObj);

    // Fetch models from backend
    useEffect(() => {
        fetch(`${API_BASE}/api/model`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((res) => res.json())
            .then((data) => {
                setModelOptions(data);
                console.log("Loaded models from backend:", data);
            })
            .catch((error) => {
                console.error("Failed to fetch model list:", error);
                // Fallback models in case of error
                const fallbackModels: IModelOption[] = [
                    {
                        value: "openai/gpt-oss-120b",
                        label: "OpenAI OSS 120B",
                        useImage: false,
                        quota: 5,
                        provider: "openrouter",
                        functionCall: true,
                    },
                ];
                setModelOptions(fallbackModels);
            });
    }, []);

    useEffect(() => {
        if (
            (messages.length === 0 &&
                initConvertToBoltAction &&
                mode === ChatMode.Builder) ||
            (messages.length === 1 &&
                messages[0].id === "1" &&
                initConvertToBoltAction &&
                mode === ChatMode.Builder)
        ) {
            setMessagesa([
                {
                    id: "1",
                    role: "user",
                    content: `<boltArtifact id="hello-js" title="the current file">\n${initConvertToBoltAction}\n</boltArtifact>\n\n`,
                },
            ]);
            setMessages([
                {
                    id: "1",
                    role: "user",
                    content: `<boltArtifact id="hello-js" title="the current file">\n${initConvertToBoltAction}\n</boltArtifact>\n\n`,
                },
            ])
            scrollToBottom();
        }
    }, [initConvertToBoltAction]);

    useEffect(() => {
        if (
            messages.length > 1 &&
            updateConvertToBoltAction &&
            mode === ChatMode.Builder
        ) {
            setMessages((list) => {
                const newList = [...list];
                if (newList[newList.length - 1].id !== "2") {
                    newList.push({
                        id: "2",
                        role: "user",
                        content: `<boltArtifact id="hello-js" title="Currently modified files">\n${updateConvertToBoltAction}\n</boltArtifact>\n\n`,
                    });
                } else if (newList[newList.length - 1].id === "2") {
                    newList[newList.length - 1].content =
                        `<boltArtifact id="hello-js" title="Currently modified files">\n${updateConvertToBoltAction}\n</boltArtifact>\n\n`;
                }
                scrollToBottom();
                return newList;
            });
        }
    }, [updateConvertToBoltAction]);

    // Modify UUID initialization logic and message loading
    const [chatUuid, setChatUuid] = useState(() => propUuid || uuidv4());

    const refUuidMessages = useRef<string[]>([]);

    useEffect(() => {
        if (checkCount >= 1) {
            checkFinish(messages[messages.length - 1].content, append, t);
            checkExecList(messages);
            setCheckCount(0);
        }
    }, [checkCount]);

    // Add function to load historical messages
    const loadChatHistory = async (uuid: string) => {
        try {
            const records = await db.getByUuid(uuid);
            if (records.length > 0) {
                const latestRecord = records[0];
                if (latestRecord?.data?.messages) {
                    const historyFiles = {};
                    const oldHistoryFiles = {};
                    // setEmptyFiles();
                    ipcRenderer && ipcRenderer.invoke("node-container:set-now-path", "");
                    console.log(latestRecord, 'latestRecord')
                    latestRecord.data.messages.forEach((message) => {
                        const {files: messageFiles} = parseMessage(message.content);
                        Object.assign(historyFiles, messageFiles);
                    });
                    const assistantRecord = latestRecord.data.messages.filter(e => e.role === "assistant")
                    if (assistantRecord.length > 1) {
                        const oldRecords = assistantRecord[1];
                        console.log(oldRecords, 'oldRecords')
                        const {files: messageFiles} = parseMessage(oldRecords.content);
                        Object.assign(oldHistoryFiles, messageFiles);
                    }
                    if (mode === ChatMode.Builder) {
                        latestRecord.data.messages.push({
                            id: uuidv4(),
                            role: "user",
                            content: `<boltArtifact id="hello-js" title="the current file">\n${convertToBoltAction(historyFiles)}\n</boltArtifact>\n\n`,
                        });
                    }
                    setMessages(latestRecord.data.messages);
                    setFiles(historyFiles);
                    setOldFiles(oldHistoryFiles);
                    // Reset other states
                    clearImages();
                    setIsFirstSend();
                    setIsUpdateSend();
                    resetTerminals();
                }
            } else {
                // If it's a new conversation, clear all states
                setMessages([]);
                clearImages();
                setIsFirstSend();
                setIsUpdateSend();
            }
        } catch (error) {
            console.error("Failed to load chat history:", error);
            toast.error("Failed to load chat history");
        }
    };

    // Listen for chat selection events
    useEffect(() => {
        const unsubscribe = eventEmitter.on("chat:select", (uuid: string) => {
            if (uuid !== chatUuid) {
                refUuidMessages.current = [];
                setChatUuid(uuid || uuidv4());
                if (uuid) {
                    // Load history records
                    loadChatHistory(uuid);
                } else {
                    // New conversation, clear all states
                    setMessages([]);
                    setFiles({});
                    clearImages();
                    setIsFirstSend();
                    setIsUpdateSend();
                    if (ipcRenderer) {
                        setEmptyFiles();
                        ipcRenderer.invoke("node-container:set-now-path", "");
                        setFiles({});
                        clearImages();
                        setIsFirstSend();
                        setIsUpdateSend();
                        resetTerminals();
                    }
                }
            }
        });

        // Clean up subscription
        return () => unsubscribe();
    }, [chatUuid, files]);
    const token = useUserStore.getState().token;
    const {openModal} = useLimitModalStore();

    const [messages, setMessagesa] = useState<WeMessages>([]);
    const {enabledMCPs} = useMCPTools()
    const baseChatUrl = `${API_BASE}`;

    const [mcpTools, setMcpTools] = useState<MCPTool[]>([])
    useEffect(() => {
        if (enabledMCPs && enabledMCPs.length > 0) {
            window.myAPI.mcp.listTools().then((allMCPTools) => {
                const filteredTools = allMCPTools.filter((tool) => {
                    return enabledMCPs.some((mcp) => mcp.name === tool.serverName);
                });
                setMcpTools(filteredTools)
            })
        } else {
            setMcpTools([])
        }
    }, [enabledMCPs])

    // Modify useChat configuration
    const {
        messages: realMessages,
        input,
        handleInputChange,
        isLoading,
        setMessages,
        append,
        setInput,
        stop,
        reload,
    } = useChat({
        api: `${baseChatUrl}/api/chat`,
        headers: {
            ...(token && {Authorization: `Bearer ${token}`}),
        },
        body: {
            model: baseModal.value,
            mode: mode,
            otherConfig: {
                ...otherConfig,
                extra: {
                    ...otherConfig.extra,
                    isBackEnd: otherConfig.isBackEnd,
                    backendLanguage: otherConfig.backendLanguage
                },
            },
            // If model supports function call and has enabled MCP tools, add tools configuration
            ...(baseModal.functionCall && mcpTools.length > 0 && {
                tools: mcpTools.map(tool => ({
                    id: tool.id,
                    name: `${tool.serverName}.${tool.name}`,
                    description: tool.description || '',
                    parameters: tool.inputSchema
                }))
            })
        },
        id: chatUuid,
        onResponse: async (response) => {
            if (baseModal.from === "ollama") {
                const reader = response.body?.getReader();
                if (!reader) return;

                while (true) {
                    const {done, value} = await reader.read();
                    if (done) break;

                    const text = new TextDecoder().decode(value);
                    const lines = text.split("\n").filter((line) => line.trim());

                    for (const line of lines) {
                        try {
                            const data = JSON.parse(line);
                            if (data.message?.content) {
                                setMessages((messages) => {
                                    const lastMessage = messages[messages.length - 1];
                                    if (lastMessage && lastMessage.role === "assistant") {
                                        return [
                                            ...messages.slice(0, -1),
                                            {
                                                ...lastMessage,
                                                content: lastMessage.content + data.message.content,
                                            },
                                        ];
                                    }
                                    return [
                                        ...messages,
                                        {
                                            id: uuidv4(),
                                            role: "assistant",
                                            content: data.message.content,
                                        },
                                    ];
                                });
                            }
                        } catch (e) {
                            console.warn("Failed to parse Ollama response line:", e);
                        }
                    }
                }
            }
        },
        onFinish: async (message) => {
            if(message.parts){
                console.log(message.parts);
            }
            clearImages();
            scrollToBottom();
            try {
                const needParseMessages = [...messages, message].filter(
                    (m) => !refUuidMessages.current.includes(m.id)
                );

                refUuidMessages.current = [
                    ...refUuidMessages.current,
                    ...needParseMessages.map((m) => m.id),
                ];

                if (message) {
                    const {files: messagefiles} = parseMessage(message.content);
                    for (let key in messagefiles) {
                        await updateContent(key, messagefiles[key], false, true);
                    }
                }

                setIsFirstSend();
                setIsUpdateSend();

                let initMessage: Message[] = [];
                initMessage = [
                    {
                        id: uuidv4(),
                        role: "user" as const,
                        content: input,
                    },
                ];
                await db.insert(chatUuid, {
                    messages: [...messages, ...initMessage, message],
                    title:
                        [...initMessage, ...messages]
                            .find(
                                (m) => m.role === "user" && !m.content.includes("<boltArtifact")
                            )
                            ?.content?.slice(0, 50) || "New Chat",
                });
            } catch (error) {
                console.error("Failed to save chat history:", error);
            }
            setCheckCount(checkCount => checkCount + 1);
        },
        onError: (error: any) => {
            const msg = error?.errors?.[0]?.responseBody || String(error);
            console.log("error", error, msg);
            toast.error(msg)
            if (String(error).includes("Quota not enough")) {
                openModal('limit');
            }
            if (String(error).includes("Authentication required")) {
                openModal("login");
            }
            // Add handling for Ollama errors
            if (baseModal.from === "ollama") {
                toast.error("Ollama server connection failed, please check configuration");
            }
        },
    });
    const {status, type} = useUrlData({append});

    // Listen for URL when jumping from official website
    useEffect(() => {
        if (status && type === "sketch") {
            showGuide();
        }
    }, [status, type]);


    const parseTimeRef = useRef(0);

    useEffect(() => {
        const visibleFun = () => {
            if (isLoading) return;
            else if (!isLoading && window.electron) {
                setTimeout(() => {
                    updateFileSystemNow();
                }, 600);
            }
        };
        document.addEventListener("visibilitychange", visibleFun);
        return () => {
            document.removeEventListener("visibilitychange", visibleFun);
        };
    }, [isLoading, files]);

    useEffect(() => {
        if (Date.now() - parseTimeRef.current > 200 && isLoading) {
            setMessagesa(realMessages as WeMessages);
            parseTimeRef.current = Date.now();

            const needParseMessages = messages.filter(
                (m) => !refUuidMessages.current.includes(m.id)
            );
            parseMessages(needParseMessages);
            scrollToBottom();
        }
        if (errors.length > 0 && isLoading) {
            clearErrors();
        }
        if (!isLoading) {
            setMessagesa(realMessages as WeMessages);
            createMpIcon(files);
        }
    }, [realMessages, isLoading]);

    const [userScrolling, setUserScrolling] = useState(false)
    const userScrollTimeoutRef = useRef<NodeJS.Timeout>()

    // Handle user scrolling
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.target as HTMLDivElement
        const isScrolledToBottom = Math.abs(target.scrollHeight - target.scrollTop - target.clientHeight) < 10

        if (!isScrolledToBottom) {
            // User is scrolling to view historical messages
            setUserScrolling(true)
            
            // Clear previous timer
            if (userScrollTimeoutRef.current) {
                clearTimeout(userScrollTimeoutRef.current)
            }
            
            // Set new timer, allow auto-scroll after 3 seconds
            userScrollTimeoutRef.current = setTimeout(() => {
                setUserScrolling(false)
            }, 3000)
        }
    }

    // Modify scroll to bottom function
    const scrollToBottom = () => {
        if (userScrolling) return // If user is scrolling, don't execute auto-scroll

        const messageContainer = document.querySelector('.message-container')
        if (messageContainer) {
            messageContainer.scrollTop = messageContainer.scrollHeight
        }
    }

    // Clean up timer when component unmounts
    useEffect(() => {
        return () => {
            if (userScrollTimeoutRef.current) {
                clearTimeout(userScrollTimeoutRef.current)
            }
        }
    }, [])

    // Add upload status tracking
    const [isUploading, setIsUploading] = useState(false);
    const filterMessages = messages.filter((e) => e.role !== "system");
    // Modify upload handling function
    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length || isUploading) return;
        setIsUploading(true);

        const selectedFiles = Array.from(e.target.files);
        const MAX_FILE_SIZE = 5 * 1024 * 1024;

        const validFiles = selectedFiles.filter((file) => {
            if (file.size > MAX_FILE_SIZE) {
                toast.error(t("chat.errors.file_size_limit", {fileName: file.name}));
                return false;
            }
            return true;
        });

        try {
            const uploadResults = await Promise.all(
                validFiles.map(async (file) => {
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
                toast.success(t("chat.success.images_uploaded"));
            } else {
                toast.success(
                    t("chat.success.images_uploaded_multiple", {
                        count: uploadResults.length,
                    })
                );
            }
        } catch (error) {
            console.error("Upload failed:", error);
            toast.error(t("chat.errors.upload_failed"));
        } finally {
            setIsUploading(false);
        }

        e.target.value = "";
    };

    // Modify submit handling function
    const handleSubmitWithFiles = async (
        _: React.KeyboardEvent,
        text?: string
    ) => {
        if (!text && !input.trim() && uploadedImages.length === 0) return;

        try {
            // Handle file references
            // const processedInput = await processFileReferences(input);
            // If it's an ollama type model, it needs separate logic, not cloud-based

            // Save current image attachments
            const currentAttachments = uploadedImages.map((img) => ({
                id: img.id,
                name: img.id,
                type: img.file.type,
                localUrl: img.localUrl,
                contentType: img.file.type,
                url: img.url,
            }));
            console.log(JSON.stringify(uploadedImages), JSON.stringify(currentAttachments), 'currentAttachments')
            // Clear image state first
            clearImages();

            append(
                {
                    role: "user",
                    content: text || input,
                },
                {
                    experimental_attachments: currentAttachments,
                }
            );
            setInput("");
            setTimeout(() => {
                scrollToBottom();
            }, 100);
        } catch (error) {
            console.error("Upload failed:", error);
            toast.error("Failed to upload files");
        }
    };

    // Modify keyboard submit handling
    const handleKeySubmit = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmitWithFiles(e);
        }
    };

    // Modify paste handling function
    const handlePaste = async (e: ClipboardEvent) => {
        if (isUploading) return;

        const items = e.clipboardData?.items;
        if (!items) return;

        const hasImages = Array.from(items).some(
            (item) => item.type.indexOf("image") !== -1
        );
        if (hasImages) {
            e.preventDefault();
            setIsUploading(true);

            const imageItems = Array.from(items).filter(
                (item) => item.type.indexOf("image") !== -1
            );

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
                    toast.success(t("chat.success.image_pasted"));
                } else {
                    toast.success(
                        t("chat.success.images_pasted_multiple", {
                            count: uploadResults.length,
                        })
                    );
                }
            } catch (error) {
                console.error("Failed to upload pasted images:", error);
                toast.error(t("chat.errors.paste_failed"));
            } finally {
                setIsUploading(false);
            }
        }
    };

    // Add paste event listener
    useEffect(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        textarea.addEventListener("paste", handlePaste);
        return () => {
            textarea.removeEventListener("paste", handlePaste);
        };
    }, []);

    // Add drag handling function
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (isUploading) return;
        setIsUploading(true);

        try {
            const items = Array.from(e.dataTransfer.items);
            const imageItems = items.filter((item) => item.type.startsWith("image/"));

            const uploadResults = await Promise.all(
                imageItems.map(async (item) => {
                    const file = item.getAsFile();
                    if (!file) throw new Error("Failed to get file from drop");

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
                toast.success("Image added to input");
            } else {
                toast.success(`${uploadResults.length} images added to input`);
            }
        } catch (error) {
            console.error("Failed to process dropped images:", error);
            toast.error("Failed to add images");
        } finally {
            setIsUploading(false);
        }
    };

    const showJsx = useMemo(() => {
        return (
            <div
                className="flex-1 overflow-y-auto px-1 py-2 message-container [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] bg-dark-bg dark:bg-darker-bg"
                onScroll={handleScroll}  // Add scroll event listener
            >
                        <Tips
            append={append}
            setInput={setInput}
            handleFileSelect={handleFileSelect}
          />
                <div className="max-w-[640px] w-full mx-auto space-y-3">
                    {filterMessages.map((message, index) => (
                        <MessageItem
                            handleRetry={() => {
                                // Test
                                reload();
                            }} 
                            key={`${message.id}-${index}`}
                            message={message}
                            isEndMessage={
                                filterMessages[filterMessages.length - 1].id === message.id
                            }
                            isLoading={isLoading}
                            onUpdateMessage={(messageId, content) => {
                                append( {
                                    role: "user",
                                    content: ` ${content?.[0]?.text}`,
                                })
         
                            }}
                        />
                    ))}

                    {isLoading && (
                        <div className="group" key="loading-indicator">
                            <div
                                className="flex items-start gap-2 px-2 py-1.5 rounded-lg hover:bg-neon-green/5 transition-colors border border-gray-800/50 bg-card-bg">
                                <div
                                    className="w-6 h-6 rounded-md bg-neon-green/20 text-neon-green flex items-center justify-center text-xs border border-neon-green/50 animate-neon-pulse">
                                    <svg
                                        className="w-4 h-4 animate-spin"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="3"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        />
                                    </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <div className="w-24 h-4 rounded bg-neon-green/20 animate-pulse"/>
                                        <div className="w-32 h-4 rounded bg-neon-blue/20 animate-pulse"/>
                                        <div className="w-16 h-4 rounded bg-neon-cyan/20 animate-pulse"/>
                                    </div>
                                    <div className="mt-2 space-y-2">
                                        <div className="w-full h-3 rounded bg-neon-green/20 animate-pulse"/>
                                        <div className="w-4/5 h-3 rounded bg-neon-blue/20 animate-pulse"/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} className="h-px"/>
                </div>
            </div>
        );
    }, [messages, isLoading, setInput, handleFileSelect]);

    // Show guide popup
    const showGuide = () => setVisible(true);

    // Handle file selection
    const handleFileSelected = () => {
        console.log('handleFileSelected')
        // Handle upload logic
        setVisible(false);
    };

    return (
        <div
            className="flex h-full flex-col bg-dark-bg dark:bg-darker-bg max-w-full relative"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            {/* Scan line effect */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-neon-green to-transparent animate-scan-line opacity-50"></div>
            
            {showJsx}
            <ChatInput
                input={input}
                setMessages={setMessages}
                append={append}
                messages={messages}
                stopRuning={stop}
                setInput={setInput}
                isLoading={isLoading}
                isUploading={isUploading}
                uploadedImages={uploadedImages}
                baseModal={baseModal}
                handleInputChange={handleInputChange}
                handleKeySubmit={handleKeySubmit}
                handleSubmitWithFiles={handleSubmitWithFiles}
                handleFileSelect={handleFileSelect}
                removeImage={removeImage}
                addImages={addImages}
                setIsUploading={setIsUploading}
                setBaseModal={setBaseModal}
            />
        </div>
    );
};
