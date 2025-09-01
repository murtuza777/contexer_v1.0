import { create } from "zustand";
import { syncFileSystem } from "../services";

export interface ErrorMessage {
  message: string;
  code: string;
  number: number;
  severity: "error" | "warning" | "info";
}

interface ChatFileState {
  files: Record<string, string>;
  oldFiles: Record<string, string>;
  isFirstSend: Record<string, boolean>;
  isUpdateSend: Record<string, boolean>;
  selectedPath: string;
  projectRoot: string;
}

interface FileStore {
  chatStates: Record<string, ChatFileState>;
  currentChatId: string | null;
  errors: ErrorMessage[];
  addError: (error: ErrorMessage) => void;
  removeError: (index: number) => void;
  clearErrors: () => void;
  setCurrentChat: (chatId: string) => void;
  clearChat: (chatId: string) => void;
  setIsFirstSend: () => void;
  setIsUpdateSend: () => void;
  setOldFiles: (files: Record<string, string>) => void;
  setEmptyFiles: () => void;
  getCurrentState: () => ChatFileState;
  addFile: (
    path: string,
    content: string,
    syncFileClose?: boolean,
    number?: number
  ) => Promise<void>;
  getContent: (path: string) => string;
  updateContent: (path: string, content: string, syncFileClose?: boolean, closeUpdate?: boolean) => Promise<void>;
  renameFile: (oldPath: string, newPath: string) => Promise<void>;
  deleteFile: (path: string) => Promise<void>;
  createFolder: (path: string) => Promise<void>;
  getFiles: () => string[];
  setFiles: (files: Record<string, string>) => Promise<void>;
  setSelectedPath: (path: string) => void;
  setProjectRoot: (path: string) => void;
  getCurrentFiles: () => Record<string, string>;
  getCurrentSelectedPath: () => string;
  getCurrentProjectRoot: () => string;
}

const createInitialChatState = (): ChatFileState => ({
  files: {},
  oldFiles: {},
  isFirstSend: {},
  isUpdateSend: {},
  selectedPath: '',
  projectRoot: '',
});

