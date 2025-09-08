import { create } from 'zustand';

export type TopFeature = 'chat' | 'context' | 'fixer' | 'visual';

type FeatureNavState = {
  active: TopFeature;
  setActive: (f: TopFeature) => void;
};

export const useFeatureNav = create<FeatureNavState>((set) => ({
  active: 'chat',
  setActive: (active) => set({ active }),
}));


