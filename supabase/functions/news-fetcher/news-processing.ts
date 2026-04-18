import type { NewsItem } from './tavily-search.ts'

type NewsCategory = NewsItem['category']

const CATEGORY_KEYWORDS: Record<NewsCategory, readonly string[]> = {
  klíma: [
    'klima',
    'legkondicionalo',
    'hutes',
    'futes',
    'hvac',
    'air conditioning',
    'cooling',
  ],
  hőszivattyú: [
    'hoszivattyu',
    'heat pump',
    'geothermal',
    'hydronic',
    'cop',
  ],
  okos_otthon: [
    'okos otthon',
    'smart home',
    'home assistant',
    'home automation',
    'smart lighting',
    'smart thermostat',
    'iot',
    'zigbee',
    'z-wave',
    'integracio',
  ],
}

const CATEGORY_MIN_MATCHES: Record<NewsCategory, number> = {
  klíma: 1,
  hőszivattyú: 1,
  okos_otthon: 1,
}

const ALL_KEYWORDS = Object.values(CATEGORY_KEYWORDS).flat()

const HUNGARIAN_CHARS_REGEX = /[áéíóöőúüű]/i
const ENGLISH_WORD_REGEX = /\b(the|and|for|with|from|this|that|is|are|will|new)\b/i
const HUNGARIAN_WORDS = [
  'es',
  'hogy',
  'nem',
  'egy',
  'klima',
  'hoszivattyu',
  'futes',
  'hutes',
  'otthon',
  'integracio',
  'magyarorszag',
] as const

const TRANSLATION_ENDPOINT = 'https://api.mymemory.translated.net/get'
const translationCache = new Map<string, string>()
const BLOCKED_SOURCE_HOSTS = [
  'community.home-assistant.io',
  'reddit.com',
  'www.reddit.com',
] as const
const BLOCKED_SOURCE_PREFIXES = ['forum.', 'forums.', 'community.'] as const
const DISCUSSION_TITLE_HINTS = ['forum', 'thread', 'community', 'q&a', 'question', 'help'] as const

interface TranslationResponse {
  responseData?: {
    translatedText?: unknown
  }
}

const normalizeText = (text: string): string => (
  text
    .toLocaleLowerCase('hu-HU')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
)

const countMatches = (text: string, keywords: readonly string[]): number => (
  keywords.reduce((count, keyword) => (
    text.includes(normalizeText(keyword)) ? count + 1 : count
  ), 0)
)

const getCombinedText = (item: Pick<NewsItem, 'title' | 'summary'>): string => (
  normalizeText(`${item.title} ${item.summary}`)
)

export const isCategoryRelevant = (item: Pick<NewsItem, 'title' | 'summary' | 'category'>): boolean => {
  const text = getCombinedText(item)
  const currentCategoryKeywords = CATEGORY_KEYWORDS[item.category]
  const primaryMatches = countMatches(text, currentCategoryKeywords)
  const minimumMatches = CATEGORY_MIN_MATCHES[item.category]

  if (primaryMatches < minimumMatches) {
    return false
  }

  const otherMatches = countMatches(
    text,
    ALL_KEYWORDS.filter((keyword) => !currentCategoryKeywords.includes(keyword)),
  )

  return primaryMatches >= otherMatches
}

export const isLikelyHungarianText = (text: string): boolean => {
  if (!text.trim()) {
    return false
  }

  if (HUNGARIAN_CHARS_REGEX.test(text)) {
    return true
  }

  const normalized = normalizeText(text)
  const tokens = normalized
    .split(/[^a-z0-9-]+/g)
    .filter(Boolean)

  const wordMatches = HUNGARIAN_WORDS.reduce((count, word) => (
    tokens.includes(word) ? count + 1 : count
  ), 0)

  return wordMatches >= 2
}

export const isLikelyNewsItem = (item: Pick<NewsItem, 'title' | 'source_url' | 'source_name'>): boolean => {
  const sourceName = item.source_name.toLocaleLowerCase('en-US')
  const normalizedTitle = normalizeText(item.title)
  const normalizedUrl = normalizeText(item.source_url)

  if (BLOCKED_SOURCE_HOSTS.includes(sourceName as typeof BLOCKED_SOURCE_HOSTS[number])) {
    return false
  }

  if (BLOCKED_SOURCE_PREFIXES.some((prefix) => sourceName.startsWith(prefix))) {
    return false
  }

  if (DISCUSSION_TITLE_HINTS.some((hint) => normalizedTitle.includes(hint))) {
    return false
  }

  if (normalizedTitle.includes('?') || normalizedUrl.includes('/t/')) {
    return false
  }

  return true
}

const isLikelyEnglishText = (text: string): boolean => {
  if (!text.trim()) {
    return false
  }

  if (HUNGARIAN_CHARS_REGEX.test(text)) {
    return false
  }

  return ENGLISH_WORD_REGEX.test(text) || /^[\x00-\x7F\s.,:;!?()'"%-]+$/.test(text)
}

const translateTextBestEffort = async (text: string): Promise<string> => {
  const normalizedText = text.trim()
  if (!normalizedText) {
    return text
  }

  const cached = translationCache.get(normalizedText)
  if (cached !== undefined) {
    return cached
  }

  try {
    const params = new URLSearchParams({
      q: normalizedText,
      langpair: 'en|hu',
    })

    const response = await fetch(`${TRANSLATION_ENDPOINT}?${params.toString()}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      translationCache.set(normalizedText, normalizedText)
      return normalizedText
    }

    const data = (await response.json()) as TranslationResponse
    const translated = typeof data.responseData?.translatedText === 'string'
      ? data.responseData.translatedText.trim()
      : ''

    const finalText = translated || normalizedText
    translationCache.set(normalizedText, finalText)
    return finalText
  } catch {
    translationCache.set(normalizedText, normalizedText)
    return normalizedText
  }
}

const prioritizeHungarian = <T extends Pick<NewsItem, 'title' | 'summary'>>(items: T[]): T[] => (
  items.slice().sort((left, right) => {
    const leftIsHungarian = isLikelyHungarianText(`${left.title} ${left.summary}`)
    const rightIsHungarian = isLikelyHungarianText(`${right.title} ${right.summary}`)

    if (leftIsHungarian === rightIsHungarian) {
      return 0
    }

    return leftIsHungarian ? -1 : 1
  })
)

export const prioritizeHungarianNews = <T extends Pick<NewsItem, 'title' | 'summary'>>(items: T[]): T[] => (
  prioritizeHungarian(items)
)

export const translateNewsToHungarianBestEffort = async <T extends NewsItem>(items: T[]): Promise<T[]> => {
  const translated = await Promise.all(
    items.map(async (item) => {
      const combinedText = `${item.title} ${item.summary}`
      if (isLikelyHungarianText(combinedText) || !isLikelyEnglishText(combinedText)) {
        return item
      }

      const [translatedTitle, translatedSummary] = await Promise.all([
        translateTextBestEffort(item.title),
        translateTextBestEffort(item.summary),
      ])

      return {
        ...item,
        title: translatedTitle,
        summary: translatedSummary,
      }
    }),
  )

  return translated
}
