import { defineStore } from 'pinia'
import type { User } from '@supabase/supabase-js'
import type { AuthState } from '~/types/auth'

// ─── Auth Store ──────────────────────────────────────────────────────────────
// Teljes auth state Pinia-ban kezelve. A useAuth composable ezen
// keresztül kommunikál; közvetlenül ne módosítsd külső komponensből.

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    loading: false,
    error: null,
    initialized: false,
  }),

  // ─── Getters ────────────────────────────────────────────────────────────

  getters: {
    isAuthenticated: (state): boolean => !!state.user,
    currentUser: (state): User | null => state.user,
    isInitialized: (state): boolean => state.initialized,
    role: (state): 'admin' | 'user' => {
      const appRole = state.user?.app_metadata?.role
      const userRole = state.user?.user_metadata?.role
      const normalizedRole = String(appRole ?? userRole ?? 'user').toLowerCase()

      return normalizedRole === 'admin' ? 'admin' : 'user'
    },
    isAdmin(): boolean {
      return this.role === 'admin'
    },
    isReadOnly(): boolean {
      return !this.isAdmin
    },
  },

  // ─── Actions ────────────────────────────────────────────────────────────

  actions: {
    setUser(user: User | null) {
      this.user = user
      this.initialized = true
    },

    setLoading(loading: boolean) {
      this.loading = loading
    },

    setError(error: string | null) {
      this.error = error
    },

    clearError() {
      this.error = null
    },

    reset() {
      this.user = null
      this.loading = false
      this.error = null
      // initialized marad true — az app már tudja, hogy nincs bejelentkezett user
    },
  },
})
