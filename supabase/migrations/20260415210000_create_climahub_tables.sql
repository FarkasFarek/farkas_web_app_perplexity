-- Category enum
CREATE TYPE product_category AS ENUM ('klíma', 'hőszivattyú', 'okos_otthon');

-- Products tábla
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  brand text NOT NULL,
  category product_category NOT NULL,
  description text,
  price_min integer,
  price_max integer,
  image_url text,
  affiliate_url text,
  published boolean DEFAULT false,
  published_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- News tábla
CREATE TABLE news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  summary text,
  source_url text NOT NULL,
  source_name text NOT NULL,
  image_url text,
  category product_category NOT NULL,
  published_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Tags
CREATE TABLE tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  slug text UNIQUE NOT NULL
);

CREATE TABLE product_tags (
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, tag_id)
);

CREATE TABLE news_tags (
  news_id uuid REFERENCES news(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (news_id, tag_id)
);

-- RLS engedélyezés
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_tags ENABLE ROW LEVEL SECURITY;

-- Products policy-k
CREATE POLICY "Products are publicly readable"
  ON products
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage products"
  ON products
  FOR ALL
  USING (auth.role() = 'authenticated');

-- News policy-k
CREATE POLICY "News are publicly readable"
  ON news
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage news"
  ON news
  FOR ALL
  USING (auth.role() = 'authenticated');

-- Tags policy-k
CREATE POLICY "Tags are publicly readable"
  ON tags
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage tags"
  ON tags
  FOR ALL
  USING (auth.role() = 'authenticated');

-- Product_tags policy-k
CREATE POLICY "Product tags are publicly readable"
  ON product_tags
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage product tags"
  ON product_tags
  FOR ALL
  USING (auth.role() = 'authenticated');

-- News_tags policy-k
CREATE POLICY "News tags are publicly readable"
  ON news_tags
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage news tags"
  ON news_tags
  FOR ALL
  USING (auth.role() = 'authenticated');

-- Indexek
CREATE INDEX idx_products_published_at ON products(published_at);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_news_published_at ON news(published_at);
CREATE INDEX idx_news_category ON news(category);
