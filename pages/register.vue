<script setup lang="ts">
definePageMeta({
  middleware: 'guest',
  layout: false,
})

const supabase = useSupabaseClient()
const email     = ref('')
const password  = ref('')
const password2 = ref('')
const loading   = ref(false)
const error     = ref<string | null>(null)
const success   = ref(false)

async function handleRegister() {
  error.value = null

  if (password.value !== password2.value) {
    error.value = 'A két jelszó nem egyezik meg.'
    return
  }
  if (password.value.length < 8) {
    error.value = 'A jelszónak legalább 8 karakter hosszúnak kell lennie.'
    return
  }

  loading.value = true

  const { error: authError } = await supabase.auth.signUp({
    email:    email.value,
    password: password.value,
  })

  if (authError) {
    error.value = authError.message
  } else {
    success.value = true
  }

  loading.value = false
}
</script>

<template>
  <div class="rp-page">
    <div class="rp-card">

      <!-- Logó -->
      <div class="rp-logo" aria-hidden="true">
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

      <!-- Cím -->
      <h1 class="rp-title">Regisztráció</h1>

      <!-- Sikeres regisztráció -->
      <div v-if="success" class="rp-success" role="status">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
        <div>
          <p class="rp-success__title">Sikeres regisztráció!</p>
          <p class="rp-success__text">Kérjük erősítsd meg az e-mail címed a kiküldött levélben, majd <NuxtLink to="/login" class="rp-link">jelentkezz be</NuxtLink>.</p>
        </div>
      </div>

      <!-- Form -->
      <form v-else class="rp-form" @submit.prevent="handleRegister" novalidate>

        <div class="rp-field">
          <label for="email" class="rp-label">E-mail cím</label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            autocomplete="email"
            class="rp-input"
            placeholder="pelda@climahub.hu"
            :disabled="loading"
          />
        </div>

        <div class="rp-field">
          <label for="password" class="rp-label">Jelszó</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            autocomplete="new-password"
            class="rp-input"
            placeholder="Legalább 8 karakter"
            :disabled="loading"
          />
        </div>

        <div class="rp-field">
          <label for="password2" class="rp-label">Jelszó megerősítése</label>
          <input
            id="password2"
            v-model="password2"
            type="password"
            required
            autocomplete="new-password"
            class="rp-input"
            :disabled="loading"
          />
        </div>

        <p v-if="error" class="rp-error" role="alert">{{ error }}</p>

        <button type="submit" class="rp-submit" :disabled="loading">
          <template v-if="loading">
            <svg class="rp-spinner" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
              <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/>
            </svg>
            Regisztráció...
          </template>
          <template v-else>
            Fiók létrehozása
          </template>
        </button>

        <p class="rp-footer-text">
          Már van fiókod?
          <NuxtLink to="/login" class="rp-link">Jelentkezz be</NuxtLink>
        </p>

      </form>
    </div>
  </div>
</template>

<style scoped>
/* ── Oldal háttér ────────────────────────────────────────── */
.rp-page {
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
  background:
    radial-gradient(circle at top left, oklch(from var(--color-primary) l c h / 0.07), transparent 45%),
    var(--color-bg);
}

/* ── Kártya ──────────────────────────────────────────────── */
.rp-card {
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

/* ── Logó ────────────────────────────────────────────────── */
.rp-logo {
  display: flex;
  justify-content: center;
}

/* ── Cím ─────────────────────────────────────────────────── */
.rp-title {
  margin: 0;
  font-family: 'Instrument Serif', Georgia, serif;
  font-size: var(--text-xl);
  font-weight: 400;
  color: var(--color-text);
  text-align: center;
  line-height: 1.15;
}

/* ── Form ────────────────────────────────────────────────── */
.rp-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.rp-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.rp-label {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text);
}

.rp-input {
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
.rp-input::placeholder { color: var(--color-text-faint); }
.rp-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-highlight);
  outline: none;
}
.rp-input:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

/* ── Hibaüzenet ──────────────────────────────────────────── */
.rp-error {
  margin-top: var(--space-2);
  font-size: var(--text-sm);
  color: var(--color-error);
  max-width: none;
}

/* ── Submit ──────────────────────────────────────────────── */
.rp-submit {
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
.rp-submit:hover:not(:disabled) { background: var(--color-primary-hover); }
.rp-submit:disabled { opacity: 0.65; cursor: not-allowed; }

/* ── Spinner ─────────────────────────────────────────────── */
@keyframes rp-spin { to { transform: rotate(360deg); } }
.rp-spinner {
  animation: rp-spin 0.75s linear infinite;
  flex-shrink: 0;
}

/* ── Sikeres állapot ─────────────────────────────────────── */
.rp-success {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-4);
  background: var(--color-primary-highlight);
  border-radius: var(--radius-md);
  color: var(--color-primary);
}
.rp-success__title {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 var(--space-1);
  max-width: none;
}
.rp-success__text {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  margin: 0;
  max-width: none;
}

/* ── Footer link ─────────────────────────────────────────── */
.rp-footer-text {
  text-align: center;
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  max-width: none;
}
.rp-link {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 500;
}
.rp-link:hover { text-decoration: underline; }
</style>
