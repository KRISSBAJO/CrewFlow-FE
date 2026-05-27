"use client";

import { create } from "zustand";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002/api";

type User = {
  id?: string;
  sub: string;
  tenantId: string;
  email: string;
  role: "PLATFORM_ADMIN" | "PLATFORM_SUPPORT" | "OWNER" | "MANAGER" | "STAFF";
};

type AuthState = {
  user: User | null;
  checked: boolean;
  setSession: (user: User) => void;
  setUser: (user: User | null) => void;
  hydrate: () => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuth = create<AuthState>()((set, get) => ({
  user: null,
  checked: false,
  setSession: (user) => set({ user, checked: true }),
  setUser: (user) => set({ user, checked: true }),
  hydrate: async () => {
    if (get().checked) return;
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        credentials: "include"
      });
      if (!response.ok) {
        set({ user: null, checked: true });
        return;
      }
      const data = (await response.json()) as { user: User };
      set({ user: data.user, checked: true });
    } catch {
      set({ user: null, checked: true });
    }
  },
  logout: async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include"
      });
    } finally {
      set({ user: null, checked: true });
    }
  }
}));
