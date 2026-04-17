<script setup lang="ts">
definePageMeta({
  middleware: 'guest',
})

const supabase = useSupabaseClient()
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref<string | null>(null)

async function handleLogin() {
  loading.value = true
  error.value = null

  const { error: authError } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  })

  if (authError) {
    error.value = authError.message
  } else {
    await navigateTo('/dashboard')
  }

  loading.value = false
}
</script>

<template>
  <main class="login-page">
    <div class="login-card">

      <!-- Logo -->
      <div class="login-logo" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 136 32" width="136" height="32" fill="none">
          <path d="M4 20 Q8 11 12 20 Q16 29 20 20 Q24 11 28 20"
            stroke="var(--color-primary)" stroke-width="2.5"
            stroke-linecap="round" stroke-linejoin="round" />
          <text x="36" y="22"
            style="font-family: var(--font-body); font-size: 17px; font-weight: 700; letter-spacing: -0.4px;"
            fill="var(--color-text)">Clima</text>
          <text x="84" y="22"
            style="font-family: var(--font-body); font-size: 17px; font-weight: 400; letter-spacing: -0.2px;"
            fill="var(--color-primary)">Hub</text>
        </svg>
      </div>

      <h1 class="login-title">Bejelentkezés</h1>
      <p class="login-sub">Klíma és hőszivattyú szakmai portfólió</p>

      <form class="login-form" @submit.prevent="handleLogin">
        <div class="field">
          <label for="email" class="field__label">E-mail cím</label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            autocomplete="email"
            class="field__input"
            placeholder="pelda@climahub.hu"
          />
        </div>

        <div class="field">
          <label for="password" class="field__label">Jelszó</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            autocomplete="current-password"
            class="field__input"
          />
        </div>

        <p v-if="error" class="login-error" role="alert">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          {{ error }}
        </p>

        <button
          type="submit"
          :disabled="loading"
          class="login-submit"
        >
          {{ loading ? 'Belépés...' : 'Belépés' }}
        </button>
      </form>

    </div>
  </main>
</template>

<style scoped>
.login-page {
  display: flex;
  min-height: 100dvh;
  align-items: center;
  justify-content: center;
  padding: var(--space-6);
  background: var(--color-bg);
}

.login-card {
  width: 100%;
  max-width: 384px;
  padding: var(--space-10);
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  box-shadow: var(--shadow-md);
}

.login-logo {
  display: flex;
  justify-content: center;
  margin-bottom: var(--space-8);
}

.login-title {
  font-size: var(--text-xl);
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.02em;
  color: var(--color-text);
  text-align: center;
  margin-bottom: var(--space-1);
}

.login-sub {
  font-size: var(--text-sm);
  color: var(--color-text-faint);
  text-align: center;
  margin-bottom: var(--space-8);
  max-width: none;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

/* Field */
.field {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}
.field__label {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-muted);
}
.field__input {
  width: 100%;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-surface-2);
  padding: 0.55rem var(--space-3);
  font-size: var(--text-sm);
  color: var(--color-text);
  transition:
    border-color var(--transition-ui),
    box-shadow var(--transition-ui);
  outline: none;
}
.field__input::placeholder { color: var(--color-text-faint); }
.field__input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-ring);
}

/* Error */
.login-error {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  border-radius: var(--radius-md);
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-sm);
  color: var(--color-error);
  background: var(--color-error-subtle);
  border: 1px solid color-mix(in oklch, var(--color-error) 20%, transparent);
  max-width: none;
}

/* Submit CTA */
.login-submit {
  width: 100%;
  padding: 0.65rem var(--space-4);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 600;
  color: #fff;
  background: var(--color-primary);
  border: none;
  cursor: pointer;
  transition:
    background var(--transition-ui),
    box-shadow var(--transition-ui),
    transform var(--transition-ui);
}
.login-submit:hover:not(:disabled) {
  background: var(--color-primary-hover);
  box-shadow: 0 4px 12px var(--color-primary-ring);
  transform: translateY(-1px);
}
.login-submit:active:not(:disabled) {
  background: var(--color-primary-active);
  transform: translateY(0);
  box-shadow: none;
}
.login-submit:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
</style>
