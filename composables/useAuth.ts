import type { LoginCredentials, SignupCredentials, AuthActionResult } from '~/types/auth'
import type { Session, User } from '@supabase/supabase-js'

// ─── useAuth ──────────────────────────────────────────────────────────────────
// Fő auth composable. Minden auth műveletet ezen keresztül végezz,
// ne hívd közvetlenül a Supabase client-et komponensekből.
//
// Használat:
//   const { login, signup, logout, user, isAuthenticated } = useAuth()

export const useAuth = () => {
  const client = useSupabaseClient()
  const authStore = useAuthStore()

  // ─── Login ───────────────────────────────────────────────────────────

  const login = async (
    credentials: LoginCredentials,
  ): Promise<AuthActionResult<{ user: User; session: Session }>> => {
    authStore.setLoading(true)
    authStore.clearError()

    const { data, error } = await client.auth.signInWithPassword(credentials)

    if (error) {
      authStore.setError(error.message)
      authStore.setLoading(false)
      return {  null, error: error.message }
    }

    authStore.setUser(data.user)
    authStore.setLoading(false)
    return {  { user: data.user, session: data.session }, error: null }
  }

  // ─── Signup ──────────────────────────────────────────────────────────

  const signup = async (
    credentials: SignupCredentials,
  ): Promise<AuthActionResult<{ user: User | null; session: Session | null }>> => {
    authStore.setLoading(true)
    authStore.clearError()

    const { data, error } = await client.auth.signUp(credentials)

    if (error) {
      authStore.setError(error.message)
      authStore.setLoading(false)
      return {  null, error: error.message }
    }

    // Ha email confirmáció szükséges, data.user létezik de session null
    if (data.user) {
      authStore.setUser(data.user)
    }

    authStore.setLoading(false)
    return {  { user: data.user, session: data.session }, error: null }
  }

  // ─── Logout ──────────────────────────────────────────────────────────

  const logout = async (): Promise<AuthActionResult<null>> => {
    authStore.setLoading(true)
    authStore.clearError()

    const { error } = await client.auth.signOut()

    if (error) {
      authStore.setError(error.message)
      authStore.setLoading(false)
      return {  null, error: error.message }
    }

    authStore.reset()
    await navigateTo('/login')
    return {  null, error: null }
  }

  // ─── Session perzisztálás ─────────────────────────────────────────────────
  // Manuálisan hívható, de általában a plugin kezeli automatikusan.

  const refreshSession = async (): Promise<AuthActionResult<Session>> => {
    const {  { session }, error } = await client.auth.getSession()

    if (error) {
      authStore.setError(error.message)
      return {  null, error: error.message }
    }

    authStore.setUser(session?.user ?? null)
    return {  session, error: null }
  }

  // ─── Reactive state ──────────────────────────────────────────────────────

  return {
    // Műveletek
    login,
    signup,
    logout,
    refreshSession,

    // Reaktive state — computed-ként érhető el, template-ben is működik
    user: computed(() => authStore.user),
    isAuthenticated: computed(() => authStore.isAuthenticated),
    loading: computed(() => authStore.loading),
    error: computed(() => authStore.error),
    initialized: computed(() => authStore.initialized),
  }
}
