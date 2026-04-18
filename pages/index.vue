<script setup lang="ts">
import { useNews } from '~/composables/useNews'
import { useInfiniteScroll } from '~/composables/useInfiniteScroll'

definePageMeta({
  layout: 'climahub',
  middleware: 'auth',
})

const {
  news,
  hasMore: newsHasMore,
  loading: newsLoading,
  loadMore: newsLoadMore,
} = useNews()
const { sentinelRef: newsSentinelRef } = useInfiniteScroll(newsLoadMore, newsHasMore)

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
        <h2 class="home-section__title">Legfrissebb hírek</h2>

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

.home-section__title {
  margin: 0 0 var(--space-6);
  padding-bottom: var(--space-2);
  font-family: 'Satoshi', 'Inter', sans-serif;
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--color-text);
  border-bottom: 2px solid var(--color-primary);
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
}
</style>
