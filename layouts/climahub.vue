<template>
  <div class="min-h-screen" style="background: var(--color-bg); color: var(--color-text);">

    <!-- Sticky Navbar -->
    <header
      class="sticky top-0 z-50"
      style="
        background: color-mix(in oklch, var(--color-surface) 92%, transparent);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border-bottom: 1px solid var(--color-divider);
        box-shadow: var(--shadow-sm);
      "
    >
      <div class="mx-auto flex max-w-7xl items-center gap-3 px-4" style="height: 56px;">

        <!-- Logo -->
        <NuxtLink
          to="/"
          class="flex shrink-0 items-center gap-2 transition-opacity hover:opacity-80"
          aria-label="ClimaHub főoldal"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 136 32"
            width="136"
            height="32"
            aria-hidden="true"
            fill="none"
          >
            <path
              d="M4 20 Q8 11 12 20 Q16 29 20 20 Q24 11 28 20"
              stroke="var(--color-primary)"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <text
              x="36" y="22"
              style="font-family: var(--font-body); font-size: 17px; font-weight: 700; letter-spacing: -0.4px;"
              fill="var(--color-text)"
            >Clima</text>
            <text
              x="84" y="22"
              style="font-family: var(--font-body); font-size: 17px; font-weight: 400; letter-spacing: -0.2px;"
              fill="var(--color-primary)"
            >Hub</text>
          </svg>
        </NuxtLink>

        <!-- Filter pills -->
        <nav
          class="scrollbar-none flex flex-1 items-center gap-1 overflow-x-auto"
          aria-label="Kategória szűrő"
        >
          <button
            v-for="cat in categories"
            :key="cat.value"
            type="button"
            class="pill-btn"
            :class="{ 'pill-btn--active': filterStore.activeCategory === cat.value }"
            @click="filterStore.setCategory(cat.value)"
          >
            {{ cat.label }}
          </button>
        </nav>

        <!-- Right controls -->
        <div class="flex shrink-0 items-center gap-1">
          <SearchBar />

          <!-- Dark/light mode toggle -->
          <button
            type="button"
            class="icon-btn"
            aria-label="Sötét mód kapcsolása"
            @click="toggleColorMode"
          >
            <!-- Sun icon — light mode-ban látható -->
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
            <!-- Moon icon — dark mode-ban látható -->
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
  { value: 'összes', label: 'Összes' },
  { value: 'klíma', label: 'Klíma' },
  { value: 'hőszivattyú', label: 'Hőszivattyú' },
  { value: 'okos_otthon', label: 'Okos otthon' },
]
</script>

<style scoped>
.pill-btn {
  flex-shrink: 0;
  border-radius: var(--radius-full);
  padding: 0.3rem 0.85rem;
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-muted);
  background: transparent;
  border: 1px solid transparent;
  transition:
    color var(--transition-interactive),
    background var(--transition-interactive),
    border-color var(--transition-interactive);
  white-space: nowrap;
}
.pill-btn:hover {
  color: var(--color-text);
  background: var(--color-surface-offset);
}
.pill-btn--active {
  color: var(--color-primary);
  background: var(--color-primary-highlight);
  border-color: color-mix(in oklch, var(--color-primary) 25%, transparent);
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  color: var(--color-text-muted);
  background: transparent;
  border: none;
  opacity: 1;
  transition:
    color var(--transition-interactive),
    background var(--transition-interactive),
    opacity 180ms ease;
}
.icon-btn:hover {
  color: var(--color-text);
  background: var(--color-surface-offset);
}
.icon-btn:active {
  opacity: 0.6;
}
</style>
