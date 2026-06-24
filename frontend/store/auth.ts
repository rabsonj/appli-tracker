import { create } from "zustand";
import { persist } from "zustand/middleware";
import Cookies from "js-cookie";
import { User } from "@/types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
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
