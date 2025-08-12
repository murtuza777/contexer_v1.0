import React from 'react';
import { create } from 'zustand';

type ModalType = 'limit' | 'login' | null;

type LimitModalState = {
  isOpen: boolean;
  type: ModalType;
  openModal: (type: NonNullable<ModalType>) => void;
  closeModal: () => void;
};

export const useLimitModalStore = create<LimitModalState>((set) => ({
  isOpen: false,
  type: null,
  openModal: (type) => set({ isOpen: true, type }),
  closeModal: () => set({ isOpen: false, type: null }),
}));

type GlobalLimitModalProps = {
  onLogin?: () => void;
};

export const GlobalLimitModal: React.FC<GlobalLimitModalProps> = ({ onLogin }) => {
  const { isOpen, type, closeModal } = useLimitModalStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/50">
      <div className="w-full max-w-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a1c] p-4 shadow-xl">
        <div className="mb-2 text-sm font-medium text-gray-900 dark:text-gray-100">
          {type === 'limit' && 'Quota limit reached'}
          {type === 'login' && 'Authentication required'}
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-300 mb-4">
          {type === 'limit' && 'You have reached the usage limit. Please log in or upgrade to continue.'}
          {type === 'login' && 'Please log in to continue using Contexer.'}
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={closeModal}
            className="px-3 py-1.5 text-xs rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200"
          >
            Close
          </button>
          {onLogin && (
            <button
              onClick={() => {
                closeModal();
                onLogin();
              }}
              className="px-3 py-1.5 text-xs rounded bg-blue-600 hover:bg-blue-700 text-white"
            >
              Log in
            </button>
          )}
        </div>
      </div>
    </div>
  );
};


