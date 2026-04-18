import {
  isCategoryRelevant,
  isLikelyNewsItem,
  prioritizeHungarianNews,
  translateNewsToHungarianBestEffort,
} from './news-processing.ts'

export interface NewsItem {
  title: string
  source_url: string
  summary: string
  source_name: string
  image_url: string | null
  published_at: string
  category: 'klíma' | 'hőszivattyú' | 'okos_otthon'
}

export const TAVILY_QUERIES = [
  {
    query: 'klíma légkondicionáló hűtés fűtés Magyarország energiahatékonyság legfrissebb',
    category: 'klíma',
    include_domains: [
      'hvg.hu', 'portfolio.hu', 'index.hu', '24.hu', 'energiainfo.hu',
      'epiteszforum.hu', 'magyarepitok.hu', 'pestbuda.hu',
      'hvacnews.com', 'achrnews.com',
    ],
  },
  {
    query: 'hőszivattyú fűtés geotermikus COP megújuló energia Magyarország legfrissebb',
    category: 'hőszivattyú',
    include_domains: [
      'hvg.hu', 'portfolio.hu', 'index.hu', '24.hu', 'energiainfo.hu',
      'epiteszforum.hu', 'magyarepitok.hu',
      'heatpumpingtechnologies.org', 'ehpa.org', 'achrnews.com',
    ],
  },
  {
    query: 'okos otthon home assistant zigbee z-wave matter integráció automatizálás legfrissebb',
    category: 'okos_otthon',
    include_domains: [
      'hvg.hu', 'index.hu', '24.hu', 'sg.hu',
      'home-assistant.io', 'smarthomeworld.in', 'iot-now.com',
    ],
  },
  {
    query: 'HVAC air conditioning heating efficiency Europe regulation news',
    category: 'klíma',
    include_domains: [
      'hvacnews.com', 'achrnews.com', 'hvacinformed.com',
      'hvg.hu', 'portfolio.hu', 'index.hu',
    ],
  },
  {
    query: 'heat pump hydronic heating geothermal Europe policy market news',
    category: 'hőszivattyú',
    include_domains: [
      'heatpumpingtechnologies.org', 'ehpa.org', 'achrnews.com',
      'hvg.hu', 'portfolio.hu', 'index.hu',
    ],
  },
  {
    query: 'smart home automation home assistant integration zigbee z-wave matter news',
    category: 'okos_otthon',
    include_domains: [
      'home-assistant.io', 'iot-now.com', 'sg.hu',
      'hvg.hu', 'index.hu', '24.hu',
    ],
  },
] as const

const TAVILY_URL = 'https://api.tavily.com/search'

interface TavilySearchResult {
  title?: unknown
  url?: unknown
  content?: unknown
  images?: unknown
  published_date?: unknown
  score?: unknown
}

interface TavilySearchResponse {
  results?: unknown
}

const PRIMARY_SCORE_THRESHOLD = 0.4
const FALLBACK_SCORE_THRESHOLD = 0.01

interface MappedCandidate {
  item: NewsItem
  score: number
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

const mapTavilyResult = (
  result: TavilySearchResult,
  category: NewsItem['category'],
): MappedCandidate | null => {
  if (typeof result.score !== 'number' || !Number.isFinite(result.score)) {
    return null
  }

  if (typeof result.url !== 'string' || !isValidUrl(result.url)) {
    return null
  }

  if (typeof result.title !== 'string' || result.title.trim().length === 0) {
    return null
  }

  const parsedUrl = new URL(result.url)
  const images = Array.isArray(result.images) ? result.images : []
  const firstImage = images[0]

  return {
    item: {
      title: result.title.trim(),
      source_url: result.url,
      summary: typeof result.content === 'string' ? result.content : '',
      source_name: parsedUrl.hostname.replace('www.', ''),
      image_url: typeof firstImage === 'string' ? firstImage : null,
      published_at: typeof result.published_date === 'string'
        ? result.published_date
        : new Date().toISOString(),
      category,
    },
    score: result.score,
  }
}

const fetchQueryResults = async (
  apiKey: string,
  query: string,
  category: NewsItem['category'],
  includeDomains: readonly string[],
): Promise<NewsItem[]> => {
  const response = await fetch(TAVILY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      topic: 'news',
      time_range: 'week',
      search_depth: 'advanced',
      max_results: 5,
      include_images: true,
      include_answer: false,
      include_raw_content: false,
      include_domains: includeDomains,
    }),
  })

  if (!response.ok) {
    throw new Error(`Tavily request failed (${response.status}): ${query}`)
  }

  const data = (await response.json()) as TavilySearchResponse
  if (!Array.isArray(data.results)) {
    throw new Error(`Tavily response did not include a results array: ${query}`)
  }

  const candidates = data.results
    .map((item) => mapTavilyResult(item as TavilySearchResult, category))
    .filter((item): item is MappedCandidate => item !== null)
    .filter(({ item }) => isCategoryRelevant(item) && isLikelyNewsItem(item))

  const highQuality = candidates.filter(({ score }) => score > PRIMARY_SCORE_THRESHOLD)
  if (highQuality.length > 0) {
    const prioritized = prioritizeHungarianNews(highQuality.map(({ item }) => item))
    return translateNewsToHungarianBestEffort(prioritized)
  }

  // Tavily news scores can be much lower for niche queries; use a softer fallback.
  const fallback = candidates.filter(({ score }) => score > FALLBACK_SCORE_THRESHOLD)
  if (fallback.length > 0) {
    const prioritized = prioritizeHungarianNews(fallback.map(({ item }) => item))
    return translateNewsToHungarianBestEffort(prioritized)
  }

  // Last resort: keep the strongest valid hits rather than returning an empty set.
  const strongest = candidates
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map(({ item }) => item)

  const prioritized = prioritizeHungarianNews(strongest)
  return translateNewsToHungarianBestEffort(prioritized)
}

export async function fetchTavilyNews(apiKey: string): Promise<NewsItem[]> {
  if (!apiKey) {
    throw new Error('Missing Tavily API key.')
  }

  const newsByQuery = await Promise.all(
    TAVILY_QUERIES.map(({ query, category, include_domains }) => (
      fetchQueryResults(apiKey, query, category, include_domains)
    )),
  )

  return newsByQuery.flat()
}
