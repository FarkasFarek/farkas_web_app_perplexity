<script setup lang="ts">
import type { EmailOtpType } from '@supabase/supabase-js'

definePageMeta({
  layout: false,
})

const supabase = useSupabaseClient()
const route = useRoute()

const loading = ref(true)
const error = ref<string | null>(null)

async function handleConfirm() {
  error.value = null

  const accessToken = typeof route.query.access_token === 'string' ? route.query.access_token : null
  const refreshToken = typeof route.query.refresh_token === 'string' ? route.query.refresh_token : null
  const tokenHash = typeof route.query.token_hash === 'string' ? route.query.token_hash : null
  const type = typeof route.query.type === 'string' ? route.query.type : 'signup'

  try {
    if (accessToken && refreshToken) {
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      })

      if (sessionError) throw sessionError
    } else if (tokenHash) {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: type as EmailOtpType,
      })

      if (verifyError) throw verifyError
    } else {
      throw new Error('Hiányzó vagy érvénytelen hitelesítési paraméterek.')
    }

    await navigateTo('/')
  } catch (err: any) {
    error.value = err?.message ?? 'A hitelesítés nem sikerült.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void handleConfirm()
})
</script>

<template>
  <div class="cp-page">
    <div class="cp-card">
      <div class="cp-logo" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 148 32" width="148" height="32" fill="none">
          <svg x="0" y="4" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M2 16 Q5 9 8 16 Q11 23 14 16 Q17 9 20 16"
              stroke="var(--color-primary)"
              stroke-width="2.2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <text x="32" y="22"
            style="font-family: var(--font-body, sans-serif); font-size: 18px; font-weight: 700; letter-spacing: -0.4px;"
            fill="var(--color-text)">Clima</text>
          <text x="86" y="22"
            style="font-family: var(--font-body, sans-serif); font-size: 18px; font-weight: 400; font-style: italic;"
            fill="var(--color-primary)">Hub</text>
        </svg>
      </div>

      <h1 class="cp-title">Hitelesítés</h1>

      <div v-if="loading" class="cp-state" role="status" aria-live="polite">
        <svg class="cp-spinner" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
          <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/>
        </svg>
        <p class="cp-text">A megerősítés folyamatban van...</p>
      </div>

      <div v-else-if="error" class="cp-error-wrap" role="alert">
        <p class="cp-error-title">A hitelesítés nem sikerült</p>
        <p class="cp-error">{{ error }}</p>
        <NuxtLink to="/login" class="cp-link">Vissza a bejelentkezéshez</NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cp-page {
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
  background:
    radial-gradient(circle at top left, oklch(from var(--color-primary) l c h / 0.07), transparent 45%),
    var(--color-bg);
}

.cp-card {
  width: min(400px, 90vw);
  padding: var(--space-8);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.cp-logo {
  display: flex;
  justify-content: center;
}

.cp-title {
  margin: 0;
  text-align: center;
  font-family: 'Instrument Serif', Georgia, serif;
  font-size: var(--text-xl);
  font-weight: 400;
  color: var(--color-text);
}

.cp-state,
.cp-error-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  text-align: center;
}

.cp-text {
  margin: 0;
  font-size: var(--text-base);
  color: var(--color-text-muted);
}

.cp-error-title {
  margin: 0;
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-text);
}

.cp-error {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--color-error);
}

.cp-link {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 500;
}

.cp-link:hover {
  text-decoration: underline;
}

@keyframes cp-spin {
  to { transform: rotate(360deg); }
}

.cp-spinner {
  color: var(--color-primary);
  animation: cp-spin 0.75s linear infinite;
}
</style>
