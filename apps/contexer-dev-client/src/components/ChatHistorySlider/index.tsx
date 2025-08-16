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
      {/* Trigger Button - Square icon like Bolt's bottom-left */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={classNames(
          "fixed right-4 top-16 z-[1000] w-10 h-10 flex items-center justify-center",
          "rounded-xl transition-all duration-200 group",
          "bg-gray-800/80 hover:bg-gray-700 backdrop-blur-sm",
          "border border-gray-600/30 hover:border-gray-500/50",
          "shadow-lg hover:shadow-xl",
          isOpen && "bg-gray-600 scale-95"
        )}
        title="Chat History & Menu"
      >
        {/* Square icon like Bolt's style */}
        <svg
          width="18"
          height="18"
          viewBox="0 0 16 16"
          fill="none"
          className="text-gray-300 group-hover:text-gray-200 transition-colors"
        >
          <rect
            x="2"
            y="2"
            width="5"
            height="5"
            rx="1"
            fill="currentColor"
            opacity="0.8"
          />
          <rect
            x="9"
            y="2"
            width="5"
            height="5"
            rx="1"
            fill="currentColor"
            opacity="0.8"
          />
          <rect
            x="2"
            y="9"
            width="5"
            height="5"
            rx="1"
            fill="currentColor"
            opacity="0.8"
          />
          <rect
            x="9"
            y="9"
            width="5"
            height="5"
            rx="1"
            fill="currentColor"
            opacity="0.8"
          />
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
