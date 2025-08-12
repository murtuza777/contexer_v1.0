import React, { useState } from 'react';
import { Sidebar } from '../Sidebar';
import classNames from 'classnames';

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
          "fixed left-4 bottom-4 z-[1000] w-8 h-8 flex items-center justify-center",
          "rounded-md transition-all duration-200",
          "bg-gray-800/70 hover:bg-gray-700 backdrop-blur-sm",
          "border border-gray-600/30",
          isOpen && "bg-gray-600"
        )}
        title="Menu"
      >
        {/* Square icon like Bolt's style */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className="text-gray-300"
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
          onChatSelect?.(uuid);
          setIsOpen(false);
        }}
      />

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-[998]"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default ChatHistorySlider;
