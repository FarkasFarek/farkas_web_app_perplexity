<template>
  <!-- Skeleton -->
  <div
    v-if="!news"
    class="news-card news-card--skeleton"
    aria-hidden="true"
  >
    <div class="news-card__img-placeholder" />
    <div class="news-card__body" style="gap: var(--space-2);">
      <div class="skel skel--short" />
      <div class="skel" />
      <div class="skel skel--med" />
      <div class="skel skel--short" style="margin-top: var(--space-2);" />
    </div>
  </div>

  <!-- Content -->
  <article v-else class="news-card">
    <!-- Image -->
    <a
      :href="news.source_url"
      target="_blank"
      rel="noopener noreferrer"
      class="news-card__img-link"
      :aria-label="news.title"
      tabindex="-1"
    >
      <img
        v-if="news.image_url"
        :src="news.image_url"
        :alt="news.title"
        loading="lazy"
        decoding="async"
        class="news-card__img"
        @error="handleImgError"
      />
      <div
        v-else
        class="news-card__img-fallback"
        role="img"
        :aria-label="news.title"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" aria-hidden="true" style="opacity: 0.55;">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2z" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 9h6M9 13h6M9 17h4" />
        </svg>
      </div>
    </a>

    <!-- Body -->
    <div class="news-card__body">
      <!-- Meta row -->
      <div class="news-card__meta">
        <span class="news-badge" :class="badgeClass">{{ categoryLabel }}</span>
        <time :datetime="news.published_at" class="news-card__time">{{ timeAgo }}</time>
      </div>

      <!-- Title -->
      <a
        :href="news.source_url"
        target="_blank"
        rel="noopener noreferrer"
        class="news-card__title"
      >
        {{ news.title }}
      </a>

      <!-- Summary -->
      <p v-if="news.summary" class="news-card__summary">{{ news.summary }}</p>

      <!-- Source -->
      <p class="news-card__source">{{ news.source_name }}</p>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { NewsItem } from '~/types/climahub'

const props = defineProps<{ news?: NewsItem }>()

const badgeClass = computed(() => {
  if (!props.news) return ''
  const map: Record<string, string> = {
    'kl\u00edma':       'news-badge--klima',
    'h\u0151szivatty\u00fa': 'news-badge--ho',
    'okos_otthon': 'news-badge--smart',
  }
  return map[props.news.category] ?? ''
})

const categoryLabel = computed(() => {
  const map: Record<string, string> = {
    'kl\u00edma':       'Kl\u00edma',
    'h\u0151szivatty\u00fa': 'H\u0151szivatty\u00fa',
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
  if (h > 0) return `${h} \u00f3r\u00e1ja`
  if (m > 0) return `${m} perce`
  return 'most'
})

function handleImgError(e: Event) {
  ;(e.target as HTMLImageElement).style.display = 'none'
}
</script>

<style scoped>
/* --- Card shell --- */
.news-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  transition:
    box-shadow var(--transition-ui),
    transform var(--transition-ui),
    border-color var(--transition-ui);
}
.news-card:not(.news-card--skeleton):hover {
  box-shadow: var(--shadow-card-hover);
  transform: translateY(-2px);
  border-color: color-mix(in oklch, var(--color-primary) 20%, var(--color-border));
}

/* --- Skeleton --- */
.news-card--skeleton { pointer-events: none; }
.news-card__img-placeholder {
  aspect-ratio: 16 / 9;
  background: var(--color-surface-offset);
  animation: shimmer 1.5s ease-in-out infinite;
  background-size: 200% 100%;
  background-image: linear-gradient(
    90deg,
    var(--color-surface-offset) 25%,
    var(--color-divider) 50%,
    var(--color-surface-offset) 75%
  );
}
.skel {
  height: 0.9em;
  border-radius: var(--radius-sm);
  background-image: linear-gradient(
    90deg,
    var(--color-surface-offset) 25%,
    var(--color-divider) 50%,
    var(--color-surface-offset) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}
.skel--short { width: 38%; }
.skel--med   { width: 72%; }
@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position:  200% 0; }
}

/* --- Image area --- */
.news-card__img-link {
  display: block;
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: var(--color-surface-offset);
}
.news-card__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 400ms cubic-bezier(0.16, 1, 0.3, 1);
}
.news-card:hover .news-card__img { transform: scale(1.04); }

.news-card__img-fallback {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    135deg,
    color-mix(in oklch, var(--color-primary) 12%, var(--color-surface-offset)),
    color-mix(in oklch, var(--color-primary) 6%,  var(--color-surface-offset))
  );
  color: var(--color-primary);
}

/* --- Body --- */
.news-card__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-4);
}
.news-card__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
}
.news-card__time {
  font-size: var(--text-xs);
  color: var(--color-text-faint);
}
.news-card__title {
  font-size: var(--text-base);
  font-weight: 600;
  line-height: 1.35;
  color: var(--color-text);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color var(--transition-ui);
}
.news-card__title:hover { color: var(--color-primary); }

.news-card__summary {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  line-height: 1.55;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  max-width: none;
}
.news-card__source {
  margin-top: auto;
  font-size: var(--text-xs);
  color: var(--color-text-faint);
}

/* --- Category badges --- */
.news-badge {
  display: inline-flex;
  align-items: center;
  border-radius: var(--radius-full);
  padding: 0.15rem 0.55rem;
  font-size: var(--text-xs);
  font-weight: 500;
  line-height: 1.5;
}
.news-badge--klima {
  background: color-mix(in oklch, #006494 12%, transparent);
  color: #006494;
}
.news-badge--ho {
  background: color-mix(in oklch, #da7101 12%, transparent);
  color: #da7101;
}
.news-badge--smart {
  background: var(--color-primary-subtle);
  color: var(--color-primary);
}
[data-theme='dark'] .news-badge--klima {
  background: color-mix(in oklch, #5591c7 15%, transparent);
  color: #5591c7;
}
[data-theme='dark'] .news-badge--ho {
  background: color-mix(in oklch, #fdab43 12%, transparent);
  color: #fdab43;
}
</style>