export const useFileStore = create<FileStore>((set, get) => ({
  chatStates: {},
  currentChatId: null,
  errors: [],
  addError: (error) => {
    if (window.isLoading) {
      return;
    }
    if (get().errors.some((e) => e.code === error.code)) {
      const index = get().errors.findIndex((e) => e.code === error.code);
      get().errors[index].number++;
      return;
    }

    set((state) => ({
      errors: [error, ...state.errors.slice(0, 3)],
    }));
  },
  removeError: (index) =>
    set((state) => ({
      errors: state.errors.filter((_, i) => i !== index),
    })),
  clearErrors: () => set({ errors: [] }),

  setCurrentChat: (chatId: string) => {
    set({ currentChatId: chatId });
  },

  clearChat: (chatId: string) => {
    set((state) => {
      const newChatStates = { ...state.chatStates };
      delete newChatStates[chatId];
      return { chatStates: newChatStates };
    });
  },

  setIsFirstSend: () => {
    const chatId = get().currentChatId;
    if (!chatId) return;
    set((state) => {
      const currentState = state.chatStates[chatId] || createInitialChatState();
      return {
        chatStates: {
          ...state.chatStates,
          [chatId]: { ...currentState, isFirstSend: {} },
        },
      };
    });
  },

  setIsUpdateSend: () => {
    const chatId = get().currentChatId;
    if (!chatId) return;
    set((state) => {
      const currentState = state.chatStates[chatId] || createInitialChatState();
      return {
        chatStates: {
          ...state.chatStates,
          [chatId]: { ...currentState, isUpdateSend: {} },
        },
      };
    });
  },

  setOldFiles: (oldFiles: Record<string, string>) => {
    const chatId = get().currentChatId;
    if (!chatId) return;
    set((state) => {
      const currentState = state.chatStates[chatId] || createInitialChatState();
      return {
        chatStates: {
          ...state.chatStates,
          [chatId]: { ...currentState, oldFiles },
        },
      };
    });
  },

  setEmptyFiles: () => {
    const chatId = get().currentChatId;
    if (!chatId) return;
    set((state) => {
      const currentState = state.chatStates[chatId] || createInitialChatState();
      return {
        chatStates: {
          ...state.chatStates,
          [chatId]: { ...currentState, files: {}, isFirstSend: {}, isUpdateSend: {} },
        },
      };
    });
  },

  getCurrentState: () => {
    const chatId = get().currentChatId;
    return (chatId && get().chatStates[chatId]) || createInitialChatState();
  },

  addFile: async (path, content, syncFileClose?: boolean) => {
    const chatId = get().currentChatId;
    if (!chatId) return;

    set((state) => {
      const currentState = state.chatStates[chatId] || createInitialChatState();
      return {
        chatStates: {
          ...state.chatStates,
          [chatId]: {
            ...currentState,
            files: { ...currentState.files, [path]: content },
            isFirstSend: { ...currentState.isFirstSend, [path]: true },
          },
        },
      };
    });
    await syncFileSystem(syncFileClose);
  },

  getContent: (path) => {
    const chatId = get().currentChatId;
    if (!chatId) return "";
    return get().chatStates[chatId]?.files[path] || "";
  },

  updateContent: async (path, content, syncFileClose?: boolean, closeUpdateChatLog?: boolean) => {
    const chatId = get().currentChatId;
    if (!chatId) return;

    set((state) => {
      const currentState = state.chatStates[chatId] || createInitialChatState();
      return {
        chatStates: {
          ...state.chatStates,
          [chatId]: {
            ...currentState,
            files: { ...currentState.files, [path]: content },
            isUpdateSend: closeUpdateChatLog ? {} : { 
              ...currentState.isUpdateSend, 
              [path]: !currentState.isFirstSend[path] 
            },
          },
        },
      };
    });
    await syncFileSystem(syncFileClose);
  },

  renameFile: async (oldPath, newPath) => {
    const chatId = get().currentChatId;
    if (!chatId) return;

    set((state) => {
      const currentState = state.chatStates[chatId] || createInitialChatState();
      const files = { ...currentState.files };
      const content = files[oldPath];
      if (content !== undefined) {
        delete files[oldPath];
        files[newPath] = content;
        return {
          chatStates: {
            ...state.chatStates,
            [chatId]: { ...currentState, files },
          },
        };
      }
      return state;
    });
    await syncFileSystem();
  },

  deleteFile: async (path) => {
    const chatId = get().currentChatId;
    if (!chatId) return;

    set((state) => {
      const currentState = state.chatStates[chatId] || createInitialChatState();
      const files = { ...currentState.files };
      delete files[path];
      const prefix = path.endsWith("/") ? path : `${path}/`;
      Object.keys(files).forEach((filePath) => {
        if (filePath.startsWith(prefix)) {
          delete files[filePath];
        }
      });
      return {
        chatStates: {
          ...state.chatStates,
          [chatId]: { ...currentState, files },
        },
      };
    });
    await syncFileSystem();
  },

  createFolder: async (path) => {
    const chatId = get().currentChatId;
    if (!chatId) return;

    set((state) => {
      const currentState = state.chatStates[chatId] || createInitialChatState();
      const folderPath = path.endsWith("/") ? path : `${path}/`;
      if (Object.keys(currentState.files).some((file) => file.startsWith(folderPath))) {
        return state;
      }
      return {
        chatStates: {
          ...state.chatStates,
          [chatId]: {
            ...currentState,
            files: { ...currentState.files, [`${folderPath}index.tsx`]: "" },
          },
        },
      };
    });
    await syncFileSystem();
  },

  setFiles: async (files: Record<string, string>) => {
    const chatId = get().currentChatId;
    if (!chatId) return;

    set((state) => {
      const currentState = state.chatStates[chatId] || createInitialChatState();
      return {
        chatStates: {
          ...state.chatStates,
          [chatId]: { ...currentState, files },
        },
      };
    });
    await syncFileSystem();
  },

  getFiles: () => {
    const chatId = get().currentChatId;
    if (!chatId) return [];
    return Object.keys(get().chatStates[chatId]?.files || {});
  },

  setSelectedPath: (path: string) => {
    const chatId = get().currentChatId;
    if (!chatId) return;

    set((state) => {
      const currentState = state.chatStates[chatId] || createInitialChatState();
      return {
        chatStates: {
          ...state.chatStates,
          [chatId]: { ...currentState, selectedPath: path },
        },
      };
    });
  },

  setProjectRoot: (path: string) => {
    const chatId = get().currentChatId;
    if (!chatId) return;

    set((state) => {
      const currentState = state.chatStates[chatId] || createInitialChatState();
      return {
        chatStates: {
          ...state.chatStates,
          [chatId]: { ...currentState, projectRoot: path },
        },
      };
    });
  },

  getCurrentFiles: () => {
    const chatId = get().currentChatId;
    if (!chatId) return {};
    return get().chatStates[chatId]?.files || {};
  },

  getCurrentSelectedPath: () => {
    const chatId = get().currentChatId;
    if (!chatId) return '';
    return get().chatStates[chatId]?.selectedPath || '';
  },

  getCurrentProjectRoot: () => {
    const chatId = get().currentChatId;
    if (!chatId) return '';
    return get().chatStates[chatId]?.projectRoot || '';
  },

}));
