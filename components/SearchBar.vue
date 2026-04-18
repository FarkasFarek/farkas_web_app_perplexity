<template>
  <div class="search" ref="root">
    <button
      class="search__toggle"
      type="button"
      :aria-expanded="open ? 'true' : 'false'"
      aria-label="Keresés"
      @click="toggleOpen"
    >
      <svg class="search__icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-3.5-3.5" stroke-linecap="round" />
      </svg>
    </button>

    <div class="search__field-wrap" :class="{ 'is-open': open }">
      <input
        ref="inputRef"
        v-model="query"
        class="search__input"
        type="text"
        autocomplete="off"
        placeholder="Keresés..."
        role="combobox"
        aria-autocomplete="list"
        :aria-expanded="showDropdown ? 'true' : 'false'"
        :aria-controls="dropdownId"
        :aria-activedescendant="activeDescendant"
        @keydown="onKeydown"
        @focus="onFocus"
        @input="onInput"
      />
    </div>

    <div
      v-if="showDropdown"
      :id="dropdownId"
      class="search__dropdown"
      role="listbox"
    >
      <!-- Loading -->
      <div v-if="loading" class="search__empty">Keresés...</div>

      <template v-else>
        <template v-if="newsResults.length">
          <div class="search__section-title">Hírek</div>
          <button
            v-for="(item, index) in newsResults"
            :id="optionId('news', index)"
            :key="`news-${item.id}`"
            class="search__item"
            type="button"
            role="option"
            :aria-selected="activeType === 'news' && activeIndex === index ? 'true' : 'false'"
            @mouseenter="setActive('news', index)"
            @click="selectNews(item)"
          >
            <img v-if="item.image_url" :src="item.image_url" :alt="''" class="search__thumb" loading="lazy" decoding="async" />
            <div v-else class="search__thumb search__thumb--empty" aria-hidden="true"></div>
            <span class="search__label">{{ item.title }}</span>
          </button>
        </template>

        <div v-if="newsResults.length && productResults.length" class="search__divider"></div>

        <template v-if="productResults.length">
          <div class="search__section-title">Termékek</div>
          <button
            v-for="(item, index) in productResults"
            :id="optionId('product', index)"
            :key="`product-${item.id}`"
            class="search__item"
            type="button"
            role="option"
            :aria-selected="activeType === 'product' && activeIndex === index ? 'true' : 'false'"
            @mouseenter="setActive('product', index)"
            @click="selectProduct(item)"
          >
            <img v-if="item.image_url" :src="item.image_url" :alt="''" class="search__thumb" loading="lazy" decoding="async" />
            <div v-else class="search__thumb search__thumb--empty" aria-hidden="true"></div>
            <span class="search__label">{{ item.name }}</span>
          </button>
        </template>

        <div
          v-if="!newsResults.length && !productResults.length && query.trim().length >= 2"
          class="search__empty"
        >
          Nincs találat
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NewsItem, Product } from '~/types/climahub'

// ── state ──────────────────────────────────────────────────
const root     = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)
const open     = ref(false)
const query    = ref('')
const loading  = ref(false)

const newsResults    = ref<NewsItem[]>([])
const productResults = ref<Product[]>([])

const activeType  = ref<'news' | 'product'>('news')
const activeIndex = ref(0)
const dropdownId  = 'search-dropdown'

// ── search fetch (debounced) ────────────────────────────────
let debounceTimer: ReturnType<typeof setTimeout> | null = null

function onInput() {
  if (debounceTimer) clearTimeout(debounceTimer)
  const q = query.value.trim()
  if (q.length < 2) {
    newsResults.value = []
    productResults.value = []
    loading.value = false
    return
  }
  loading.value = true
  debounceTimer = setTimeout(() => fetchResults(q), 280)
}

async function fetchResults(q: string) {
  try {
    const data = await $fetch<{ news: NewsItem[]; products: Product[] }>(
      `/api/search?q=${encodeURIComponent(q)}`
    )
    newsResults.value    = data.news    ?? []
    productResults.value = data.products ?? []
  } catch {
    newsResults.value    = []
    productResults.value = []
  } finally {
    loading.value = false
  }
}

// ── dropdown visibility ─────────────────────────────────────
const showDropdown = computed(() =>
  open.value &&
  query.value.trim().length >= 2 &&
  (loading.value || newsResults.value.length > 0 || productResults.value.length > 0)
)

// ── flat list for keyboard nav ──────────────────────────────
const flatResults = computed(() => [
  ...newsResults.value.map((item) => ({ type: 'news' as const, item })),
  ...productResults.value.map((item) => ({ type: 'product' as const, item })),
])

const activeDescendant = computed(() => {
  if (!showDropdown.value) return undefined
  return optionId(activeType.value, activeIndex.value)
})

// ── helpers ─────────────────────────────────────────────────
function optionId(type: 'news' | 'product', index: number) {
  return `search-option-${type}-${index}`
}

function toggleOpen() {
  open.value = !open.value
  if (open.value) nextTick(() => inputRef.value?.focus())
}

