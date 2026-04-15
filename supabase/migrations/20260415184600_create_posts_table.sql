-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: create_posts_table
-- Created:   2026-04-15
-- ─────────────────────────────────────────────────────────────────────────────


-- ─── Tábla létrehozása ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.posts (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT        NOT NULL,
  content     TEXT        NOT NULL,
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  public.posts            IS 'Felhasználók által létrehozott bejegyzések';
COMMENT ON COLUMN public.posts.id         IS 'Egyedi azonosító (UUID v4)';
COMMENT ON COLUMN public.posts.title      IS 'Bejegyzés címe';
COMMENT ON COLUMN public.posts.content    IS 'Bejegyzés tartalma';
COMMENT ON COLUMN public.posts.user_id    IS 'Szerző – FK az auth.users táblára';
COMMENT ON COLUMN public.posts.created_at IS 'Létrehozás időpontja (UTC)';


-- ─── Index ────────────────────────────────────────────────────────────────────
-- Gyors lekérdezés user_id alapján (pl. "saját bejegyzések" lista)

CREATE INDEX IF NOT EXISTS posts_user_id_idx ON public.posts(user_id);


-- ─── Row Level Security ───────────────────────────────────────────────────────

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;


-- ─── Policy: SELECT — mindenki olvashatja az összes sort ─────────────────────
-- Publikus feed esetén hasznos; ha csak bejelentkezett usernek kell,
-- cseréld USING (true) → USING (auth.uid() IS NOT NULL) -re.

CREATE POLICY "posts_select_all"
  ON public.posts
  FOR SELECT
  USING (true);


-- ─── Policy: INSERT — csak a saját user_id-jű sort lehet felvenni ────────────
-- WITH CHECK biztosítja, hogy a kliens ne tudjon más user_id-t beírni.

CREATE POLICY "posts_insert_own"
  ON public.posts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);


-- ─── Policy: UPDATE — csak saját sorok módosíthatók ──────────────────────────
-- USING: melyik sorhoz férhet hozzá | WITH CHECK: mire módosíthatja

CREATE POLICY "posts_update_own"
  ON public.posts
  FOR UPDATE
  USING     (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ─── Policy: DELETE — csak saját sorok törölhetők ────────────────────────────

CREATE POLICY "posts_delete_own"
  ON public.posts
  FOR DELETE
  USING (auth.uid() = user_id);
