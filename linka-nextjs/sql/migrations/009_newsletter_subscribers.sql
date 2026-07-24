-- Migrare 009 — aplicata iulie 2026
-- Adauga tabela pentru abonarile la newsletter (footer + popup), care nu
-- salvau nicaieri email-ul pana acum — butoanele nu aveau logica in spate.

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  source TEXT DEFAULT 'footer',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_created_at ON newsletter_subscribers (created_at DESC);

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
-- Fara nicio politica publica: doar service_role (folosit server-side in
-- /api/newsletter) poate citi sau scrie in acest tabel.

CREATE TABLE IF NOT EXISTS newsletter_attempts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ip TEXT NOT NULL,
  attempted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_newsletter_attempts_ip_time ON newsletter_attempts (ip, attempted_at);

ALTER TABLE newsletter_attempts ENABLE ROW LEVEL SECURITY;
