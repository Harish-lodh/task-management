import { create } from "zustand";

export const useThemeStore = create((set) => ({
  darkMode: false,
  toggleDarkMode: () =>
    set((state) => ({ darkMode: !state.darkMode })),

  sidebarCollapsed: false,
  toggleSidebarCollapse: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
}));
