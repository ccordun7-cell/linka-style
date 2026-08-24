-- Migrare 015 — aplicata august 2026
-- Adauga un jurnal de consimtamant pentru prelucrarea datelor cu caracter
-- personal la fiecare comanda (Legea nr. 195/2024). Bifa e obligatorie la
-- checkout pe site (linkastyle-html), iar aceasta coloana e dovada, cu data
-- exacta din created_at, ca acel consimtamant a fost dat.

ALTER TABLE orders ADD COLUMN IF NOT EXISTS data_consent BOOLEAN NOT NULL DEFAULT FALSE;
