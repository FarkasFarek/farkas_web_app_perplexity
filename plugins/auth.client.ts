// ─── Auth Plugin (client-side only) ───────────────────────────────────────────
// A `.client.ts` suffix biztosítja, hogy csak a böngészőben fut,
// nem az edge/server oldalon — a Supabase session cookie-alapon
// kerül beolvasásra SSR során automatikusan a @nuxtjs/supabase modul által.
//
// Feladatok:
//   1. App indításakor beolvassa az aktuális session-t a Pinia store-ba
//   2. onAuthStateChange listener-t regisztrál — minden auth esemény
//      (login, logout, token refresh) automatikusan frissíti a store-t

export default defineNuxtPlugin(async () => {
  const client = useSupabaseClient()
  const authStore = useAuthStore()

  // ─── 1. Kezdeti session beolvasása ─────────────────────────────────────

  const {  { session } } = await client.auth.getSession()
  authStore.setUser(session?.user ?? null)

  // ─── 2. Auth state változások figyelése ──────────────────────────────
  // Eseménytípusok: SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED,
  //                 USER_UPDATED, PASSWORD_RECOVERY

  client.auth.onAuthStateChange((event, currentSession) => {
    authStore.setUser(currentSession?.user ?? null)

    // Token cserénél nincs szükség navigációra, csak logout-on
    if (event === 'SIGNED_OUT') {
      navigateTo('/login')
    }
  })
})
