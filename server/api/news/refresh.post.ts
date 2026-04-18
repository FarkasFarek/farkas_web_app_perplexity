import type { FetchError } from 'ofetch'
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
  const user = await serverSupabaseUser(event)

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

  const config = useRuntimeConfig()
  const supabaseUrl = config.public.supabaseUrl
  const newsFetchSecret = config.newsFetchSecret

  if (!supabaseUrl || !newsFetchSecret) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Server misconfiguration: missing SUPABASE_URL or NEWS_FETCH_SECRET',
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
      const message = typeof response._data?.message === 'string'
        ? response._data.message
        : typeof response._data?.error === 'string'
          ? response._data.error
          : `Edge function request failed with status ${response.status}`

      throw createError({
        statusCode: response.status || 502,
        statusMessage: `News refresh failed: ${message}`,
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
