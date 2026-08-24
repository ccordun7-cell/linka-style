-- =============================================
-- LINKA STYLE — Schema bază de date Supabase
-- Rulează acest SQL în Supabase SQL Editor
-- =============================================

-- Extensii necesare
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABELA: brands
-- =============================================
CREATE TABLE brands (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  country TEXT,
  description TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO brands (slug, name, country, description) VALUES
  ('biomecanics', 'Biomecanics', 'Spania', 'Brand spaniol premium de încălțăminte ortopedică pentru copii.'),
  ('primigi', 'Primigi', 'Italia', 'Brand italian de tradiție pentru încălțăminte copii.'),
  ('garvalin', 'Garvalin', 'Spania', 'Brand spaniol specializat în încălțăminte confortabilă pentru copii.'),
  ('ddstep', 'D.D.Step', 'Lituania', 'Brand lituanian de încălțăminte sport și ortopedică pentru copii.');

-- =============================================
-- TABELA: products
-- =============================================
CREATE TABLE products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  name_ru TEXT,
  brand_id UUID REFERENCES brands(id),
  type TEXT NOT NULL DEFAULT 'pantofi',
  category TEXT NOT NULL CHECK (category IN ('girls', 'boys', 'barefoot', 'school')),
  price INTEGER NOT NULL,
  description TEXT,
  description_ru TEXT,
  is_barefoot BOOLEAN DEFAULT FALSE,
  is_premium BOOLEAN DEFAULT FALSE,
  is_sale BOOLEAN DEFAULT FALSE,
  sale_price INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  zone TEXT DEFAULT 'normal',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABELA: product_images
-- =============================================
CREATE TABLE product_images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  cloudinary_id TEXT,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABELA: product_sizes
-- =============================================
CREATE TABLE product_sizes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  size INTEGER NOT NULL,
  price INTEGER NOT NULL,
  stock_quantity INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, size)
);

-- =============================================
-- TABELA: orders
-- =============================================
CREATE TABLE orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_number SERIAL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  delivery_address TEXT,
  delivery_city TEXT DEFAULT 'Chișinău',
  payment_method TEXT DEFAULT 'ramburs',
  total INTEGER NOT NULL,
  delivery_cost INTEGER DEFAULT 0,
  promo_code TEXT,
  discount_amount NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'noua' CHECK (status IN ('noua', 'confirmata', 'in_livrare', 'livrata', 'anulata')),
  notes TEXT,
  data_consent BOOLEAN NOT NULL DEFAULT FALSE,
  telegram_sent BOOLEAN DEFAULT FALSE,
  email_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABELA: order_items
-- =============================================
CREATE TABLE order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  product_name TEXT NOT NULL,
  product_brand TEXT NOT NULL,
  size INTEGER NOT NULL,
  price INTEGER NOT NULL,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABELA: promo_codes
-- =============================================
CREATE TABLE promo_codes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percent', 'fixed')),
  discount_value NUMERIC NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Fara policy publica, intentionat: codurile promo se citesc/scriu DOAR prin
-- API-ul Next.js (service_role, ocoleste RLS) — niciodata direct din browser.
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

-- Limitare incercari de login admin (rate limiting), adaugata migrarea 005
CREATE TABLE IF NOT EXISTS login_attempts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ip TEXT NOT NULL,
  attempted_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip_time ON login_attempts (ip, attempted_at);
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;

-- =============================================
-- VIEWS utile
-- =============================================
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

-- View pentru dashboard admin
CREATE VIEW orders_with_items AS
SELECT
  o.*,
  COUNT(oi.id) as items_count,
  json_agg(
    jsonb_build_object(
      'name', oi.product_name,
      'brand', oi.product_brand,
      'size', oi.size,
      'price', oi.price,
      'quantity', oi.quantity
    )
  ) as items
FROM orders o
LEFT JOIN order_items oi ON oi.order_id = o.id
GROUP BY o.id;

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

-- Citire publică pentru produse și branduri
CREATE POLICY "Produse vizibile public" ON products FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Imagini vizibile public" ON product_images FOR SELECT USING (TRUE);
CREATE POLICY "Marimi vizibile public" ON product_sizes FOR SELECT USING (TRUE);
CREATE POLICY "Branduri vizibile public" ON brands FOR SELECT USING (TRUE);

-- Comenzile: oricine poate insera, admin poate citi tot
-- SECURITATE: am eliminat inserarea publica directa pe orders/order_items.
-- Comenzile trec ACUM exclusiv prin /api/comenzi (foloseste service_role, ocoleste RLS),
-- care recalculeaza preturile din baza de date si nu are incredere in ce trimite clientul.
-- Inainte, oricine putea insera direct in Supabase cu cheia publica, cu orice pret dorea.

-- Admin prin service role poate face orice (bypass RLS)
-- Service role key are acces complet automat

-- =============================================
-- FUNCȚII UTILE
-- =============================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Funcție pentru statistici dashboard
CREATE OR REPLACE FUNCTION get_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_orders', (SELECT COUNT(*) FROM orders),
    'orders_today', (SELECT COUNT(*) FROM orders WHERE DATE(created_at) = CURRENT_DATE),
    'revenue_total', (SELECT COALESCE(SUM(total), 0) FROM orders WHERE status != 'anulata'),
    'revenue_today', (SELECT COALESCE(SUM(total), 0) FROM orders WHERE DATE(created_at) = CURRENT_DATE AND status != 'anulata'),
    'total_products', (SELECT COUNT(*) FROM products WHERE is_active = TRUE),
    'new_orders', (SELECT COUNT(*) FROM orders WHERE status = 'noua')
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
