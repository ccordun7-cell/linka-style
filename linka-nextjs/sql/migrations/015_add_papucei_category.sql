-- Migrare 015 — aplicata august 2026
-- Adauga "papucei" ca valoare valida pentru category, categorie principala
-- de sine statatoare (unisex, fara gen), similar structural cu "barefoot"
-- si "school", dar folosita direct ca filtru (nu ca steag combinat cu genul).

ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_check;
ALTER TABLE products ADD CONSTRAINT products_category_check
  CHECK (category IN ('girls', 'boys', 'barefoot', 'school', 'papucei'));
