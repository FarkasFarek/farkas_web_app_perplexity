import type { FetchError } from 'ofetch'
import { createClient } from '@supabase/supabase-js'
import { serverSupabaseUser } from '#supabase/server'

type RefreshResponse = {
  inserted: number
  skipped: number
  errors: string[]
  timestamp: string
}

type ErrorResponse = {
  error?: string
  message?: string
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const supabaseUrl = pickFirstNonEmpty(
    config.public.supabaseUrl,
    process.env.SUPABASE_URL,
    process.env.NUXT_PUBLIC_SUPABASE_URL,
  )
  const supabaseServiceRoleKey = pickFirstNonEmpty(
    config.supabaseServiceRoleKey,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  )
  const newsFetchSecret = pickFirstNonEmpty(
    config.newsFetchSecret,
    process.env.NEWS_FETCH_SECRET,
    process.env.NUXT_NEWS_FETCH_SECRET,
  )

  let user = await serverSupabaseUser(event)

  if (!user) {
    const bearerToken = extractBearerToken(getHeader(event, 'authorization'))

    if (bearerToken) {
      if (!supabaseUrl || !supabaseServiceRoleKey) {
        throw createError({
          statusCode: 500,
          statusMessage: 'Server misconfiguration: missing supabaseUrl or supabaseServiceRoleKey for bearer auth fallback',
        })
      }

      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)
      const { data, error } = await supabaseAdmin.auth.getUser(bearerToken)

      if (error) {
        throw createError({
          statusCode: 401,
          statusMessage: `Unauthorized: invalid bearer token (${error.message})`,
        })
      }

      user = data.user
    }
  }

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized: authentication required',
    })
  }

  const appRole = typeof user.app_metadata?.role === 'string'
    ? user.app_metadata.role
    : undefined
  const fallbackRole = typeof user.user_metadata?.role === 'string'
    ? user.user_metadata.role
    : undefined
  const role = (appRole ?? fallbackRole ?? '').trim().toLowerCase()

  if (role !== 'admin') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden: admin role required',
    })
  }

  const missing: string[] = []
  if (!supabaseUrl) {
    missing.push('supabaseUrl (public.supabaseUrl | SUPABASE_URL | NUXT_PUBLIC_SUPABASE_URL)')
  }
  if (!newsFetchSecret) {
    missing.push('newsFetchSecret (newsFetchSecret | NEWS_FETCH_SECRET | NUXT_NEWS_FETCH_SECRET)')
  }

  if (missing.length > 0) {
    throw createError({
      statusCode: 500,
      statusMessage: `Server misconfiguration: missing ${missing.join(', ')}`,
    })
  }

  const edgeFunctionUrl = `${supabaseUrl}/functions/v1/news-fetcher`

  try {
    const response = await $fetch.raw<RefreshResponse | ErrorResponse>(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${newsFetchSecret}`,
        'Content-Type': 'application/json',
      },
      body: {},
      ignoreResponseError: true,
    })

    if (!response.ok) {
      const payloadMessage = typeof response._data?.message === 'string'
        ? response._data.message
        : typeof response._data?.error === 'string'
          ? response._data.error
          : undefined

      throw createError({
        statusCode: response.status || 502,
        statusMessage: payloadMessage
          ? `News refresh failed (HTTP ${response.status}): ${payloadMessage}`
          : `News refresh failed (HTTP ${response.status})`,
      })
    }

    return response._data
  }
  catch (error: unknown) {
    if (isFetchError(error)) {
      throw createError({
        statusCode: 502,
        statusMessage: `News refresh request error: ${error.message}`,
      })
    }

    throw error
  }
})

function isFetchError(error: unknown): error is FetchError {
  return typeof error === 'object'
    && error !== null
    && 'name' in error
    && error.name === 'FetchError'
}

function pickFirstNonEmpty(...values: Array<string | undefined>): string | undefined {
  for (const value of values) {
    if (typeof value === 'string' && value.trim().length > 0) {
      return value
    }
  }

  return undefined
}

function extractBearerToken(authorizationHeader: string | undefined): string | null {
  if (typeof authorizationHeader !== 'string') {
    return null
  }

  const [scheme, ...tokenParts] = authorizationHeader.trim().split(/\s+/)
  if (scheme?.toLowerCase() !== 'bearer') {
    return null
  }

  const token = tokenParts.join(' ').trim()
  return token.length > 0 ? token : null
}
