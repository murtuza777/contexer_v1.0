import React from 'react'
import { create } from 'zustand';
import weTerminal from '../components/WeIde/components/Terminal/utils/weTerminal';

interface TerminalState {
  isDarkMode: boolean;
  terminals: Map<string | null, weTerminal>;
  newTerminal: (callback?: Function) => void;
  getEndTerminal: () => weTerminal | undefined;
  resetTerminals: () => void;
  addTerminal: (container: React.RefObject<HTMLDivElement>) => Promise<weTerminal>;
  removeTerminal: (processId: string) => void;
  setTheme: (isDark: boolean) => void;
  getTerminal: (index: number) => weTerminal | undefined;
}


const useTerminalStore = create<TerminalState>((set, get) => ({
  isDarkMode: false,
  terminals: new Map(),

  resetTerminals: () => {
    get().terminals.forEach((terminal) => {
      terminal.destroy()
    })

    set({ terminals: new Map() });

    get().newTerminal()
  },

  getEndTerminal: () => {
    const terminals = get().terminals;
    const terminalArray = Array.from(terminals.values());
    return terminalArray[terminalArray.length - 1];
  },

  getTerminal: (index: number) => {
    const terminals = get().terminals;
    const terminalArray = Array.from(terminals.values());
    return terminalArray[index];
  },

  // Currently does not support illegal terminal registration from other places
  // When registering, must have clear ref hook to prevent unknown errors
  newTerminal: async (cb = () => { }) => {

    const ref = React.createRef<HTMLDivElement>()
    const t = await get().addTerminal(ref)

    cb(t)
  },

  // Add terminal
  // addTerminal: async (container: HTMLElement) => {
  addTerminal: async (containerRef: React.RefObject<HTMLDivElement>) => {

    // Instantiate a new terminal
    const terminal = new weTerminal(null);

    const processId = Math.random().toString(36).substr(2, 9);;
    // Initialize to get processId
    await terminal.initialize(containerRef.current, processId)

    terminal.setContainerRef(containerRef);

    const newTerminals = new Map(get().terminals); // Get current terminals
    newTerminals.set(processId, terminal); // Add new terminal

    set({ terminals: newTerminals }); // Update state

    return terminal;
  },

  // Remove terminal
  removeTerminal: (processId: string) => {
    const newTerminals = new Map(get().terminals); // Get current terminals

    const terminal = newTerminals.get(processId) as weTerminal

    terminal?.destroy()
    newTerminals.delete(processId); // Remove specified terminal

    set({ terminals: newTerminals }); // Update state
  },

  // Set theme
  setTheme: (isDark: boolean) => set({ isDarkMode: isDark }),
}));

export default useTerminalStore;