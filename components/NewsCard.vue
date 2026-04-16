<template>
  <!-- Skeleton mode -->
  <div v-if="!news" class="animate-pulse rounded-xl overflow-hidden bg-[var(--color-surface)]">
    <div class="aspect-video bg-[var(--color-surface-offset)]" />
    <div class="p-4 space-y-2">
      <div class="h-4 w-1/3 rounded bg-[var(--color-surface-offset)]" />
      <div class="h-5 rounded bg-[var(--color-surface-offset)]" />
      <div class="h-5 w-4/5 rounded bg-[var(--color-surface-offset)]" />
      <div class="h-4 rounded bg-[var(--color-surface-offset)]" />
      <div class="h-4 w-2/3 rounded bg-[var(--color-surface-offset)]" />
    </div>
  </div>

  <!-- Content mode -->
  <article
    v-else
    class="group flex flex-col overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] transition-shadow hover:shadow-md"
  >
    <!-- Image -->
    <a
      :href="news.source_url"
      target="_blank"
      rel="noopener noreferrer"
      class="relative block aspect-video overflow-hidden"
      :aria-label="news.title"
    >
      <img
        v-if="news.image_url"
        :src="news.image_url"
        :alt="news.title"
        loading="lazy"
        decoding="async"
        class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        @error="handleImgError"
      />
      <!-- Fallback: teal gradient + newspaper icon -->
      <div
        v-else
        class="flex h-full w-full items-center justify-center bg-gradient-to-br from-teal-500 to-teal-700"
        role="img"
        :aria-label="news.title"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2z" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 9h6M9 13h6M9 17h4" />
        </svg>
      </div>
    </a>

    <!-- Body -->
    <div class="flex flex-1 flex-col gap-2 p-4">
      <!-- Badge + date -->
      <div class="flex items-center justify-between">
        <span class="rounded-full px-2 py-0.5 text-xs font-medium" :class="categoryBadgeClass">
          {{ categoryLabel }}
        </span>
        <time :datetime="news.published_at" class="text-xs text-[var(--color-text-faint)]">
          {{ timeAgo }}
        </time>
      </div>

      <!-- Title -->
      <a
        :href="news.source_url"
        target="_blank"
        rel="noopener noreferrer"
        class="line-clamp-2 font-semibold leading-snug text-[var(--color-text)] hover:text-teal-600 dark:hover:text-teal-400"
      >
        {{ news.title }}
      </a>

      <!-- Summary -->
      <p v-if="news.summary" class="line-clamp-3 text-sm text-[var(--color-text-muted)]">
        {{ news.summary }}
      </p>

      <!-- Source -->
      <p class="mt-auto text-xs text-[var(--color-text-faint)]">{{ news.source_name }}</p>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { NewsItem } from '~/types/climahub'

const props = defineProps<{ news?: NewsItem }>()

const categoryBadgeClass = computed(() => {
  if (!props.news) return ''
  const map: Record<string, string> = {
    klíma: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    hőszivattyú: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    okos_otthon: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
  }
  return map[props.news.category] ?? ''
})

const categoryLabel = computed(() => {
  const map: Record<string, string> = {
    klíma: 'Klíma',
    hőszivattyú: 'Hőszivattyú',
    okos_otthon: 'Okos otthon'
  }
  return props.news ? (map[props.news.category] ?? props.news.category) : ''
})

const timeAgo = computed(() => {
  if (!props.news) return ''
  const now = Date.now()
  const diff = now - new Date(props.news.published_at).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (days > 0) return `${days} napja`
  if (hours > 0) return `${hours} órája`
  if (minutes > 0) return `${minutes} perce`
  return 'most'
})

function handleImgError(e: Event) {
  const img = e.target as HTMLImageElement
  img.style.display = 'none'
}
</script>
