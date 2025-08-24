import { cn } from "@/utils/cn";
import { SearchBar } from "./components/SearchBar";
import { SearchResults } from "./components/SearchResults";
import { useFileSearch } from "./hooks/useFileSearch";
import "./styles/search.css";

interface SearchProps {
  onFileSelect: (path: string, line?: number) => void;
}

export function Search({ onFileSelect }: SearchProps) {
  const {
    searchResults,
    currentMatchIndex,
    totalMatches,
    handleSearch,
    navigateMatch,
  } = useFileSearch();

  return (
    <div
      className={cn(
        "h-full flex flex-col",
        "bg-card-bg dark:bg-card-bg",
        "text-white"
      )}
    >
      <div
        className={cn(
          "p-3",
          "border-b-2 border-neon-green/20",
          "bg-dark-bg dark:bg-dark-bg",
          "shadow-lg shadow-neon-green/10"
        )}
      >
        <SearchBar
          onSearch={handleSearch}
          totalResults={totalMatches}
          currentMatch={totalMatches > 0 ? currentMatchIndex + 1 : 0}
          onNavigate={navigateMatch}
        />
      </div>
      <div
        className={cn(
          "flex-1 overflow-hidden",
          "p-3",
          "bg-card-bg dark:bg-card-bg"
        )}
      >
        <SearchResults
          results={searchResults}
          currentMatchIndex={currentMatchIndex}
          onFileSelect={onFileSelect}
        />
      </div>
    </div>
  );
}
