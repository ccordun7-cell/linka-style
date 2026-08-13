-- Migrare 010 — aplicata august 2026
-- Adauga coloana pentru codul de produs (cel de pe actele/facturile de la
-- furnizor), la cererea clientei — vrea sa-l poata introduce manual in admin
-- si sa apara pe site, in sectiunea "Informatii suplimentare".

ALTER TABLE products ADD COLUMN IF NOT EXISTS product_code TEXT;
