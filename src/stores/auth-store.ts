import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthUser } from "@/features/auth/types";

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  login: (user: AuthUser, accessToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      login: (user, accessToken) => set({ user, accessToken }),
      logout: () => set({ user: null, accessToken: null }),
    }),
    { name: "auth-storage" },
  ),
);
