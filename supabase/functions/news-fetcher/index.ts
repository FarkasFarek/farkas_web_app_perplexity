import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { fetchTavilyNews } from './tavily-search.ts'
import { fetchCurrentsNews } from './currents-search.ts'

Deno.serve(async (req: Request) => {
  const newsFetchSecret = Deno.env.get('NEWS_FETCH_SECRET')
  const authorizationHeader = req.headers.get('Authorization')

  if (!newsFetchSecret || authorizationHeader !== `Bearer ${newsFetchSecret}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const tavilyApiKey = Deno.env.get('TAVILY_API_KEY') ?? ''
  const currentsApiKey = Deno.env.get('CURRENTS_API_KEY') ?? ''

  const [tavilyResult, currentsResult] = await Promise.allSettled([
    fetchTavilyNews(tavilyApiKey),
    fetchCurrentsNews(currentsApiKey),
  ])

  const allNews = [
    ...(tavilyResult.status === 'fulfilled' ? tavilyResult.value : []),
    ...(currentsResult.status === 'fulfilled' ? currentsResult.value : []),
  ]

  const deduplicatedByUrl = Array.from(
    new Map(allNews.map((item) => [item.source_url, item])).values(),
  )
  const seenTitleKeys = new Set<string>()
  const deduplicatedNews = deduplicatedByUrl.filter((item) => {
    const key = item.title.trim().toLocaleLowerCase('hu-HU')
    if (!key) return false
    if (seenTitleKeys.has(key)) return false
    seenTitleKeys.add(key)
    return true
  })

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

  let inserted = 0
  let skipped = 0
  const errors: string[] = []

  if (tavilyResult.status === 'rejected') {
    errors.push(`Tavily: ${tavilyResult.reason instanceof Error ? tavilyResult.reason.message : String(tavilyResult.reason)}`)
  }

  if (currentsResult.status === 'rejected') {
    errors.push(`Currents: ${currentsResult.reason instanceof Error ? currentsResult.reason.message : String(currentsResult.reason)}`)
  }

  for (const item of deduplicatedNews) {
    const { error } = await supabase.from('news').insert(item)

    if (error) {
      if (error.code === '23505') {
        skipped += 1
      } else {
        errors.push(error.message)
      }
    } else {
      inserted += 1
    }
  }

  return new Response(
    JSON.stringify({
      inserted,
      skipped,
      errors,
      timestamp: new Date().toISOString(),
    }),
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
})
