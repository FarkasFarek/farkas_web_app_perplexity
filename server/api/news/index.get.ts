import { createClient } from '@supabase/supabase-js'
import type { NewsItem, ProductCategory } from '~/types/climahub'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const supabase = createClient(
    config.public.supabaseUrl,
    config.supabaseServiceRoleKey
  )

  const query = getQuery(event)
  const page  = Math.max(1, Number(query.page)  || 1)
  const limit = Math.min(50, Math.max(1, Number(query.limit) || 10))
  const category = query.category as ProductCategory | undefined
  const offset = (page - 1) * limit

  let dbQuery = supabase
    .from('news')
    .select('*', { count: 'exact' })
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1)

  // Whitelist értékek egyeznek a DB-ben tárolt category értékekkel
  const VALID_CATEGORIES = ['klíma', 'hőszivattyú', 'okos_otthon'] as const
  if (category && VALID_CATEGORIES.includes(category as typeof VALID_CATEGORIES[number])) {
    dbQuery = dbQuery.eq('category', category)
  }

  // Supabase JS v2: { data, error, count } — NEM rows!
  const { data, error, count } = await dbQuery

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  const total      = count ?? 0
  const totalPages = Math.ceil(total / limit)

  return {
    items: (data ?? []) as NewsItem[],
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasMore: page < totalPages,
    },
  }
})
