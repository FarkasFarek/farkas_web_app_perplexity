import type { PaginatedResponse } from '~/types/api'

export type NewsCategory = 'klíma' | 'hőszivattyú' | 'okos_otthon'

export interface NewsItem {
  id: string
  title: string
  summary: string | null
  source_url: string
  source_name: string
  image_url: string | null
  category: NewsCategory
  published_at: string
  created_at: string
}

export type FilterCategory = NewsCategory | 'összes'

export type PaginatedNews = PaginatedResponse<NewsItem>
