// --- Post types -----------------------------------------------------------
// Tukrozi a supabase/migrations/20260415184600_create_posts_table.sql semajat.
// Ha a tabla valtozik, ezt a fajlt is frissitsd.

export interface Post {
  id: string           // UUID
  title: string
  content: string
  user_id: string      // UUID - FK -> auth.users.id
  created_at: string   // ISO 8601 timestamptz
}

// --- Muveleti tipusok -----------------------------------------------------
// id es created_at kihagyva - ezeket az adatbazis generalja automatikusan.
// user_id kihagyva - a szerver/RLS tolti ki auth.uid() alapjan.

export type CreatePostPayload = Pick<Post, 'title' | 'content'>

export type UpdatePostPayload = Partial<Pick<Post, 'title' | 'content'>>
