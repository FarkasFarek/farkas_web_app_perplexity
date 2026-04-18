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
  <div class="mx-auto max-w-7xl space-y-16 px-4 py-8">

    <!-- Hírek -->
    <section id="hirek">
      <h2 class="mb-6 text-xl font-bold" style="color: var(--color-text);">Újdonságok</h2>

      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <template v-if="newsLoading && news.length === 0">
          <NewsCard v-for="n in SKELETON_COUNT" :key="`news-sk-${n}`" />
        </template>
        <template v-else>
          <NewsCard v-for="item in news" :key="item.id" :news="item" />
        </template>
      </div>

      <div ref="newsSentinelRef" class="h-4" />

      <p
        v-if="!newsHasMore && news.length > 0"
        class="mt-6 text-center text-sm"
        style="color: var(--color-text-faint);"
      >
        Nincs több tartalom
      </p>
    </section>

    <!-- Termékek -->
    <section id="termekek">
      <h2 class="mb-6 text-xl font-bold" style="color: var(--color-text);">Ajánlott termékek</h2>

      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <template v-if="productsLoading && products.length === 0">
          <ProductCard v-for="n in SKELETON_COUNT" :key="`product-sk-${n}`" />
        </template>
        <template v-else>
          <ProductCard v-for="item in products" :key="item.id" :product="item" />
        </template>
      </div>

      <div ref="productSentinelRef" class="h-4" />

      <p
        v-if="!productsHasMore && products.length > 0"
        class="mt-6 text-center text-sm"
        style="color: var(--color-text-faint);"
      >
        Nincs több tartalom
      </p>
    </section>

  </div>
</template>
