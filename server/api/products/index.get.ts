import { createClient } from '@supabase/supabase-js'
import type { PaginatedResponse } from '~/types/api'
import type { Product, ProductCategory } from '~/types/climahub'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const supabase = createClient(
    config.public.supabaseUrl,
    config.supabaseServiceRoleKey
  )

  const query = getQuery(event)
  const page = Math.max(1, Number(query.page) || 1)
  const limit = Math.min(50, Math.max(1, Number(query.limit) || 12))
  const category = query.category as ProductCategory | undefined
  const offset = (page - 1) * limit

  let dbQuery = supabase
    .from('products')
    .select('*', { count: 'exact' })
    .eq('published', true)
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (category && ['klíma', 'hőszivattyú', 'okos_otthon'].includes(category)) {
    dbQuery = dbQuery.eq('category', category)
  }

  const { data, error, count } = await dbQuery

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  const total = count ?? 0
  const totalPages = Math.ceil(total / limit)

  return {
     data as Product[],
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasMore: page < totalPages
    }
  } satisfies PaginatedResponse<Product>
})
