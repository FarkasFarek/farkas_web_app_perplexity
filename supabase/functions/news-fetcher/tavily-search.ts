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
  { query: 'klíma légkondicionáló Magyarország legfrissebb', category: 'klíma' },
  { query: 'hőszivattyú fűtés megújuló energia legfrissebb', category: 'hőszivattyú' },
  { query: 'okos otthon smart home automatizálás legfrissebb', category: 'okos_otthon' },
  { query: 'HVAC air conditioning news Europe 2026', category: 'klíma' },
  { query: 'heat pump renewable heating news 2026', category: 'hőszivattyú' },
  { query: 'smart home automation news 2026', category: 'okos_otthon' },
] as const

const TAVILY_URL = 'https://api.tavily.com/search'
const INCLUDED_DOMAINS = [
  'hvg.hu', 'portfolio.hu', 'sg.hu', 'index.hu', '24.hu',
  'epiteszforum.hu', 'energiainfo.hu',
  'hvacnews.com', 'heatpumpingtechnologies.org',
  'home-assistant.io', 'techradar.com', 'theverge.com',
] as const

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
      include_domains: INCLUDED_DOMAINS,
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

  const highQuality = candidates.filter(({ score }) => score > PRIMARY_SCORE_THRESHOLD)
  if (highQuality.length > 0) {
    return highQuality.map(({ item }) => item)
  }

  // Tavily news scores can be much lower for niche queries; use a softer fallback.
  const fallback = candidates.filter(({ score }) => score > FALLBACK_SCORE_THRESHOLD)
  if (fallback.length > 0) {
    return fallback.map(({ item }) => item)
  }

  // Last resort: keep the strongest valid hits rather than returning an empty set.
  return candidates
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map(({ item }) => item)
}

export async function fetchTavilyNews(apiKey: string): Promise<NewsItem[]> {
  if (!apiKey) {
    throw new Error('Missing Tavily API key.')
  }

  const newsByQuery = await Promise.all(
    TAVILY_QUERIES.map(({ query, category }) => fetchQueryResults(apiKey, query, category)),
  )

  return newsByQuery.flat()
}
