import type { Post } from '~/types/post'
import type { PaginatedResponse } from '~/types/api'

// --- GET /api/posts -------------------------------------------------------
// Paginalt lista az osszes published post-rol.
// Admin klienst hasznal (service role), ezert RLS-t megkeruli —
// szandekos: a szerver maga donti el, mit ad vissza (published = true szures).
//
// Query parameterek:
//   page  (szam, min: 1,   default: 1)
//   limit (szam, min: 1, max: 100, default: 10)
//
// Valasz:
//   {  Post[], pagination: { page, limit, total, totalPages } }

export default defineEventHandler(
  async (event): Promise<PaginatedResponse<Post>> => {

    // --- Query params beolvasasa & validalasa ----------------------------

    const query = getQuery(event)

    const page  = Math.max(1,   Number(query.page)  || 1)
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 10))

    const from = (page - 1) * limit
    const to   = from + limit - 1

    // --- Supabase admin lekerdezes --------------------------------------

    const supabase = useSupabaseAdmin()

    const { data, error, count } = await supabase
      .from('posts')
      .select('*', { count: 'exact' })
      .eq('published', true)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: error.message,
      })
    }

    // --- Valasz osszeallitasa -------------------------------------------

    return {
       (data ?? []) as Post[],
      pagination: {
        page,
        limit,
        total:      count ?? 0,
        totalPages: Math.ceil((count ?? 0) / limit),
      },
    }
  },
)
