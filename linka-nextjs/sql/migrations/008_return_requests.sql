-- Migrare 008 — aplicata iulie 2026
-- Adauga tabela pentru cereri de retur trimise de clienti prin formularul
-- interactiv de pe site (legal/retur.html), la cererea clientei.

CREATE TABLE IF NOT EXISTS return_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_number TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  reason TEXT NOT NULL,
  refund_method TEXT,
  bank_details TEXT,
  status TEXT NOT NULL DEFAULT 'noua' CHECK (status IN ('noua', 'in_procesare', 'finalizata', 'respinsa')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_return_requests_created_at ON return_requests (created_at DESC);

ALTER TABLE return_requests ENABLE ROW LEVEL SECURITY;
-- Fara nicio politica publica: doar service_role (folosit server-side in
-- /api/retur) poate citi sau scrie in acest tabel — la fel ca la orders.

-- Reutilizam acelasi tabel de rate limiting ca la comenzi/login, cu propriul
-- sau contor, ca sa nu poata fi folosit formularul de retur pentru spam.
CREATE TABLE IF NOT EXISTS return_attempts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ip TEXT NOT NULL,
  attempted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_return_attempts_ip_time ON return_attempts (ip, attempted_at);

ALTER TABLE return_attempts ENABLE ROW LEVEL SECURITY;
