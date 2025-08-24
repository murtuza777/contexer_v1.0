import React from 'react';
import { create } from 'zustand';
import { createPortal } from 'react-dom';

type TopViewState = {
  views: Record<string, React.ReactNode>;
  show: (key: string, node: React.ReactNode) => void;
  hide: (key: string) => void;
  clear: () => void;
};

const useTopViewStore = create<TopViewState>((set) => ({
  views: {},
  show: (key, node) => set((s) => ({ views: { ...s.views, [key]: node } })),
  hide: (key) => set((s) => {
    const next = { ...s.views };
    delete next[key];
    return { views: next };
  }),
  clear: () => set({ views: {} }),
}));

export const TopView = {
  show(key: string, node: React.ReactNode) {
    useTopViewStore.getState().show(key, node);
  },
  hide(key: string) {
    useTopViewStore.getState().hide(key);
  },
  clear() {
    useTopViewStore.getState().clear();
  },
};

const OverlayRoot: React.FC = () => {
  const views = useTopViewStore((s) => s.views);
  if (!views || Object.keys(views).length === 0) return null;

  return (
    <div className="fixed inset-0 z-[100002] pointer-events-none">
      {Object.entries(views).map(([key, node]) => (
        <div key={key} className="pointer-events-auto">{node}</div>
      ))}
    </div>
  );
};

const TopViewContainer: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <>
      {children}
      {createPortal(<OverlayRoot />, document.body)}
    </>
  );
};

export default TopViewContainer;


