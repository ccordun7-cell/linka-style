-- Migrare 014 — aplicata august 2026
-- Bannere/publicitate editabile din admin, pentru caruselul de sus al
-- site-ului (sub headerul principal cu "Calitate Europeana").

CREATE TABLE IF NOT EXISTS banners (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  image_url TEXT NOT NULL,
  cloudinary_id TEXT,
  title TEXT,
  cta_text TEXT,
  cta_link TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_banners_sort_order ON banners (sort_order);

ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
-- Fara nicio politica publica — citirea (doar cele active) si scrierea se
-- fac strict prin /api/bannere (service_role), la fel ca restul sistemului.
