<template>
  <div style="background: var(--color-bg); color: var(--color-text); min-height: 100dvh;">

    <!-- NAVBAR -->
    <header class="ch-nav">
      <div class="ch-nav__inner">

        <!-- Logo -->
        <NuxtLink to="/" class="ch-nav__logo" aria-label="ClimaHub főoldal">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden="true">
            <path d="M2 16 Q5 9 8 16 Q11 23 14 16 Q17 9 20 16"
              stroke="var(--color-primary)" stroke-width="2.2"
              stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <span class="ch-nav__wordmark">
            <span class="ch-nav__wordmark-clima">Clima</span><span class="ch-nav__wordmark-hub">Hub</span>
          </span>
        </NuxtLink>

        <!-- Filter pills -->
        <nav class="ch-nav__pills" aria-label="Kategória szűrő">
          <button
            v-for="cat in categories"
            :key="cat.value"
            type="button"
            class="ch-pill"
            :class="{ 'ch-pill--active': filterStore.activeCategory === cat.value }"
            @click="filterStore.setCategory(cat.value)"
          >
            {{ cat.label }}
          </button>
        </nav>

        <!-- Jobb oldal: kereső + dark mode + sign-out -->
        <div class="ch-nav__right">
          <SearchBar />

          <ClientOnly>
            <div v-if="authStore.isAdmin" class="ch-admin-refresh">
              <button
                type="button"
                class="ch-admin-refresh__button"
                :disabled="manualRefreshLoading"
                @click="handleManualRefresh"
              >
                {{ manualRefreshLoading ? 'Frissítés...' : 'Hírek frissítése' }}
              </button>
              <span
                v-if="manualRefreshMessage"
                class="ch-admin-refresh__status"
                :class="`ch-admin-refresh__status--${manualRefreshStatus}`"
                aria-live="polite"
              >
                {{ manualRefreshMessage }}
              </span>
            </div>
          </ClientOnly>

          <!-- Dark mode toggle -->
          <button type="button" class="ch-toggle" aria-label="Sötét mód kapcsolása" @click="toggleColorMode">
            <svg v-if="isDark" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="5" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
            <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          </button>

          <!-- Sign-out (csak bejelentkezve) -->
          <button
            v-if="user"
            type="button"
            class="ch-toggle ch-signout"
            aria-label="Kijelentkezés"
            :disabled="signingOut"
            @click="handleSignOut"
          >
            <svg v-if="!signingOut" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <svg v-else class="ch-spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
              <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/>
            </svg>
          </button>
        </div>

      </div>
    </header>
    <!-- /NAVBAR -->

    <main><slot /></main>

  </div>
</template>

<script setup lang="ts">
import type { FilterCategory } from '~/types/climahub'
import { useAuthStore } from '~/stores/auth'
import { useFilterStore } from '~/stores/filter'

const filterStore  = useFilterStore()
const authStore    = useAuthStore()
const colorMode    = useColorMode()
const supabase     = useSupabaseClient()
const user         = useSupabaseUser()
const signingOut   = ref(false)
const manualRefreshLoading = ref(false)
const manualRefreshMessage = ref<string | null>(null)
const manualRefreshStatus = ref<'success' | 'error'>('success')

const isDark = computed(() => colorMode.value === 'dark')

function toggleColorMode() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

async function handleSignOut() {
  signingOut.value = true
  await supabase.auth.signOut()
  signingOut.value = false
  await navigateTo('/login')
}

