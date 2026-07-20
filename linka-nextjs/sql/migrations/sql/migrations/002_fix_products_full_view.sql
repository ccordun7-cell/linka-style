-- Migrare 002 — aplicata manual, iulie 2026
-- Recreeaza view-ul products_full: adauga id-ul fiecarei poze in rezultat
-- (necesar pentru reordonare/stergere individuala din admin) si rezolva o
-- eroare de sintaxa Postgres (DISTINCT + ORDER BY intr-un agregat).

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
