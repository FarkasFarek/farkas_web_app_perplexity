import type { User } from '@supabase/supabase-js'

// ─── Auth State ───────────────────────────────────────────────────────────────

export interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
  initialized: boolean
}

// ─── Credentials ──────────────────────────────────────────────────────────────

export interface LoginCredentials {
  email: string
  password: string
}

export type SignupCredentials = LoginCredentials

// ─── Auth Response ────────────────────────────────────────────────────────────

export interface AuthActionResult<T = unknown> {
   T | null
  error: string | null
}
