import { ProjectTitle } from "./ProjectTitle";
import { HeaderActions } from "./HeaderActions";
import { useFeatureNav } from "@/stores/featureNavSlice";
import { FaCode } from "react-icons/fa6";

function Header() {
  return (
    <header className="min-h-12 flex items-center px-4 h-12 bg-white dark:bg-[#18181a] border-b border-gray-200 dark:border-[#333333]">
      {/* Logo in top-left */}
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 opacity-90 bg-gradient-to-br from-[#1E90FF] via-[#4169E1] to-[#000080] dark:from-[#1E90FF] dark:to-[#000080] rounded-lg flex items-center justify-center shadow-md">
          <FaCode className="text-[12px] text-white" />
        </div>
        <h1 className="opacity-90 text-[18px] font-bold bg-gradient-to-r from-[#1E90FF] via-[#4169E1] to-[#000080] dark:from-[#1E90FF] dark:to-[#000080] bg-clip-text text-transparent">
          Contexer
        </h1>
      </div>
      
      {/* Features in the middle */}
      <div className="flex-1 flex justify-center">
        <TopNavButtons />
      </div>
      
      {/* Actions on the right */}
      <div className="flex items-center">
        <HeaderActions />
      </div>
    </header>
  );
}

export default Header;

function TopNavButtons() {
  const { active, setActive } = useFeatureNav();
  const btn = (key: Parameters<typeof setActive>[0], label: string) => (
    <button
      key={key}
      onClick={() => setActive(key)}
      className={
        `px-3 py-1.5 rounded-md text-xs border transition-colors ` +
        (active === key
          ? 'bg-[#1E90FF] text-white border-[#1E90FF]'
          : 'bg-white dark:bg-[#111] text-[#333] dark:text-gray-200 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-[#222]')
      }
    >
      {label}
    </button>
  );
  return (
    <div className="flex items-center gap-2">
      {btn('chat', 'Chat/Builder')}
      {btn('context', 'Context Composer')}
      {btn('observer', 'Visual Observer')}
      {btn('fixer', 'Error Fixer')}
    </div>
  );
}
