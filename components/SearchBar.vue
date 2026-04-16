<template>
  <div class="relative" role="search">
    <!-- Icon button -->
    <button
      type="button"
      class="rounded-md p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-offset)] transition-colors"
      :aria-label="open ? 'Kereső bezárása' : 'Keresés'"
      :aria-expanded="open"
      @click="toggleOpen"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8" />
        <path stroke-linecap="round" d="M21 21l-4.35-4.35" />
      </svg>
    </button>

    <!-- Expanding input -->
    <div
      class="absolute right-0 top-full mt-1 overflow-hidden transition-all duration-200"
      :style="open ? 'max-width: 320px; opacity: 1' : 'max-width: 0; opacity: 0'"
    >
      <div
        role="combobox"
        :aria-expanded="open && results !== null"
        aria-haspopup="listbox"
        :aria-activedescendant="activeId"
        class="relative"
      >
        <input
          ref="inputRef"
          v-model="query"
          type="search"
          placeholder="Keresés..."
          class="w-72 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-faint)] focus:outline-none focus:ring-2 focus:ring-teal-500"
          :aria-label="'Keresés'"
          @keydown="handleKeydown"
        />

        <!-- Dropdown -->
        <div
          v-if="results !== null && open"
          id="search-dropdown"
          role="listbox"
          class="absolute left-0 top-full mt-1 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg overflow-hidden z-50"
        >
          <!-- Products section -->
          <div v-if="results.products.length">
            <p class="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-faint)]">Termékek</p>
            <button
              v-for="(item, i) in results.products.slice(0, 3)"
              :id="`search-item-${i}`"
              :key="item.id"
              role="option"
              :aria-selected="activeIndex === i"
              type="button"
              class="flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors"
              :class="activeIndex === i ? 'bg-[var(--color-surface-offset)]' : 'hover:bg-[var(--color-surface-offset)]'"
              @click="openAffiliate(item.affiliate_url)"
            >
              <span class="flex-1 truncate">{{ item.name }}</span>
              <span class="shrink-0 text-xs text-[var(--color-text-faint)]">{{ item.brand }}</span>
            </button>
          </div>

          <!-- Divider -->
          <div v-if="results.products.length && results.news.length" class="my-1 border-t border-[var(--color-divider)]" />

          <!-- News section -->
          <div v-if="results.news.length">
            <p class="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-faint)]">Hírek</p>
            <a
              v-for="(item, i) in results.news.slice(0, 3)"
              :id="`search-item-${results.products.slice(0,3).length + i}`"
              :key="item.id"
              :href="item.source_url"
              target="_blank"
              rel="noopener noreferrer"
              role="option"
              :aria-selected="activeIndex === results.products.slice(0,3).length + i"
              class="flex w-full items-center gap-3 px-3 py-2 text-sm transition-colors"
              :class="activeIndex === results.products.slice(0,3).length + i ? 'bg-[var(--color-surface-offset)]' : 'hover:bg-[var(--color-surface-offset)]'"
            >
              <span class="flex-1 truncate">{{ item.title }}</span>
              <span class="shrink-0 text-xs text-[var(--color-text-faint)]">{{ item.source_name }}</span>
            </a>
          </div>

          <!-- Empty -->
          <p v-if="!results.products.length && !results.news.length" class="px-4 py-3 text-sm text-[var(--color-text-muted)]">
            Nincs találat
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product, NewsItem } from '~/types/climahub'

interface SearchResults { products: Product[]; news: NewsItem[] }

const open = ref(false)
const query = ref('')
const results = ref<SearchResults | null>(null)
const activeIndex = ref(-1)
const inputRef = ref<HTMLInputElement | null>(null)

const activeId = computed(() => {
  if (activeIndex.value < 0) return undefined
  return `search-item-${activeIndex.value}`
})

let debounceTimer: ReturnType<typeof setTimeout>

watch(query, (val) => {
  clearTimeout(debounceTimer)
  activeIndex.value = -1
  if (val.length < 2) { results.value = null; return }
  debounceTimer = setTimeout(async () => {
    try {
      results.value = await $fetch<SearchResults>(`/api/search?q=${encodeURIComponent(val)}`)
    } catch {
      results.value = null
    }
  }, 300)
})

function toggleOpen() {
  open.value = !open.value
  if (open.value) nextTick(() => inputRef.value?.focus())
  else { query.value = ''; results.value = null }
}

const totalItems = computed(() => {
  if (!results.value) return 0
  return Math.min(3, results.value.products.length) + Math.min(3, results.value.news.length)
})

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') { open.value = false; query.value = ''; results.value = null }
  if (e.key === 'ArrowDown') { e.preventDefault(); activeIndex.value = Math.min(activeIndex.value + 1, totalItems.value - 1) }
  if (e.key === 'ArrowUp') { e.preventDefault(); activeIndex.value = Math.max(activeIndex.value - 1, -1) }
  if (e.key === 'Enter' && activeIndex.value >= 0 && results.value) {
    const products = results.value.products.slice(0, 3)
    const news = results.value.news.slice(0, 3)
    if (activeIndex.value < products.length) {
      openAffiliate(products[activeIndex.value]?.affiliate_url ?? null)
    } else {
      const newsItem = news[activeIndex.value - products.length]
      if (newsItem) window.open(newsItem.source_url, '_blank', 'noopener,noreferrer')
    }
  }
}

function openAffiliate(url: string | null | undefined) {
  if (url) window.open(url, '_blank', 'noopener,noreferrer')
}
</script>
