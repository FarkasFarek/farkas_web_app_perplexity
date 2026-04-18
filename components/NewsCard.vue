<template>
  <!-- ── Skeleton ── -->
  <div
    v-if="!news"
    class="nc nc--skeleton"
    aria-hidden="true"
  >
    <div class="nc__img-wrap nc__img-wrap--skel" />
    <div class="nc__body">
      <div class="skel skel--badge" />
      <div class="skel skel--title" />
      <div class="skel skel--title skel--title-short" />
      <div class="skel skel--line" />
      <div class="skel skel--line skel--line-med" />
      <div class="skel skel--line skel--line-short" />
      <div class="nc__footer" style="margin-top: var(--space-3);">
        <div class="skel skel--foot" />
        <div class="skel skel--foot" />
      </div>
    </div>
  </div>

  <!-- ── Content ── -->
  <article
    v-else
    class="nc"
    @click="$emit('click', news)"
  >
    <!-- Image -->
    <a
      :href="news.source_url"
      target="_blank"
      rel="noopener noreferrer"
      class="nc__img-wrap"
      :aria-label="news.title"
      tabindex="-1"
    >
      <img
        v-if="news.image_url"
        :src="news.image_url"
        :alt="news.title"
        loading="lazy"
        decoding="async"
        class="nc__img"
        @error="handleImgError"
      />
      <!-- Fallback: teal→slate gradient + newspaper icon -->
      <div
        v-else
        class="nc__img-fallback"
        role="img"
        :aria-label="news.title"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="36"
          height="36"
          fill="none"
          viewBox="0 0 24 24"
          stroke="#ffffff"
          stroke-width="1.4"
          aria-hidden="true"
          style="opacity: 0.85;"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2z" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 9h6M9 13h6M9 17h4" />
        </svg>
      </div>
    </a>

    <!-- Body -->
    <div class="nc__body">
      <!-- Badge + time -->
      <div class="nc__meta">
        <span class="nc__badge" :class="badgeClass">{{ categoryLabel }}</span>
        <time :datetime="news.published_at" class="nc__time">{{ timeAgo }}</time>
      </div>

      <!-- Title -->
      <a
        :href="news.source_url"
        target="_blank"
        rel="noopener noreferrer"
        class="nc__title"
      >{{ news.title }}</a>

      <!-- Summary -->
      <p v-if="news.summary" class="nc__summary">{{ news.summary }}</p>

      <!-- Footer: source | date -->
      <div class="nc__footer">
        <span class="nc__source">{{ news.source_name }}</span>
        <time :datetime="news.published_at" class="nc__date">{{ timeAgo }}</time>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { NewsItem } from '~/types/climahub'

const props = defineProps<{ news?: NewsItem }>()
defineEmits<{ (e: 'click', news: NewsItem): void }>()

const badgeClass = computed(() => {
  if (!props.news) return ''
  const map: Record<string, string> = {
    'klíma':       'nc__badge--klima',
    'hőszivattyú': 'nc__badge--ho',
    'okos_otthon': 'nc__badge--smart',
  }
  return map[props.news.category] ?? ''
})

const categoryLabel = computed(() => {
  const map: Record<string, string> = {
    'klíma':       'Klíma',
    'hőszivattyú': 'Hőszivattyú',
    'okos_otthon': 'Okos otthon',
  }
  return props.news ? (map[props.news.category] ?? props.news.category) : ''
})

const timeAgo = computed(() => {
  if (!props.news) return ''
  const diff = Date.now() - new Date(props.news.published_at).getTime()
  const d = Math.floor(diff / 86400000)
  const h = Math.floor(diff / 3600000)
  const m = Math.floor(diff / 60000)
  if (d > 0) return `${d} napja`
  if (h > 0) return `${h} órája`
  if (m > 0) return `${m} perce`
  return 'most'
})

function handleImgError(e: Event) {
  ;(e.target as HTMLImageElement).style.display = 'none'
}
</script>

<style scoped>
/* ─────────────────────────────────────────
   Card shell
───────────────────────────────────────── */
.nc {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  cursor: pointer;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  transition:
    transform var(--transition-interactive),
    box-shadow var(--transition-interactive),
    border-color var(--transition-interactive);
}
.nc:not(.nc--skeleton):hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

