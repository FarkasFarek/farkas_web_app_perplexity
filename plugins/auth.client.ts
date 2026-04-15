export default defineNuxtPlugin(async () => {
  const client = useSupabaseClient()
  const authStore = useAuthStore()

  // ─── 1. Kezdeti session beolvasása ─────────────────────────────────────
  const {  { session } } = await client.auth.getSession()
  authStore.setUser(session?.user ?? null)

  // ─── 2. Auth state listener ─────────────────────────────────────────────
  client.auth.onAuthStateChange((_event, session) => {
    authStore.setUser(session?.user ?? null)
  })
})
