import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import type { Product, NewsItem } from '~/types/climahub'

const querySchema = z.object({
  q: z.string().min(2, 'Search query must be at least 2 characters')
})

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const supabase = createClient(
    config.public.supabaseUrl,
    config.supabaseServiceRoleKey
  )

  const rawQuery = getQuery(event)
  const parsed = querySchema.safeParse(rawQuery)

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: parsed.error.errors[0]?.message ?? 'Invalid query'
    })
  }

  const { q } = parsed.data
  const pattern = `%${q}%`

  const [productsResult, newsResult] = await Promise.all([
    supabase
      .from('products')
      .select('*')
      .eq('published', true)
      .or(`name.ilike.${pattern},brand.ilike.${pattern}`)
      .order('published_at', { ascending: false })
      .limit(5),
    supabase
      .from('news')
      .select('*')
      .or(`title.ilike.${pattern},summary.ilike.${pattern}`)
      .order('published_at', { ascending: false })
      .limit(5)
  ])

  if (productsResult.error) {
    throw createError({ statusCode: 500, statusMessage: productsResult.error.message })
  }
  if (newsResult.error) {
    throw createError({ statusCode: 500, statusMessage: newsResult.error.message })
  }

  return {
    products: (productsResult.data ?? []) as Product[],
    news: (newsResult.data ?? []) as NewsItem[]
  }
})
