import React from 'react';

export const Loading: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[99999] pointer-events-none">
      <div className="absolute bottom-4 right-4 px-3 py-2 rounded-md bg-black/70 text-white text-xs flex items-center gap-2">
        <span className="inline-block w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
        Loading...
      </div>
    </div>
  );
};


