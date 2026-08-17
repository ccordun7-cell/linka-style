-- Migrare 013 — aplicata august 2026
-- Recreeaza view-ul products_full identic ca structura (migratia 002), dar la
-- momentul actual — Postgres "inghetase" lista de coloane a view-ului la
-- p.* de cand a fost creat prima data (iulie 2026), inainte sa existe
-- coloanele product_code, is_premium, is_school, type (adaugate ulterior
-- prin migratiile 010/011/012 si direct pe tabel). De-asta site-ul nu
-- "vedea" niciodata is_school, desi coloana exista si se salva corect in
-- tabelul products — view-ul pur si simplu nu o expunea deloc.

DROP VIEW IF EXISTS products_full;

CREATE VIEW products_full AS
SELECT
  p.*,
  b.name as brand_name,
  b.slug as brand_slug,
  b.country as brand_country,
  COALESCE(img.images, '[]') as images,
  COALESCE(sz.sizes, '[]') as sizes
FROM products p
LEFT JOIN brands b ON p.brand_id = b.id
LEFT JOIN LATERAL (
  SELECT json_agg(jsonb_build_object('id', pi.id, 'url', pi.url, 'position', pi.position) ORDER BY pi.position) as images
  FROM product_images pi WHERE pi.product_id = p.id
) img ON true
LEFT JOIN LATERAL (
  SELECT json_agg(jsonb_build_object('size', ps.size, 'price', ps.price, 'stock', ps.stock_quantity) ORDER BY ps.size) as sizes
  FROM product_sizes ps WHERE ps.product_id = p.id
) sz ON true
WHERE p.is_active = TRUE;
