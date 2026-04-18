<script setup lang="ts">
definePageMeta({
  middleware: 'guest',
  layout: false,
})

const supabase = useSupabaseClient()
const email    = ref('')
const password = ref('')
const loading  = ref(false)
const error    = ref<string | null>(null)

async function handleLogin() {
  loading.value = true
  error.value   = null

  const { error: authError } = await supabase.auth.signInWithPassword({
    email:    email.value,
    password: password.value,
  })

  if (authError) {
    error.value = authError.message
  } else {
    await navigateTo('/')
  }

  loading.value = false
}
</script>

<template>
  <div class="lp-page">
    <div class="lp-card">

      <div class="lp-logo" aria-hidden="true">
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

      <h1 class="lp-title">Bejelentkezés</h1>

      <form class="lp-form" @submit.prevent="handleLogin" novalidate>
        <div class="lp-field">
          <label for="email" class="lp-label">E-mail cím</label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            autocomplete="email"
            class="lp-input"
            placeholder="pelda@climahub.hu"
            :disabled="loading"
          />
        </div>

        <div class="lp-field">
          <label for="password" class="lp-label">Jelszó</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            autocomplete="current-password"
            class="lp-input"
            :disabled="loading"
          />
        </div>

        <p v-if="error" class="lp-error" role="alert">
          {{ error }}
        </p>

        <button type="submit" class="lp-submit" :disabled="loading">
          <template v-if="loading">
            <svg class="lp-spinner" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
              <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/>
            </svg>
            Belépés...
          </template>
          <template v-else>
            Belépés
          </template>
        </button>

        <p class="lp-footer-text">
          Nincs még fiókod?
          <NuxtLink to="/register" class="lp-link">Regisztrálj</NuxtLink>
        </p>
      </form>
    </div>
  </div>
</template>

<style scoped>
.lp-page {
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
  background:
    radial-gradient(circle at top left, oklch(from var(--color-primary) l c h / 0.07), transparent 45%),
    var(--color-bg);
}

.lp-card {
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

.lp-logo {
  display: flex;
  justify-content: center;
}

.lp-title {
  margin: 0;
  font-family: 'Instrument Serif', Georgia, serif;
  font-size: var(--text-xl);
  font-weight: 400;
  color: var(--color-text);
  text-align: center;
  line-height: 1.15;
}

.lp-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.lp-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.lp-label {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text);
}

.lp-input {
  width: 100%;
  padding: var(--space-2) var(--space-3);
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  color: var(--color-text);
  transition:
    border-color var(--transition-interactive),
    box-shadow var(--transition-interactive);
}
.lp-input::placeholder {
  color: var(--color-text-faint);
}
.lp-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-highlight);
  outline: none;
}
.lp-input:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.lp-error {
  margin-top: var(--space-2);
  font-size: var(--text-sm);
  color: var(--color-error);
  max-width: none;
}

.lp-submit {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  width: 100%;
  padding: var(--space-3) var(--space-4);
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
  transition: background var(--transition-interactive), opacity var(--transition-interactive);
}
.lp-submit:hover:not(:disabled) {
  background: var(--color-primary-hover);
}
.lp-submit:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.lp-footer-text {
  text-align: center;
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  max-width: none;
}

.lp-link {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 500;
}
.lp-link:hover {
  text-decoration: underline;
}

@keyframes lp-spin {
  to { transform: rotate(360deg); }
}
.lp-spinner {
  animation: lp-spin 0.75s linear infinite;
  flex-shrink: 0;
}
</style>
