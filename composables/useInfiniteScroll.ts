export function useInfiniteScroll(
  loadMore: () => Promise<void>,
  hasMore: Ref<boolean>
) {
  const sentinelRef = ref<HTMLElement | null>(null)
  const isLoading = ref(false)

  // Detect prefers-reduced-motion
  const prefersReducedMotion =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false

  let observer: IntersectionObserver | null = null

  async function handleIntersect(entries: IntersectionObserverEntry[]) {
    const entry = entries[0]
    if (!entry?.isIntersecting || !hasMore.value || isLoading.value) return

    isLoading.value = true
    if (!prefersReducedMotion && sentinelRef.value) {
      sentinelRef.value.style.opacity = '0.5'
    }

    await loadMore()

    isLoading.value = false
    if (!prefersReducedMotion && sentinelRef.value) {
      sentinelRef.value.style.opacity = '1'
    }
  }

  onMounted(() => {
    if (!sentinelRef.value) return
    observer = new IntersectionObserver(handleIntersect, {
      rootMargin: '200px'
    })
    observer.observe(sentinelRef.value)
  })

  onUnmounted(() => {
    observer?.disconnect()
    observer = null
  })

  return { sentinelRef, isLoading }
}
