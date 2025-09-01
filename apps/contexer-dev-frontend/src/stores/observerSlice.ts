import { create } from 'zustand';

interface ObserverState {
  progress: number;
  errors: any[];
  setProgress: (progress: number) => void;
  addError: (error: any) => void;
  clearErrors: () => void;
}

const useObserverStore = create<ObserverState>((set) => ({
  progress: 0,
  errors: [],
  setProgress: (progress) => set({ progress }),
  addError: (error) => set((state) => ({ errors: [...state.errors, error] })),
  clearErrors: () => set({ errors: [] }),
}));

export default useObserverStore;
