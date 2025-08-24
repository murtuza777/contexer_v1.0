import { ProjectTitle } from "./ProjectTitle";
import { HeaderActions } from "./HeaderActions";
import { useFeatureNav } from "@/stores/featureNavSlice";
import LogoMark from "@/components/LogoMark";

function Header() {
  return (
    <header className="min-h-16 flex items-center px-6 h-16 bg-dark-bg dark:bg-darker-bg border-b-2 border-neon-green/20 backdrop-blur-sm shadow-lg shadow-neon-green/10">
      {/* Logo in top-left */}
      <div className="flex items-center gap-4">
        <div className="relative group">
          <LogoMark className="w-8 h-8 opacity-90 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110" />
          <div className="absolute inset-0 w-8 h-8 rounded-full bg-neon-green/20 opacity-0 group-hover:opacity-100 transition-all duration-300 blur-xl"></div>
        </div>
        <h1 className="opacity-90 text-xl font-bold bg-gradient-to-r from-neon-green via-neon-cyan to-neon-blue bg-clip-text text-transparent animate-gradient-x">
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
        `px-6 py-3 rounded-xl text-sm font-medium border-2 transition-all duration-300 transform hover:scale-105 shadow-lg ` +
        (active === key
          ? 'bg-gradient-to-r from-neon-green to-neon-blue text-black border-neon-green/50 shadow-neon-green/25'
          : 'bg-card-bg text-white border-gray-700 hover:border-neon-green/30 hover:bg-neon-green/5 hover:shadow-neon-green/10')
      }
    >
      {label}
    </button>
  );
  return (
    <div className="flex items-center gap-3">
      {btn('chat', 'Chat/Builder')}
      {btn('context', 'Context Composer')}
      {btn('observer', 'Visual Observer')}
      {btn('fixer', 'Error Fixer')}
    </div>
  );
}
