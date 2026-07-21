-- Migrare 006 — aplicata iulie 2026
-- Adauga limitare a numarului de comenzi per adresa IP, ca protectie
-- impotriva spam-ului si abuzului pe /api/comenzi (endpoint public,
-- fara nicio protectie pana acum — gasit in al doilea audit tehnic).
-- Acelasi tipar ca la login_attempts (migrare 005).

CREATE TABLE IF NOT EXISTS order_attempts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ip TEXT NOT NULL,
  attempted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_attempts_ip_time ON order_attempts (ip, attempted_at);

ALTER TABLE order_attempts ENABLE ROW LEVEL SECURITY;
-- Fara nicio politica publica adaugata: doar service_role (folosit server-side
-- in /api/comenzi) poate citi sau scrie in acest tabel.
