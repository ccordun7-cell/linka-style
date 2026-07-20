-- Migrare 005 — aplicata iulie 2026
-- Adauga limitare a incercarilor de login admin, ca protectie impotriva
-- ghicirii parolei prin incercari repetate (brute-force). Inlocuieste
-- incercarea esuata de a folosi Cloudflare Turnstile (widget-uri noi
-- returnau constant eroare 400020, problema de partea Cloudflare, nu a
-- configurarii noastre — vezi commit-urile anterioare pentru context).

CREATE TABLE IF NOT EXISTS login_attempts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ip TEXT NOT NULL,
  attempted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_login_attempts_ip_time ON login_attempts (ip, attempted_at);

ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;
-- Fara nicio politica publica adaugata: doar service_role (folosit server-side
-- in /api/auth) poate citi sau scrie in acest tabel.
