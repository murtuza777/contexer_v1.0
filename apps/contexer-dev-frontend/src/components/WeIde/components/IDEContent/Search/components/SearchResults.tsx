import { FileCode, FileText } from 'lucide-react';

import '../styles/search.css';
import { cn } from '@/utils/cn';

interface SearchMatch {
  path: string;
  matches: Array<{
    line: number;
    content: string;
    index: number;
  }>;
}

interface SearchResultsProps {
  results: SearchMatch[];
  currentMatchIndex: number;
  onFileSelect: (path: string, line: number) => void;
  className?: string;
}

export function SearchResults({ 
  results, 
  currentMatchIndex,
  onFileSelect, 
  className 
}: SearchResultsProps) {
  if (results.length === 0) return null;

  let matchCounter = 0;

  return (
    <div className={cn("mt-3 space-y-2 overflow-y-auto max-h-[calc(100vh-120px)]", className)}>
      {results.map((result) => (
        <div key={result.path} className="space-y-1">
          <div className="flex items-center text-sm px-3 py-2 text-neon-cyan bg-neon-green/5 rounded-lg border border-neon-green/20">
            {result.path.endsWith('.tsx') || result.path.endsWith('.ts') ? (
              <FileCode className="w-4 h-4 mr-2 flex-shrink-0 text-neon-green" />
            ) : (
              <FileText className="w-4 h-4 mr-2 flex-shrink-0 text-neon-cyan" />
            )}
            <span className="truncate font-medium">{result.path}</span>
          </div>
          {result.matches.map((match) => {
            const isCurrentMatch = matchCounter === currentMatchIndex;
            matchCounter++;
            
            return (
              <div
                key={`${match.line}-${match.index}`}
                onClick={() => onFileSelect(result.path, match.line)}
                className={cn(
                  "ml-8 text-sm cursor-pointer rounded-lg px-3 py-2 transition-all duration-300",
                  "text-gray-300 border border-transparent",
                  "hover:bg-neon-green/10 hover:border-neon-green/30 hover:text-neon-cyan",
                  isCurrentMatch && "bg-neon-green/20 border-neon-green/50 text-neon-green shadow-lg shadow-neon-green/25"
                )}
              >
                <div className="flex items-center space-x-3">
                  <span className="w-10 text-neon-cyan font-mono font-medium">{match.line}</span>
                  <span className="truncate">{match.content}</span>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}