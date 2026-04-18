import type { NewsItem } from './tavily-search.ts'
import {
  isCategoryRelevant,
  isLikelyNewsItem,
  prioritizeHungarianNews,
  translateNewsToHungarianBestEffort,
} from './news-processing.ts'

export const CURRENTS_QUERIES = [
  { keywords: 'klíma légkondicionáló', category: 'klíma' },
  { keywords: 'hőszivattyú fűtés', category: 'hőszivattyú' },
  { keywords: 'okos otthon smart home', category: 'okos_otthon' },
] as const

const CURRENTS_URL = 'https://api.currentsapi.services/v1/search'

interface CurrentsNewsResponse {
  news?: unknown
}

interface CurrentsRawNewsItem {
  title?: unknown
  url?: unknown
  description?: unknown
  image?: unknown
  published?: unknown
}

const isValidUrl = (value: string): boolean => {
  try {
    // eslint-disable-next-line no-new
    new URL(value)
    return true
  } catch {
    return false
  }
}

const mapCurrentsNewsItem = (
  item: CurrentsRawNewsItem,
  category: NewsItem['category'],
): NewsItem | null => {
  if (typeof item.url !== 'string' || !isValidUrl(item.url)) {
    return null
  }

  if (typeof item.title !== 'string' || item.title.trim() === '') {
    return null
  }

  const parsedUrl = new URL(item.url)

  return {
    title: item.title,
    source_url: item.url,
    summary: typeof item.description === 'string' ? item.description : '',
    source_name: parsedUrl.hostname,
    image_url: typeof item.image === 'string' ? item.image : null,
    published_at: typeof item.published === 'string'
      ? item.published
      : new Date().toISOString(),
    category,
  }
}

const fetchQueryResults = async (
  apiKey: string,
  keywords: string,
  category: NewsItem['category'],
  startDate: string,
): Promise<NewsItem[]> => {
  const params = new URLSearchParams({
    apiKey,
    keywords,
    language: 'hu,en',
    start_date: startDate,
    page_size: '5',
  })

  const response = await fetch(`${CURRENTS_URL}?${params.toString()}`, {
    method: 'GET',
  })

  if (!response.ok) {
    throw new Error(`Currents request failed (${response.status}): ${keywords}`)
  }

  const data = (await response.json()) as CurrentsNewsResponse
  if (!Array.isArray(data.news)) {
    throw new Error(`Currents response did not include a news array: ${keywords}`)
  }

  const mappedItems = data.news
    .map((item) => mapCurrentsNewsItem(item as CurrentsRawNewsItem, category))
    .filter((item): item is NewsItem => item !== null)
    .filter((item) => isCategoryRelevant(item) && isLikelyNewsItem(item))

  const prioritizedItems = prioritizeHungarianNews(mappedItems)
  return translateNewsToHungarianBestEffort(prioritizedItems)
}

export async function fetchCurrentsNews(apiKey: string): Promise<NewsItem[]> {
  if (!apiKey) {
    throw new Error('Missing Currents API key.')
  }

  const startDate = new Date(Date.now() - (7 * 24 * 60 * 60 * 1000)).toISOString()

  const newsByQuery = await Promise.all(
    CURRENTS_QUERIES.map(({ keywords, category }) => (
      fetchQueryResults(apiKey, keywords, category, startDate)
    )),
  )

  return newsByQuery.flat()
}