function onFocus() {
  open.value = true
}

function setActive(type: 'news' | 'product', index: number) {
  activeType.value  = type
  activeIndex.value = index
}

function syncActiveFromFlat(index: number) {
  const entry = flatResults.value[index]
  if (!entry) return
  activeType.value = entry.type
  const typeIndex = entry.type === 'news'
    ? newsResults.value.findIndex((n) => n.id === (entry.item as NewsItem).id)
    : productResults.value.findIndex((p) => p.id === (entry.item as Product).id)
  activeIndex.value = Math.max(0, typeIndex)
}

function onKeydown(e: KeyboardEvent) {
  const items = flatResults.value

  if (e.key === 'Escape') {
    open.value = false
    inputRef.value?.blur()
    return
  }

  if (!showDropdown.value || !items.length) return

  const currentFlatIndex = items.findIndex((entry) => {
    if (activeType.value === 'news' && entry.type === 'news')
      return newsResults.value[activeIndex.value]?.id === (entry.item as NewsItem).id
    if (activeType.value === 'product' && entry.type === 'product')
      return productResults.value[activeIndex.value]?.id === (entry.item as Product).id
    return false
  })

  if (e.key === 'ArrowDown') {
    e.preventDefault()
    syncActiveFromFlat(currentFlatIndex < items.length - 1 ? currentFlatIndex + 1 : 0)
  }
  if (e.key === 'ArrowUp') {
    e.preventDefault()
    syncActiveFromFlat(currentFlatIndex > 0 ? currentFlatIndex - 1 : items.length - 1)
  }
  if (e.key === 'Enter') {
    e.preventDefault()
    const current = items[currentFlatIndex]
    if (!current) return
    if (current.type === 'news') selectNews(current.item as NewsItem)
    else selectProduct(current.item as Product)
  }
}

function selectNews(item: NewsItem) {
  open.value  = false
  query.value = ''
  newsResults.value    = []
  productResults.value = []
  window.open(item.source_url, '_blank', 'noopener,noreferrer')
}

function selectProduct(item: Product) {
  open.value  = false
  query.value = ''
  newsResults.value    = []
  productResults.value = []
  if (item.affiliate_url) window.open(item.affiliate_url, '_blank', 'noopener,noreferrer')
}

// ── click outside ───────────────────────────────────────────
function onDocumentClick(e: MouseEvent) {
  if (!root.value?.contains(e.target as Node)) open.value = false
}
onMounted(() => document.addEventListener('click', onDocumentClick))
onBeforeUnmount(() => document.removeEventListener('click', onDocumentClick))
</script>

<style scoped>
.search {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

/* ── Toggle button ── */
.search__toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  color: var(--color-text-muted);
  background: transparent;
  transition:
    color var(--transition-interactive),
    background var(--transition-interactive);
}
.search__toggle:hover {
  color: var(--color-text);
  background: var(--color-surface-offset);
}
.search__toggle:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 3px;
}
.search__icon { width: 18px; height: 18px; flex-shrink: 0; }

/* ── Expanding input ── */
.search__field-wrap {
  width: 0;
  max-width: 0;
  opacity: 0;
  overflow: hidden;
  transition:
    width var(--transition-interactive),
    max-width var(--transition-interactive),
    opacity var(--transition-interactive);
}
.search__field-wrap.is-open {
  width: 220px;
  max-width: 220px;
  opacity: 1;
}
.search__input {
  width: 220px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-sm);
  color: var(--color-text);
}
.search__input::placeholder { color: var(--color-text-faint); }
.search__input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-highlight);
  outline: none;
}

/* ── Dropdown ── */
.search__dropdown {
  position: absolute;
  top: calc(100% + var(--space-2));
  right: 0;
  width: 360px;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  z-index: 30;
  padding-bottom: var(--space-2);
}
.search__section-title {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-text-faint);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: var(--space-3) var(--space-4) var(--space-1);
}
.search__item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  padding: var(--space-2) var(--space-4);
  text-align: left;
  background: transparent;
  border: 0;
  cursor: pointer;
  transition: background var(--transition-interactive);
}
.search__item[aria-selected='true'],
.search__item:hover {
  background: var(--color-surface-offset);
}
.search__thumb {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  object-fit: cover;
  background: var(--color-surface-offset);
  flex-shrink: 0;
}
.search__thumb--empty { display: block; }
.search__label {
  min-width: 0;
  font-size: var(--text-sm);
  color: var(--color-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.search__divider {
  height: 1px;
  background: var(--color-divider);
  margin: var(--space-2) 0;
}
.search__empty {
  padding: var(--space-4);
  font-size: var(--text-sm);
  color: var(--color-text-faint);
  text-align: center;
}

/* ── Mobile ── */
@media (max-width: 479px) {
  .search__dropdown {
    width: 100vw;
    right: auto;
    left: calc(var(--space-4) * -1);
  }
  .search__field-wrap.is-open,
  .search__input {
    width: min(220px, calc(100vw - 72px));
    max-width: min(220px, calc(100vw - 72px));
  }
}
</style>
