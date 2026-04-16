<template>
  <div class="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
    <!-- Sticky Navbar -->
    <header class="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-surface)]/90 backdrop-blur-sm">
      <div class="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        <!-- Logo -->
        <NuxtLink to="/" class="flex shrink-0 items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 120 32"
            width="120"
            height="32"
            aria-label="ClimaHub"
            fill="none"
          >
            <!-- Heat wave motif -->
            <path
              d="M4 20 Q8 12 12 20 Q16 28 20 20 Q24 12 28 20"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              class="text-teal-600 dark:text-teal-400"
            />
            <text
              x="36"
              y="22"
              font-family="system-ui, sans-serif"
              font-size="16"
              font-weight="700"
              fill="currentColor"
              letter-spacing="-0.5"
            >ClimaHub</text>
          </svg>
        </NuxtLink>

        <!-- Filter pills (horizontally scrollable on mobile) -->
        <nav
          class="flex flex-1 gap-2 overflow-x-auto scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none]"
          aria-label="Kategória szűrő"
        >
          <button
            v-for="cat in categories"
            :key="cat.value"
            type="button"
            class="shrink-0 rounded-full px-3 py-1 text-sm font-medium transition-colors"
            :class="
              filterStore.activeCategory === cat.value
                ? 'bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            "
            @click="filterStore.setCategory(cat.value)"
          >
            {{ cat.label }}
          </button>
        </nav>

        <!-- Right: search + dark mode toggle -->
        <div class="flex shrink-0 items-center gap-2">
          <SearchBar />

          <button
            type="button"
            data-theme-toggle
            aria-label="Sötét/világos mód váltás"
            class="rounded-md p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-offset)]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          </button>
        </div>
      </div>
    </header>

    <!-- Main content — single scroll region -->
    <main>
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import type { FilterCategory } from '~/types/climahub'
import { useFilterStore } from '~/stores/filter'

const filterStore = useFilterStore()

const categories: { value: FilterCategory; label: string }[] = [
  { value: 'összes', label: 'Összes' },
  { value: 'klíma', label: 'Klíma' },
  { value: 'hőszivattyú', label: 'Hőszivattyú' },
  { value: 'okos_otthon', label: 'Okos otthon' }
]

// Dark/light mode toggle (data-theme on <html>)
onMounted(() => {
  const toggle = document.querySelector('[data-theme-toggle]') as HTMLButtonElement | null
  const html = document.documentElement
  let theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  html.setAttribute('data-theme', theme)
  updateIcon(toggle, theme)

  toggle?.addEventListener('click', () => {
    theme = theme === 'dark' ? 'light' : 'dark'
    html.setAttribute('data-theme', theme)
    updateIcon(toggle, theme)
  })
})

function updateIcon(btn: HTMLButtonElement | null, theme: string) {
  if (!btn) return
  btn.innerHTML =
    theme === 'dark'
      ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`
      : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`
}
</script>
