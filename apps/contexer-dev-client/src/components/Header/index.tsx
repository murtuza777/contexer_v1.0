import { ProjectTitle } from "./ProjectTitle";
import { HeaderActions } from "./HeaderActions";
import { FaCode } from "react-icons/fa6";

function Header() {
  return (
    <header className="min-h-12 flex items-center px-4 h-12 bg-white dark:bg-[#18181a] border-b border-gray-200 dark:border-[#333333]">
      <div className="flex-1">
        <ProjectTitle />
      </div>
      <div className="w-6 h-6 opacity-90 bg-gradient-to-br from-[#1E90FF] via-[#4169E1] to-[#000080] dark:from-[#1E90FF] dark:to-[#000080] rounded-lg flex items-center justify-center shadow-md">
        <FaCode className="text-[12px] text-white" />
      </div>
      <h1 className="ml-2 opacity-90 text-[18px] font-bold bg-gradient-to-r from-[#1E90FF] via-[#4169E1] to-[#000080] dark:from-[#1E90FF] dark:to-[#000080] bg-clip-text text-transparent">
                        Contexer
      </h1>
      <div className="flex-1 flex justify-end">
        <HeaderActions />
      </div>
    </header>
  );
}

export default Header;
