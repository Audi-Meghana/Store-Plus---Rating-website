import { useState, useEffect } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const useAuthStore = create(
  persist(
    (set) => ({
      user:            null,
      token:           null,
      isAuthenticated: false,

      setAuth: (user, token) => {
        localStorage.setItem("accessToken", token);
        set({ user, token, isAuthenticated: true });
      },

      // ✅ Instant sync logout — clears state immediately, no API call here
      logout: () => {
        localStorage.removeItem("accessToken");
        set({ user: null, token: null, isAuthenticated: false });
      },

      updateUser: (updatedUser) =>
        set((state) => ({ user: { ...state.user, ...updatedUser } })),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user:            state.user,
        token:           state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export const useHydrated = () => {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { setHydrated(true); }, []);
  return hydrated;
};

export default useAuthStore;