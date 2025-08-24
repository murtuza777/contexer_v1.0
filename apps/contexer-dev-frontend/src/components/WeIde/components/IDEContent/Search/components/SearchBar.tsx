import { useState, useRef } from 'react';
import { Search, X, ArrowUp, ArrowDown } from 'lucide-react';

import '../styles/search.css';
import { useTranslation } from "react-i18next";
import { cn } from '@/utils/cn';

interface SearchBarProps {
  onSearch: (query: string) => void;
  totalResults: number;
  currentMatch: number;
  onNavigate: (direction: 'prev' | 'next') => void;
  className?: string;
}

export function SearchBar({ 
  onSearch, 
  totalResults, 
  currentMatch, 
  onNavigate,
  className 
}: SearchBarProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClear = () => {
    setQuery('');
    onSearch('');
    inputRef.current?.focus();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        onNavigate('prev');
      } else {
        onNavigate('next');
      }
    }
  };

  return (
    <div className={cn("flex items-center space-x-3", className)}>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neon-green" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={t("editor.search_in_files")}
          className="w-full h-9 pl-10 pr-24 text-sm rounded-xl bg-card-bg text-white border-2 border-gray-700 focus:border-neon-green focus:ring-2 focus:ring-neon-green/20 outline-none placeholder-gray-400 transition-all duration-300"
        />
        {query && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-2">
            {totalResults > 0 && (
              <span className="text-xs text-neon-cyan font-medium">
                {currentMatch} of {totalResults}
              </span>
            )}
            <div className="flex items-center space-x-1">
              <button
                onClick={() => onNavigate('prev')}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-neon-green/20 hover:text-neon-green transition-all duration-300 transform hover:scale-110"
                title="Previous match (Shift+Enter)"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <button
                onClick={() => onNavigate('next')}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-neon-green/20 hover:text-neon-green transition-all duration-300 transform hover:scale-110"
                title="Next match (Enter)"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={handleClear}
              className="p-1.5 rounded-lg text-gray-400 hover:bg-neon-green/20 hover:text-neon-green transition-all duration-300 transform hover:scale-110"
              title="Clear"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}