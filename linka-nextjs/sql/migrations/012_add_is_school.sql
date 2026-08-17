-- Migrare 012 — aplicata august 2026
-- Adauga un steag separat pentru "produs de scoala", care se poate combina
-- cu genul real (fete/baieti) — la fel ca is_barefoot. Rezolva problema:
-- un produs cu categoria "Scoala" nu aparea niciodata cand cineva rasfoia
-- Fete -> Pantofi, pentru ca "categoria" unui produs poate fi doar una
-- singura (ori Fete, ori Scoala, nu amandoua).

ALTER TABLE products ADD COLUMN IF NOT EXISTS is_school BOOLEAN NOT NULL DEFAULT false;
