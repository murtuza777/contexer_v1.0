import { ProjectTitle } from "./ProjectTitle";
import { HeaderActions } from "./HeaderActions";
import { useFeatureNav } from "@/stores/featureNavSlice";
import LogoMark from "@/components/LogoMark";

function Header() {
  const { active } = useFeatureNav();
  
  return (
    <header className="min-h-16 flex items-center px-6 h-16 bg-dark-bg dark:bg-darker-bg border-b-2 border-neon-green/20 backdrop-blur-sm shadow-lg shadow-neon-green/10">
      {/* Logo in top-left */}
      <div className="flex items-center gap-4">
        <div className="relative group">
          <LogoMark className="w-8 h-8 opacity-90 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110" />
        </div>
        
        {/* Project Title */}
        <ProjectTitle />
      </div>

      {/* Center - Feature Navigation */}
      <div className="flex-1 flex justify-center">
        <div className="flex items-center space-x-1 bg-gray-800/50 rounded-lg p-1 backdrop-blur-sm">
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              active === 'chat' 
                ? 'bg-neon-green text-black shadow-lg shadow-neon-green/30' 
                : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            Chat
          </button>
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              active === 'builder' 
                ? 'bg-neon-green text-black shadow-lg shadow-neon-green/30' 
                : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            Builder
          </button>
        </div>
      </div>

      {/* Right side - Header Actions */}
      <div className="flex items-center gap-4">
        <HeaderActions />
      </div>
    </header>
  );
}

export default Header;