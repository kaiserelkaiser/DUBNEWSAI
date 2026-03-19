"use client"

import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

import type { CurrentUser } from "@/types"

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  user: CurrentUser | null
  hydrated: boolean
  setHydrated: () => void
  setTokens: (accessToken: string, refreshToken: string) => void
  setUser: (user: CurrentUser | null) => void
  setAuth: (user: CurrentUser, accessToken: string, refreshToken: string) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      hydrated: false,
      setHydrated: () => set({ hydrated: true }),
      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
      setUser: (user) => set({ user }),
      setAuth: (user, accessToken, refreshToken) =>
        set({
          user,
          accessToken,
          refreshToken
        }),
      clearAuth: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null
        })
    }),
    {
      name: "dubnewsai-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated()
      }
    }
  )
)
