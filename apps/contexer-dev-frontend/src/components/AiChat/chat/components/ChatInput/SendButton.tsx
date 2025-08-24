import React from "react";
import classNames from "classnames";
import type { SendButtonProps } from "./types";
import { useTranslation } from "react-i18next";
import { ArrowRight, X, Zap } from "lucide-react";

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
      className={classNames(
        "relative w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-200",
        "border border-slate-600/30 hover:border-slate-500/50",
        isLoading 
          ? "bg-red-500/10 text-red-400 hover:bg-red-500/20"
          : hasInput && !isUploading && !hasUploadingImages
            ? "bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 hover:text-white"
            : "bg-slate-900/50 text-slate-600 cursor-not-allowed",
        isUploading && "opacity-50 cursor-not-allowed"
      )}
      disabled={(!hasInput && !hasUploadingImages) || isUploading}
    >
      {isLoading ? (
        <X className="w-4 h-4" />
      ) : (
        <ArrowRight className="w-4 h-4" />
      )}
    </button>
  );
};
