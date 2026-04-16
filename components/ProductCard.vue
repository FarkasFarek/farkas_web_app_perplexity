<template>
  <!-- Skeleton mode -->
  <div v-if="!product" class="animate-pulse rounded-xl overflow-hidden bg-[var(--color-surface)]">
    <div class="aspect-[4/3] bg-[var(--color-surface-offset)]" />
    <div class="p-4 space-y-2">
      <div class="h-4 w-1/4 rounded bg-[var(--color-surface-offset)]" />
      <div class="h-5 rounded bg-[var(--color-surface-offset)]" />
      <div class="h-5 w-3/4 rounded bg-[var(--color-surface-offset)]" />
      <div class="h-4 w-1/3 rounded bg-[var(--color-surface-offset)]" />
      <div class="mt-3 h-9 rounded-lg bg-[var(--color-surface-offset)]" />
    </div>
  </div>

  <!-- Content mode -->
  <article
    v-else
    class="group flex flex-col overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] transition-shadow hover:shadow-md"
  >
    <!-- Image -->
    <div class="relative aspect-[4/3] overflow-hidden">
      <img
        v-if="product.image_url"
        :src="product.image_url"
        :alt="product.name"
        loading="lazy"
        decoding="async"
        class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        @error="handleImgError"
      />
      <!-- Fallback: gray bg + brand initials -->
      <div
        v-else
        class="flex h-full w-full items-center justify-center bg-[var(--color-surface-offset)]"
        role="img"
        :aria-label="product.name"
      >
        <span class="text-3xl font-bold text-[var(--color-text-faint)] select-none">
          {{ brandInitials }}
        </span>
      </div>
    </div>

    <!-- Body -->
    <div class="flex flex-1 flex-col gap-2 p-4">
      <p class="text-xs font-medium text-[var(--color-text-faint)] uppercase tracking-wide">
        {{ product.brand }}
      </p>

      <h3 class="font-semibold leading-snug text-[var(--color-text)] line-clamp-2">
        {{ product.name }}
      </h3>

      <p class="text-sm font-semibold text-teal-600 dark:text-teal-400">
        {{ priceLabel }}
      </p>

      <a
        v-if="product.affiliate_url"
        :href="product.affiliate_url"
        target="_blank"
        rel="noopener noreferrer"
        class="mt-auto inline-flex items-center justify-center gap-1 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-700 active:bg-teal-800"
      >
        Megnézem
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </a>
      <span v-else class="mt-auto text-xs text-[var(--color-text-faint)]">Ár lekérdezésre</span>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { Product } from '~/types/climahub'

const props = defineProps<{ product?: Product }>()

const brandInitials = computed(() => {
  if (!props.product?.brand) return '?'
  return props.product.brand
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
})

const priceLabel = computed(() => {
  if (!props.product) return ''
  const { price_min, price_max } = props.product
  const fmt = (n: number) => n.toLocaleString('hu-HU') + ' Ft'
  if (price_min != null && price_max != null) return `${fmt(price_min)} – ${fmt(price_max)}`
  if (price_min != null) return `${fmt(price_min)}-tól`
  if (price_max != null) return `${fmt(price_max)}-ig`
  return 'Ár lekérdezésre'
})

function handleImgError(e: Event) {
  const img = e.target as HTMLImageElement
  img.style.display = 'none'
}
</script>
