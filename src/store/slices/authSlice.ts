import { StateCreator } from "zustand";
import { UserProfile } from "@/types/models/user.model";
import { LoginResult } from "@/types/api/auth.types";

export type AuthUser = UserProfile | LoginResult["user"];

export interface AuthSlice {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setUser: (user: AuthUser | null) => void;
  completeLogin: (auth: LoginResult) => void;
  logout: () => void;
}

export const createAuthSlice: StateCreator<AuthSlice, [], [], AuthSlice> = (
  set,
) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  completeLogin: (auth) => {
    set({
      user: auth.user,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  logout: () => {
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },
});
