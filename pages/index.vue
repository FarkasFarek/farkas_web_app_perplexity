<script setup lang="ts">
import { useNews } from '~/composables/useNews'
import { useProducts } from '~/composables/useProducts'
import { useInfiniteScroll } from '~/composables/useInfiniteScroll'

// Nyilvános oldal — nincs auth middleware
definePageMeta({ layout: 'climahub' })

const {
  news,
  hasMore: newsHasMore,
  loading: newsLoading,
  loadMore: newsLoadMore,
} = useNews()
const { sentinelRef: newsSentinelRef } = useInfiniteScroll(newsLoadMore, newsHasMore)

const {
  products,
  hasMore: productsHasMore,
  loading: productsLoading,
  loadMore: productsLoadMore,
} = useProducts()
const { sentinelRef: productSentinelRef } = useInfiniteScroll(productsLoadMore, productsHasMore)

onMounted(() => {
  void newsLoadMore()
  void productsLoadMore()
})

const SKELETON_COUNT = 6
</script>

<template>
  <div class="home-page">
    <section class="home-hero">
      <div class="home-hero__inner">
        <h1 class="home-hero__title">Klíma, hőszivattyú és okos otthon — egy helyen.</h1>
        <p class="home-hero__text">
          A legfrissebb termékek és hírek a klímatechnika világából.
        </p>
      </div>
    </section>

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

        <p
          v-if="!newsHasMore && news.length > 0"
          class="home-end-message"
        >
          Nincs több tartalom
        </p>
      </section>

      <div class="home-divider" aria-hidden="true"></div>

      <section id="termekek" class="home-section">
        <h2 class="home-section__title">Termékek</h2>

        <div class="product-grid">
          <template v-if="productsLoading && products.length === 0">
            <ProductCard v-for="n in SKELETON_COUNT" :key="`product-sk-${n}`" />
          </template>
          <template v-else>
            <ProductCard v-for="item in products" :key="item.id" :product="item" />
          </template>
        </div>

        <div ref="productSentinelRef" class="home-sentinel" />

        <p
          v-if="!productsHasMore && products.length > 0"
          class="home-end-message"
        >
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

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(280px, 100%), 1fr));
  gap: var(--space-4);
}

.home-divider {
  margin: var(--space-16) 0;
  height: 1px;
  background: var(--color-divider);
}

.home-sentinel,
.home-end-message {
  text-align: center;
  color: var(--color-text-faint);
  font-size: var(--text-sm);
  padding: var(--space-8);
}

.home-sentinel {
  height: auto;
}

@media (max-width: 640px) {
  .home-hero {
    padding: var(--space-8) var(--space-4);
  }

  .home-shell {
    padding: 0 var(--space-4) var(--space-12);
  }

  .home-hero__title {
    max-width: none;
  }
}
</style>
