<template>
  <div style="background: var(--color-bg); color: var(--color-text); min-height: 100dvh;">

    <!-- ===================== NAVBAR ===================== -->
    <header class="ch-nav">
      <div class="ch-nav__inner">

        <!-- Logo -->
        <NuxtLink to="/" class="ch-nav__logo" aria-label="ClimaHub főoldal">
          <!-- Hőhullám glyph -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24"
            height="24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M2 16 Q5 9 8 16 Q11 23 14 16 Q17 9 20 16"
              stroke="var(--color-primary)"
              stroke-width="2.2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <!-- Wordmark -->
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

        <!-- Right side: search + toggle -->
        <div class="ch-nav__right">
          <SearchBar />

          <button
            type="button"
            class="ch-toggle"
            aria-label="Sötét mód kapcsolása"
            @click="toggleColorMode"
          >
            <!-- Nap — dark módban mutatjuk (kiértékelésre váró ikont mutat light-ra) -->
            <svg
              v-if="isDark"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="5" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
            <!-- Hold — light módban mutatjuk -->
            <svg
              v-else
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          </button>
        </div>

      </div>
    </header>
    <!-- ==================== /NAVBAR ==================== -->

    <main><slot /></main>

  </div>
</template>

<script setup lang="ts">
import type { FilterCategory } from '~/types/climahub'
import { useFilterStore } from '~/stores/filter'

const filterStore = useFilterStore()
const colorMode = useColorMode()

const isDark = computed(() => colorMode.value === 'dark')

function toggleColorMode() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

const categories: { value: FilterCategory; label: string }[] = [
  { value: 'összes',      label: 'Összes' },
  { value: 'klíma',       label: 'Klíma' },
  { value: 'hőszivattyú', label: 'Hőszivattyú' },
  { value: 'okos_otthon', label: 'Okos otthon' },
]
</script>

<style scoped>
/* ============================================================
 * Navbar shell
 * ============================================================ */
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
  max-width: 80rem;       /* 1280px — matches Tailwind max-w-7xl */
  margin-inline: auto;
  /* Desktop padding */
  padding: var(--space-3) var(--space-6);
}

@media (max-width: 640px) {
  .ch-nav__inner {
    padding: var(--space-3) var(--space-4);
  }
}

/* ============================================================
 * Logo
 * ============================================================ */
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
.ch-nav__wordmark-clima {
  color: var(--color-text);
  font-weight: 400;
}
.ch-nav__wordmark-hub {
  color: var(--color-primary);
  font-weight: 400;
  font-style: italic;
}

/* ============================================================
 * Filter pill row
 * ============================================================ */
.ch-nav__pills {
  display: flex;
  flex: 1;
  align-items: center;
  gap: var(--space-2);
  overflow-x: auto;
  scrollbar-width: none;      /* Firefox */
  -ms-overflow-style: none;   /* IE/Edge */
}
.ch-nav__pills::-webkit-scrollbar { display: none; }

/* ---- Individual pill ---- */
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

.ch-pill:hover {
  color: var(--color-text);
  border-color: var(--color-text-muted);
}

.ch-pill--active {
  background: var(--color-primary-highlight);
  color: var(--color-primary);
  border-color: var(--color-primary);
}

/* ============================================================
 * Right controls
 * ============================================================ */
.ch-nav__right {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: var(--space-2);
}

/* ---- Toggle button ---- */
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
  opacity: 1;
  transition:
    color var(--transition-interactive),
    background-color var(--transition-interactive),
    border-color var(--transition-interactive),
    opacity 180ms ease;
}
.ch-toggle:hover {
  color: var(--color-text);
  background: var(--color-surface-offset);
  border-color: var(--color-border);
}
.ch-toggle:active { opacity: 0.55; }
</style>
