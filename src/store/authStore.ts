"use client";
import { create } from "zustand";
import { User, MeResponse } from "@/types";

interface AuthState {
  user: User | null;
  meData: MeResponse | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  setMeData: (data: MeResponse) => void;
  logout: () => void;
  initFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  meData: null,
  token: null,
  isAuthenticated: false,
  setAuth: (user, token) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("tuju_token", token);
    }
    set({ user, token, isAuthenticated: true });
  },
  setMeData: (data) => set({ meData: data }),
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("tuju_token");
    }
    set({ user: null, meData: null, token: null, isAuthenticated: false });
  },
  initFromStorage: () => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("tuju_token");
      if (token) set({ token, isAuthenticated: true });
    }
  },
}));
