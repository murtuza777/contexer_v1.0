import React from "react";
import classNames from "classnames";
import type { SendButtonProps } from "./types";
import { useTranslation } from "react-i18next";

export const SendButton: React.FC<SendButtonProps> = ({
  isLoading,
  isUploading,
  hasInput,
  hasUploadingImages,
  onClick,
  stop
}) => {
  const { t } = useTranslation();

  return (
    <button
      type="submit"
      onClick={(e) => {
        isLoading ? stop() : onClick(e);
      }}
      // disabled={(!hasInput && !hasUploadingImages) || isUploading}
      className={classNames(
        "p-2 rounded-lg transition-all duration-200 flex items-center gap-2",
        isLoading 
          ? "bg-red-500 hover:bg-red-600 text-white"
          : hasInput && !isUploading && !hasUploadingImages
            ? "bg-gradient-to-r from-[#1E90FF] to-[#000080] hover:from-[#4169E1] hover:to-[#000066] text-white shadow-md transition-all duration-300"
            : "bg-gray-100 dark:bg-gray-500/20 text-gray-400 dark:text-gray-500 cursor-not-allowed",
        isUploading && "opacity-50 cursor-not-allowed"
      )}
    >
      {isLoading ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          stroke="currentColor"
          className="w-4 h-4 text-white"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 4h4v16H6zM14 4h4v16h-4z"
          />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          className="w-4 h-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 12h14M12 5l7 7-7 7"
          />
        </svg>
      )}
    </button>
  );
};
