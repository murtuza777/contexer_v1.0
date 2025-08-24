import { useTranslation } from "react-i18next";
import { Code2 } from "lucide-react";
import { useRef, useState } from "react";
import { ChatMode } from "../ChatInput";
import useChatModeStore from "@/stores/chatModeSlice";
import { UrlInputDialog } from "../UrlInputDialog";
import { Logo } from "@/components/Logo";

interface TipsProps {
  setInput: (s: string) => void;
  append: (message: { role: 'user' | 'assistant'; content: string }) => void;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSketchUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Tips = (props: TipsProps) => {
  const { handleFileSelect, setInput, append, handleSketchUpload } = props;
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sketchInputRef = useRef<HTMLInputElement>(null);
  const { mode, initOpen } = useChatModeStore();
  const [isUrlDialogOpen, setIsUrlDialogOpen] = useState(false);

  const handleUrlSubmit = (url: string): void => {
    append({
      role: "user",
      content: `#${url}`,
    });
  };

  // Create a simple upload icon component since lucide-react icons seem to have issues
  const UploadIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7,10 12,15 17,10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );

  const GlobeIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );

  return (
    <div className="flex flex-col items-center gap-4 text-gray-400">
      {initOpen ? (
        <div className="flex flex-col w-full max-w-3xl gap-8 p-8 mx-auto">
          <div className="space-y-4 text-center justify-between items-center flex flex-col">
            <Logo />
            <h1 className="mb-6 font-bold text-neon-green text-7xl animate-neon-pulse">
              {t("chat.tips.title")}
            </h1>

            <p className="text-lg text-neon-cyan">
              you can generate java python js
            </p>
          </div>

          <div className="flex flex-col gap-6">
            {mode === ChatMode.Builder && (
              <div className="grid grid-cols-2 gap-4">
                <button className="w-full p-4 transition-all duration-300 border-2 border-neon-green/30 rounded-lg bg-card-bg hover:bg-neon-green/10 hover:border-neon-green/50 transform hover:scale-105 shadow-lg hover:shadow-neon-green/25">
                  <div className="flex items-center gap-3 text-neon-green">
                    <UploadIcon />
                    <span className="text-sm">
                      {t("chat.tips.uploadSketch")}
                    </span>
                  </div>
                </button>
                <button
                  className="w-full p-4 transition-all duration-300 border-2 border-neon-green/30 rounded-lg bg-card-bg hover:bg-neon-green/10 hover:border-neon-green/50 transform hover:scale-105 shadow-lg hover:shadow-neon-green/25"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="flex items-center gap-3 text-neon-green">
                    <UploadIcon />
                    <span className="text-sm">{t("chat.tips.uploadImg")}</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col w-full gap-2 p-4 transition-all duration-300 border-2 border-neon-green/30 rounded-lg bg-card-bg hover:bg-neon-green/5 hover:border-neon-green/50 shadow-lg hover:shadow-neon-green/25">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-neon-blue" />
            <span className="font-medium text-neon-green">
              {t("chat.tips.title")}
            </span>
          </div>
          <p className="text-sm text-gray-300">
            {t("chat.tips.description")}
          </p>
          <div className="flex flex-col gap-2 mt-2">
            
            <div className="flex  gap-2">
              <div
                className="flex items-center gap-2 mt-2 mr-4 text-xs text-gray-400 transition-all duration-300 cursor-pointer hover:text-neon-green hover:bg-neon-green/10 rounded-lg px-2 py-1"
                onClick={() => {
                  fileInputRef.current?.click();
                }}
              >
                <UploadIcon />
                <span className="text-sm">{t("chat.tips.uploadImg")}</span>
              </div>
              <div
                className="flex items-center gap-2 mt-2 text-xs text-gray-400 transition-all duration-300 cursor-pointer hover:text-neon-cyan hover:bg-neon-cyan/10 rounded-lg px-2 py-1"
                onClick={() => setIsUrlDialogOpen(true)}
              >
                <GlobeIcon />
                <span className="text-sm">{t("chat.tips.uploadWebsite")}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        className="hidden"
        multiple
        accept="image/*"
      />
      
      <input
        ref={sketchInputRef}
        type="file"
        onChange={handleSketchUpload}
        className="hidden"
        accept=".sketch"
      />

      <UrlInputDialog
        isOpen={isUrlDialogOpen}
        onClose={() => setIsUrlDialogOpen(false)}
        onSubmit={handleUrlSubmit}
      />
    </div>
  );
  
};

export default Tips;