async function handleManualRefresh() {
  if (manualRefreshLoading.value) return

  manualRefreshLoading.value = true
  manualRefreshMessage.value = null

  try {
    const { data: { session } } = await supabase.auth.getSession()
    const accessToken = session?.access_token
    const headers: Record<string, string> = {}

    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`
    }

    await $fetch('/api/news/refresh', {
      method: 'POST',
      headers: Object.keys(headers).length ? headers : undefined,
    })
    manualRefreshStatus.value = 'success'
    manualRefreshMessage.value = 'Kész'
  } catch (error: any) {
    manualRefreshStatus.value = 'error'
    manualRefreshMessage.value =
      error?.data?.statusMessage ||
      error?.data?.message ||
      error?.message ||
      'A frissítés nem sikerült.'
  } finally {
    manualRefreshLoading.value = false
  }
}

const categories: { value: FilterCategory; label: string }[] = [
  { value: 'összes',      label: 'Összes' },
  { value: 'klíma',       label: 'Klíma' },
  { value: 'hőszivattyú', label: 'Hőszivattyú' },
  { value: 'okos_otthon', label: 'Okos otthon' },
]
</script>

<style scoped>
.ch-nav {
  position: sticky;
  top: 0;
  z-index: 50;
  background: color-mix(in oklch, var(--color-bg) 92%, transparent);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--color-border);
}

.ch-nav__inner {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  max-width: 80rem;
  margin-inline: auto;
  padding: var(--space-3) var(--space-6);
}
@media (max-width: 640px) {
  .ch-nav__inner { padding: var(--space-3) var(--space-4); }
}

/* Logo */
.ch-nav__logo {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: var(--space-2);
  text-decoration: none;
  opacity: 1;
  transition: opacity var(--transition-interactive);
}
.ch-nav__logo:hover { opacity: 0.75; }
.ch-nav__wordmark {
  font-family: 'Instrument Serif', Georgia, serif;
  font-size: 20px;
  line-height: 1;
  letter-spacing: -0.01em;
}
.ch-nav__wordmark-clima { color: var(--color-text); font-weight: 400; }
.ch-nav__wordmark-hub   { color: var(--color-primary); font-weight: 400; font-style: italic; }

/* Pill-ek */
.ch-nav__pills {
  display: flex;
  flex: 1;
  align-items: center;
  gap: var(--space-2);
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.ch-nav__pills::-webkit-scrollbar { display: none; }

.ch-pill {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  border-radius: var(--radius-full);
  padding: var(--space-1) var(--space-3);
  font-size: var(--text-sm);
  font-weight: 500;
  line-height: 1.4;
  white-space: nowrap;
  cursor: pointer;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  transition:
    color var(--transition-interactive),
    background-color var(--transition-interactive),
    border-color var(--transition-interactive);
}
.ch-pill:hover { color: var(--color-text); border-color: var(--color-text-muted); }
.ch-pill--active {
  background: var(--color-primary-highlight);
  color: var(--color-primary);
  border-color: var(--color-primary);
}

/* Jobb oldali gombok */
.ch-nav__right {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: var(--space-2);
}

.ch-admin-refresh {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
}

.ch-admin-refresh__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 36px;
  padding: 0 var(--space-3);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-primary);
  background: var(--color-primary-highlight);
  color: var(--color-primary);
  font-size: var(--text-xs);
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
  transition:
    background-color var(--transition-interactive),
    border-color var(--transition-interactive),
    color var(--transition-interactive);
}

.ch-admin-refresh__button:hover:not(:disabled) {
  background: color-mix(in oklch, var(--color-primary) 14%, transparent);
}

.ch-admin-refresh__button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.ch-admin-refresh__status {
  font-size: var(--text-xs);
  line-height: 1;
  color: var(--color-text-faint);
}

.ch-admin-refresh__status--success {
  color: var(--color-success);
}

.ch-admin-refresh__status--error {
  color: var(--color-error);
}

.ch-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  color: var(--color-text-muted);
  background: transparent;
  border: 1px solid transparent;
  cursor: pointer;
  transition:
    color var(--transition-interactive),
    background-color var(--transition-interactive),
    border-color var(--transition-interactive);
}
.ch-toggle:hover {
  color: var(--color-text);
  background: var(--color-surface-offset);
  border-color: var(--color-border);
}
.ch-toggle:active { opacity: 0.55; }
.ch-toggle:disabled { opacity: 0.45; cursor: not-allowed; }

/* Sign-out: hover-on piros árnyalat */
.ch-signout:hover {
  color: var(--color-error);
  background: var(--color-error-highlight);
  border-color: var(--color-error);
}

/* Spinner animáció */
@keyframes ch-spin { to { transform: rotate(360deg); } }
.ch-spinner { animation: ch-spin 0.75s linear infinite; }
</style>
