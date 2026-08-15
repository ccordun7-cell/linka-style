-- Migrare 011 — aplicata august 2026
-- Adauga recenzii de la clienti (stele + text) per produs, la cererea clientei.
-- Recenziile intra "in asteptare" (is_approved=false) pana sunt aprobate din
-- admin — protectie impotriva spam-ului/abuzului, nu apar automat pe site.

CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews (product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews (created_at DESC);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
-- Fara nicio politica publica: citirea recenziilor aprobate si scrierea de
-- recenzii noi se fac strict prin /api/recenzii (service_role), nu direct.

-- Acelasi tipar de rate limiting ca la retur/newsletter — un IP nu poate
-- trimite recenzii la nesfarsit.
CREATE TABLE IF NOT EXISTS review_attempts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ip TEXT NOT NULL,
  attempted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_review_attempts_ip_time ON review_attempts (ip, attempted_at);

ALTER TABLE review_attempts ENABLE ROW LEVEL SECURITY;
