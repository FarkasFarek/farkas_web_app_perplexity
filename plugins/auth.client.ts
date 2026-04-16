export default defineNuxtPlugin(async () => {
  const client = useSupabaseClient()
  const authStore = useAuthStore()

  // ─── 1. Kezdeti session beolvasása ─────────────────────────────────────
  const { data } = await client.auth.getSession()
  authStore.setUser(data.session?.user ?? null)

  // ─── 2. Auth state listener ─────────────────────────────────────────────
  client.auth.onAuthStateChange((_event, session) => {
    authStore.setUser(session?.user ?? null)
  })
})
