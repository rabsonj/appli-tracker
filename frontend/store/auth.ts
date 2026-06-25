import { create } from "zustand";
import { persist } from "zustand/middleware";
import Cookies from "js-cookie";
import { User } from "@/types";

/**
 * Represents the authentication state of the application.
 */
interface AuthState {
  /** The current user. */
  user: User | null;
  /** The access token. */
  accessToken: string | null;
  /** The refresh token. */
  refreshToken: string | null;
  /**
   * Sets the authentication state.
   * @param user - The user to set.
   * @param accessToken - The access token to set.
   * @param refreshToken - The refresh token to set.
   */
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  /** Clears the authentication state. */
  clearAuth: () => void;
  /**
   * Checks if the user is authenticated.
   * @returns True if the user is authenticated, false otherwise.
   */
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,

      setAuth: (user, accessToken, refreshToken) => {
        Cookies.set("access_token", accessToken, { expires: 1 / 3 }); // 8 hours
        Cookies.set("user_role", user.role, { expires: 1 / 3 });
        set({ user, accessToken, refreshToken });
      },

      clearAuth: () => {
        Cookies.remove("access_token");
        Cookies.remove("user_role");
        set({ user: null, accessToken: null, refreshToken: null });
      },

      isAuthenticated: () => Boolean(get().accessToken),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);
