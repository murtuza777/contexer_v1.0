import React, { useState } from 'react';
import { Sidebar } from '../Sidebar';
import classNames from 'classnames';
import { eventEmitter } from '../AiChat/utils/EventEmitter';

interface ChatHistorySliderProps {
  onChatSelect?: (uuid: string) => void;
}

export const ChatHistorySlider: React.FC<ChatHistorySliderProps> = ({ onChatSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Trigger Button - Floating action button at bottom-right */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={classNames(
          "fixed right-6 bottom-6 z-[1000] w-12 h-12 flex items-center justify-center",
          "rounded-full transition-all duration-200 group",
          "bg-gray-800/90 hover:bg-gray-700 backdrop-blur-sm",
          "border border-gray-600/30 hover:border-gray-500/50",
          "shadow-lg hover:shadow-xl",
          isOpen && "bg-gray-600 scale-95"
        )}
        title="Chat History"
        aria-label="Open chat history"
      >
        {/* Chat/history icon */}
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          className="text-gray-300 group-hover:text-gray-200 transition-colors"
        >
          <path d="M21 12a9 9 0 1 0-3.34 6.97L21 21l-2.03-3.34A8.96 8.96 0 0 0 21 12Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Reuse existing Sidebar component */}
      <Sidebar
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        username=""
        onMouseEnter={() => {}}
        onMouseLeave={() => {}}
        onChatSelect={(uuid) => {
          // Call the provided callback if available
          if (onChatSelect) {
            onChatSelect(uuid);
          }
          // Also emit the event for other listeners
          eventEmitter.emit("chat:select", uuid);
          setIsOpen(false);
        }}
      />

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-[49]"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default ChatHistorySlider;
