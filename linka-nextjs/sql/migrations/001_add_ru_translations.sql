-- Migrare 001 — aplicata manual, iulie 2026
-- Adauga coloanele de traducere in rusa pentru produse.
-- (schema.sql a fost actualizat sa reflecte asta direct — acest fisier e doar istoricul.)

ALTER TABLE products ADD COLUMN IF NOT EXISTS name_ru TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS description_ru TEXT;
