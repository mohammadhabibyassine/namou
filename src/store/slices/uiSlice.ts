import { StateCreator } from "zustand";

export type ThemeMode = "light" | "dark" | "system";

export interface UiSlice {
  themeMode: ThemeMode;
  isSidebarOpen: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
}

export const createUiSlice: StateCreator<UiSlice, [], [], UiSlice> = (set) => ({
  themeMode: "system",
  isSidebarOpen: false,

  setThemeMode: (themeMode) => set({ themeMode }),
  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),
});
