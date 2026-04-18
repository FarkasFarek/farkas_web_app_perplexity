<script setup lang="ts">
import { useNews } from '~/composables/useNews'
import { useInfiniteScroll } from '~/composables/useInfiniteScroll'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'climahub',
  middleware: 'auth',
})

const {
  news,
  hasMore: newsHasMore,
  loading: newsLoading,
  loadMore: newsLoadMore,
  resetAndLoad,
} = useNews()
const { sentinelRef: newsSentinelRef } = useInfiniteScroll(newsLoadMore, newsHasMore)
const authStore = useAuthStore()

const isAdmin = computed(() => authStore.isAdmin)
const manualRefreshLoading = ref(false)
const manualRefreshMessage = ref<string | null>(null)
const manualRefreshStatus = ref<'success' | 'error'>('success')

async function handleManualRefresh() {
  if (manualRefreshLoading.value) return

  manualRefreshLoading.value = true
  manualRefreshMessage.value = null

  try {
    await $fetch('/api/news/refresh', { method: 'POST' })
    await resetAndLoad()
    manualRefreshStatus.value = 'success'
    manualRefreshMessage.value = 'Hírek frissítve.'
  } catch {
    manualRefreshStatus.value = 'error'
    manualRefreshMessage.value = 'A frissítés nem sikerült.'
  } finally {
    manualRefreshLoading.value = false
  }
}

onMounted(() => {
  void newsLoadMore()
})

const SKELETON_COUNT = 6
</script>

<template>
  <div class="home-page">

    <!-- Hero -->
    <section class="home-hero">
      <div class="home-hero__inner">
        <h1 class="home-hero__title">Klíma, hőszivattyú és okos otthon — egy helyen.</h1>
        <p class="home-hero__text">
          A legfrissebb hírek a klímatechnika világából.
        </p>
      </div>
    </section>

    <!-- Hírek -->
    <div class="home-shell">
      <section id="hirek" class="home-section">
        <div class="home-section__header">
          <h2 class="home-section__title">Legfrissebb hírek</h2>

          <div class="home-section__actions">
            <button
              v-if="isAdmin"
              type="button"
              class="home-refresh-button"
              :disabled="manualRefreshLoading"
              @click="handleManualRefresh"
            >
              {{ manualRefreshLoading ? 'Frissítés...' : 'Manuális frissítés' }}
            </button>
            <span v-else class="home-readonly-badge">Read-only profil</span>
          </div>
        </div>

        <p
          v-if="manualRefreshMessage"
          class="home-refresh-message"
          :class="`home-refresh-message--${manualRefreshStatus}`"
        >
          {{ manualRefreshMessage }}
        </p>

        <div class="news-grid">
          <template v-if="newsLoading && news.length === 0">
            <NewsCard v-for="n in SKELETON_COUNT" :key="`news-sk-${n}`" />
          </template>
          <template v-else>
            <NewsCard v-for="item in news" :key="item.id" :news="item" />
          </template>
        </div>

        <div ref="newsSentinelRef" class="home-sentinel" />

        <p v-if="!newsHasMore && news.length > 0" class="home-end-message">
          Nincs több tartalom
        </p>
      </section>
    </div>

  </div>
</template>

<style scoped>
.home-page {
  background:
    radial-gradient(circle at top left, oklch(from var(--color-primary) l c h / 0.06), transparent 42%),
    var(--color-bg);
}

.home-hero {
  padding: var(--space-12) var(--space-6);
}

.home-hero__inner,
.home-shell {
  max-width: 80rem;
  margin-inline: auto;
}

.home-hero__title {
  margin: 0;
  max-width: 16ch;
  font-family: 'Instrument Serif', Georgia, serif;
  font-size: var(--text-2xl);
  font-weight: 400;
  line-height: 1.08;
  letter-spacing: -0.02em;
  color: var(--color-text);
}

.home-hero__text {
  margin-top: var(--space-4);
  max-width: 60ch;
  font-size: var(--text-base);
  color: var(--color-text-muted);
}

.home-shell {
  padding: 0 var(--space-6) var(--space-16);
}

.home-section__header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: var(--space-4);
  margin-bottom: var(--space-3);
  padding-bottom: var(--space-2);
  border-bottom: 2px solid var(--color-primary);
}

.home-section__title {
  margin: 0;
  font-family: 'Satoshi', 'Inter', sans-serif;
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--color-text);
}

.home-section__actions {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
}

.home-refresh-button {
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-primary);
  color: var(--color-primary);
  font-size: var(--text-sm);
  font-weight: 600;
  line-height: 1.2;
}

.home-refresh-button:hover:not(:disabled) {
  background: color-mix(in oklch, var(--color-primary) 10%, transparent);
}

.home-refresh-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.home-readonly-badge {
  display: inline-flex;
  align-items: center;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-text-muted);
  background: var(--color-surface-subtle);
  border: 1px solid var(--color-border);
}

.home-refresh-message {
  margin-bottom: var(--space-4);
  font-size: var(--text-sm);
}

.home-refresh-message--success {
  color: var(--color-success);
}

.home-refresh-message--error {
  color: var(--color-error);
}

.news-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(320px, 100%), 1fr));
  gap: var(--space-4);
}

.home-sentinel { height: 4px; }

.home-end-message {
  text-align: center;
  color: var(--color-text-faint);
  font-size: var(--text-sm);
  padding: var(--space-8);
}

@media (max-width: 640px) {
  .home-hero { padding: var(--space-8) var(--space-4); }
  .home-shell { padding: 0 var(--space-4) var(--space-12); }
  .home-hero__title { max-width: none; }
  .home-section__header {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
