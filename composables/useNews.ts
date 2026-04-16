import type { NewsItem, FilterCategory } from '~/types/climahub'
import { useFilterStore } from '~/stores/filter'

export function useNews() {
  const filterStore = useFilterStore()
  const supabase = useSupabaseClient()

  const news = ref<NewsItem[]>([])
  const hasMore = ref(true)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const currentPage = ref(1)
  const LIMIT = 10

  async function loadMore() {
    if (loading.value || !hasMore.value) return
    loading.value = true
    error.value = null

    try {
      const category = filterStore.activeCategory
      const params = new URLSearchParams({
        page: String(currentPage.value),
        limit: String(LIMIT)
      })
      if (category !== 'összes') params.set('category', category)

      const res = await $fetch<{  NewsItem[]; meta: { hasMore: boolean } }>(
        `/api/news?${params}`
      )

      news.value.push(...res.data)
      hasMore.value = res.meta.hasMore
      currentPage.value++
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Ismeretlen hiba'
    } finally {
      loading.value = false
    }
  }

  async function resetAndLoad(category?: FilterCategory) {
    if (category !== undefined) filterStore.setCategory(category)
    news.value = []
    currentPage.value = 1
    hasMore.value = true
    error.value = null
    await loadMore()
  }

  // Auto-reload when active category changes
  watch(() => filterStore.activeCategory, () => {
    resetAndLoad()
  })

  return { news, hasMore, loading, error, loadMore, resetAndLoad }
}
