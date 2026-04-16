import type { PaginatedResponse } from '~/types/api'

export type ProductCategory = 'klíma' | 'hőszivattyú' | 'okos_otthon'

export interface Product {
  id: string
  name: string
  brand: string
  category: ProductCategory
  description: string | null
  price_min: number | null
  price_max: number | null
  image_url: string | null
  affiliate_url: string | null
  published: boolean
  published_at: string | null
  created_at: string
}

export interface NewsItem {
  id: string
  title: string
  summary: string | null
  source_url: string
  source_name: string
  image_url: string | null
  category: ProductCategory
  published_at: string
  created_at: string
}

export type FilterCategory = ProductCategory | 'összes'

// Re-export paginated response types for ClimaHub usage
export type PaginatedProducts = PaginatedResponse<Product>
export type PaginatedNews = PaginatedResponse<NewsItem>
