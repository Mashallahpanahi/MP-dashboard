// src/store/authStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// One year in milliseconds
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

export interface AuthUser {
  id: string;
  email: string;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  expiresAt: number | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  /** Returns a valid token or null (auto-clears if expired) */
  getToken: () => string | null;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      expiresAt: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        const response = await fetch(`${API_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          throw new Error("Invalid email or password");
        }

        const result = await response.json();

        // Backend response shape:
        // { success, message, data: { access_token, user: { id, email } } }
        const accessToken: string | undefined = result?.data?.access_token;
        const user: AuthUser | undefined = result?.data?.user;

        if (!accessToken || !user) {
          throw new Error("Invalid login response from server");
        }

        const expiresAt = Date.now() + ONE_YEAR_MS;

        set({
          token: accessToken,
          user,
          expiresAt,
          isAuthenticated: true,
        });
      },

      logout: () => {
        set({
          token: null,
          user: null,
          expiresAt: null,
          isAuthenticated: false,
        });
      },

      getToken: () => {
        const { token, expiresAt } = get();

        // No token at all
        if (!token) return null;

        // Token expired → auto logout
        if (expiresAt && Date.now() >= expiresAt) {
          get().logout();
          return null;
        }

        return token;
      },
    }),
    {
      name: "mp-auth-storage", // localStorage key
      storage: createJSONStorage(() => localStorage),
      // Persist everything we need
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        expiresAt: state.expiresAt,
        isAuthenticated: state.isAuthenticated,
      }),
      // On rehydrate, validate expiry
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        if (state.expiresAt && Date.now() >= state.expiresAt) {
          state.token = null;
          state.user = null;
          state.expiresAt = null;
          state.isAuthenticated = false;
        }
      },
    }
  )
);