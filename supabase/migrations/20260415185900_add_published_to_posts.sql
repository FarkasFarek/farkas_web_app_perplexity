-- Migration: add_published_to_posts
-- Created:   2026-04-15
-- Leiras:    Hozzaadja a 'published' boolean mezot a posts tablhoz.
--            Alapertelmezett ertek: false (draft allapot).

ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS published BOOLEAN NOT NULL DEFAULT false;

-- Index a gyors szures miatt (WHERE published = true)
CREATE INDEX IF NOT EXISTS posts_published_idx ON public.posts(published);

COMMENT ON COLUMN public.posts.published IS 'Ha true, a post nyilvanosan lathato';
