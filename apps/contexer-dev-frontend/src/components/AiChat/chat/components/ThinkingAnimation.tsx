import React from 'react';
import { Zap, Sparkles } from 'lucide-react';

interface ThinkingAnimationProps {
  isVisible: boolean;
  message?: string;
}

export const ThinkingAnimation: React.FC<ThinkingAnimationProps> = ({ 
  isVisible, 
  message = "AI is thinking..." 
}) => {
  if (!isVisible) return null;

  return (
    <div className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-slate-900/90 to-slate-800/90 backdrop-blur-xl rounded-2xl border border-purple-500/20 shadow-2xl shadow-purple-500/10">
      {/* Animated brain icon */}
      <div className="relative">
        <Zap className="w-5 h-5 text-purple-400 animate-pulse" />
        <div className="absolute -top-1 -right-1">
          <Sparkles className="w-3 h-3 text-cyan-300 animate-ping" />
        </div>
      </div>

      {/* Thinking text with typing animation */}
      <div className="flex items-center gap-2">
        <span className="text-slate-300 font-mono text-sm">{message}</span>
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>

      {/* Animated gradient border */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 animate-pulse"></div>
    </div>
  );
};

export default ThinkingAnimation;
