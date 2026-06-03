import { create } from "zustand";
import { User } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  setAuth: (user, token) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("tuju_token", token);
    }
    set({ user, token, isAuthenticated: true });
  },
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("tuju_token");
    }
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
