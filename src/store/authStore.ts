/**
 * Authentication store using Zustand with persistence.
 * Session lasts for 35 days from login, then auto‑logout.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// --- Types ---------------------------------------------------------
interface AuthState {
  isAuthenticated: boolean;
  user: { name: string; email: string } | null;
  expiryTimestamp: number | null; // when this session expires (milliseconds)
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => void; // verify expiry on app load
}

// --- Constants ----------------------------------------------------
const SESSION_DAYS = 35;
const SESSION_MS = SESSION_DAYS * 24 * 60 * 60 * 1000; // 35 days in ms

// --- Store creation ------------------------------------------------
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Default state (logged out)
      isAuthenticated: false,
      user: null,
      expiryTimestamp: null,

      /**
       * Login function – accepts any email/password (mock).
       * Sets authenticated = true, stores user and expiry timestamp.
       * Replace with real API call later.
       */
      login: async (email, password) => {
        // Mock validation: just check that fields are not empty
        if (email && password) {
          const expiry = Date.now() + SESSION_MS;
          set({
            isAuthenticated: true,
            user: { name: 'Admin', email },
            expiryTimestamp: expiry,
          });
        } else {
          throw new Error('Invalid credentials');
        }
      },

      /**
       * Logout – clears authentication state and removes stored data.
       */
      logout: () => {
        set({
          isAuthenticated: false,
          user: null,
          expiryTimestamp: null,
        });
        // Optionally clear the persisted key:
        // localStorage.removeItem('auth-storage');
      },

      /**
       * Check authentication status on app load.
       * If session exists but has expired, automatically log out.
       */
      checkAuth: () => {
        const { isAuthenticated, expiryTimestamp, logout } = get();
        if (isAuthenticated && expiryTimestamp) {
          const now = Date.now();
          if (now > expiryTimestamp) {
            // Session expired – log out
            logout();
          }
        }
      },
    }),
    {
      name: 'auth-storage', // key in localStorage
    }
  )
);