/* ─────────────────────────────────────────
   Image area
───────────────────────────────────────── */
.nc__img-wrap {
  display: block;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: var(--color-surface-offset);
  flex-shrink: 0;
}
.nc__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 400ms cubic-bezier(0.16, 1, 0.3, 1);
}
.nc:hover .nc__img { transform: scale(1.04); }

/* Fallback: teal → slate gradient + white icon */
.nc__img-fallback {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #01696f 0%, #4a5568 100%);
}

/* ─────────────────────────────────────────
   Body
───────────────────────────────────────── */
.nc__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: var(--space-4);
  gap: var(--space-2);
}

/* Meta row: badge left, time right */
.nc__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
}
.nc__time {
  font-size: var(--text-xs);
  color: var(--color-text-faint);
}

/* ─────────────────────────────────────────
   Category badge
───────────────────────────────────────── */
.nc__badge {
  display: inline-flex;
  align-items: center;
  border-radius: var(--radius-full);
  padding: 2px var(--space-2);
  font-size: var(--text-xs);
  font-weight: 500;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  white-space: nowrap;
}

/* Klíma — blue */
.nc__badge--klima { background: #c6d8e4; color: #006494; }
.dark .nc__badge--klima { background: #3a4550; color: #5591c7; }
@media (prefers-color-scheme: dark) {
  :root:not(.dark):not(.light) .nc__badge--klima { background: #3a4550; color: #5591c7; }
}

/* Hőszivattyú — orange */
.nc__badge--ho { background: #e7d7c4; color: #da7101; }
.dark .nc__badge--ho { background: #564b3e; color: #fdab43; }
@media (prefers-color-scheme: dark) {
  :root:not(.dark):not(.light) .nc__badge--ho { background: #564b3e; color: #fdab43; }
}

/* Okos otthon — green */
.nc__badge--smart { background: #d4dfcc; color: #437a22; }
.dark .nc__badge--smart { background: #3a4435; color: #6daa45; }
@media (prefers-color-scheme: dark) {
  :root:not(.dark):not(.light) .nc__badge--smart { background: #3a4435; color: #6daa45; }
}

/* ─────────────────────────────────────────
   Title
───────────────────────────────────────── */
.nc__title {
  font-family: 'Instrument Serif', Georgia, serif;
  font-size: var(--text-lg);
  font-weight: 400;
  line-height: 1.3;
  color: var(--color-text);
  margin: var(--space-2) 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color var(--transition-interactive);
}
.nc__title:hover { color: var(--color-primary); }

/* ─────────────────────────────────────────
   Summary
───────────────────────────────────────── */
.nc__summary {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  line-height: 1.55;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  max-width: none;
}

/* ─────────────────────────────────────────
   Footer row: source | relative date
───────────────────────────────────────── */
.nc__footer {
  margin-top: var(--space-3);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-xs);
  color: var(--color-text-faint);
  flex-wrap: nowrap;
}
.nc__source {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.nc__date { white-space: nowrap; flex-shrink: 0; }

/* ─────────────────────────────────────────
   Skeleton
───────────────────────────────────────── */
.nc--skeleton { pointer-events: none; }

.nc__img-wrap--skel {
  animation: nc-pulse 1.5s ease-in-out infinite;
}

.skel {
  border-radius: var(--radius-sm);
  background: var(--color-surface-offset);
  animation: nc-pulse 1.5s ease-in-out infinite;
}

/* Badge skeleton */
.skel--badge  { height: 1.1em; width: 5rem; border-radius: var(--radius-full); }

/* Title skeletons */
.skel--title       { height: 1.3em; width: 90%; margin-top: var(--space-2); }
.skel--title-short { width: 60%; margin-top: var(--space-1); }

/* Summary lines */
.skel--line       { height: 0.85em; width: 100%; margin-top: var(--space-1); }
.skel--line-med   { width: 80%; }
.skel--line-short { width: 55%; }

/* Footer */
.skel--foot { height: 0.75em; width: 4.5rem; }

@keyframes nc-pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.45; }
}
</style>
