import { useFileStore } from "@/components/WeIde/stores/fileStore";
import { FolderTree } from "lucide-react";
import { useTranslation } from "react-i18next";

export function Header() {
  const { setFiles, setIsFirstSend, setIsUpdateSend } = useFileStore();
  const { t } = useTranslation();
  const handleClearAll = () => {
    setFiles({});
    setIsFirstSend();
    setIsUpdateSend();
  };

  return (
    <div className="flex items-center justify-between">
      <h2 className="text-sm uppercase font-bold mb-2 flex items-center text-neon-green select-none">
        <FolderTree className="w-5 h-5 mr-2 text-neon-green" /> {t("explorer.explorer")}
      </h2>
      <div onClick={handleClearAll} className="flex mb-2">
        <span className="text-xs text-neon-cyan cursor-pointer hover:text-neon-green transition-colors duration-300 font-medium">
          {t("explorer.clear_all")}
        </span>
      </div>
    </div>
  );
}
