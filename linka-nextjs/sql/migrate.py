#!/usr/bin/env python3
"""
Script de migrare date din HTML Linka Style → Supabase + Cloudinary
Rulează: python3 migrate.py
"""
import re, json, base64, os, sys
import urllib.request, urllib.parse

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL', 'https://XXXX.supabase.co')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY', 'XXXX')
CLOUDINARY_CLOUD = os.getenv('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME', 'XXXX')
CLOUDINARY_KEY = os.getenv('CLOUDINARY_API_KEY', 'XXXX')
CLOUDINARY_SECRET = os.getenv('CLOUDINARY_API_SECRET', 'XXXX')

HTML_FILE = '../linka_complet.html'  # calea spre fișierul HTML actual

def supabase_request(method, path, data=None):
    url = f"{SUPABASE_URL}/rest/v1/{path}"
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
    }
    body = json.dumps(data).encode() if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as r:
            return json.loads(r.read().decode())
    except Exception as e:
        print(f"Eroare Supabase {method} {path}: {e}")
        return None

def upload_to_cloudinary(b64_data, product_name, index):
    """Upload imagine pe Cloudinary"""
    import urllib.request, base64 as b64
    
    # Cloudinary upload API
    url = f"https://api.cloudinary.com/v1_1/{CLOUDINARY_CLOUD}/image/upload"
    
    # Autentificare
    import hmac, hashlib, time
    timestamp = int(time.time())
    folder = "linka-style/produse"
    params_to_sign = f"folder={folder}&timestamp={timestamp}"
    sig = hmac.new(CLOUDINARY_SECRET.encode(), params_to_sign.encode(), hashlib.sha1).hexdigest()
    
    data = urllib.parse.urlencode({
        'file': f'data:image/jpeg;base64,{b64_data}',
        'api_key': CLOUDINARY_KEY,
        'timestamp': timestamp,
        'folder': folder,
        'signature': sig,
        'transformation': 'w_800,h_800,c_fill,f_webp,q_auto:good'
    }).encode()
    
    req = urllib.request.Request(url, data=data)
    try:
        with urllib.request.urlopen(req) as r:
            result = json.loads(r.read().decode())
            return result.get('secure_url'), result.get('public_id')
    except Exception as e:
        print(f"  ⚠️ Cloudinary eroare: {e}")
        return None, None

def main():
    print("=== MIGRARE DATE LINKA STYLE → SUPABASE + CLOUDINARY ===\n")

    # Citesc HTML
    with open(HTML_FILE, 'r', encoding='latin-1') as f:
        html = f.read()
    print(f"✅ HTML citit: {len(html)/1024/1024:.1f} MB")

    # Extrag products array
    idx_start = html.find('var products=[')
    idx_end = html.find('\n];\n\nfunction isFirst', idx_start)
    products_js = html[idx_start + len('var products='):idx_end+1]

    def js_to_json(s):
        s = re.sub(r'([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)(\s*:)', r'\1"\2"\3', s)
        s = re.sub(r'\{(\d+:\d+[^}]*)\}', lambda m: '{' + re.sub(r'(\d+):', r'"\1":', m.group(1)) + '}', s)
        s = s.replace('undefined', 'null').replace('true', 'true').replace('false', 'false')
        return s

    products = json.loads(js_to_json(products_js))
    print(f"✅ Produse extrase: {len(products)}")

    # Extrag imageCache
    idx_cache = html.find('imageCache[')
    img_store_match = re.findall(r'id="(img_p\d+_\d+)"[^>]*src="data:image/jpeg;base64,([A-Za-z0-9+/=]+)"', html)
    image_cache = {f'#{item[0]}': item[1] for item in img_store_match}
    print(f"✅ Imagini extrase: {len(image_cache)}")

    # Fetch branduri din Supabase
    brands_data = supabase_request('GET', 'brands?select=id,slug,name')
    brands_map = {b['slug']: b['id'] for b in (brands_data or [])}
    brand_name_to_slug = {
        'BIOMECANICS': 'biomecanics',
        'PRIMIGI': 'primigi',
        'GARVALIN': 'garvalin',
        'D.D.STEP': 'ddstep',
    }
    print(f"✅ Branduri din Supabase: {list(brands_map.keys())}")

    # Migrez fiecare produs
    migrated = 0
    errors = 0

    for p in products:
        try:
            brand_slug = brand_name_to_slug.get(p.get('brand', ''), 'biomecanics')
            brand_id = brands_map.get(brand_slug)

            # Generez slug
            name = p.get('name', '')
            slug = re.sub(r'[ăâ]', 'a', name.lower())
            slug = re.sub(r'[îí]', 'i', slug)
            slug = re.sub(r'[șş]', 's', slug)
            slug = re.sub(r'[țţ]', 't', slug)
            slug = re.sub(r'\s+', '-', slug)
            slug = re.sub(r'[^a-z0-9-]', '', slug)
            slug = f"{slug}-{p['id']}"

            # Inserez produsul
            product_data = {
                'slug': slug,
                'name': name,
                'brand_id': brand_id,
                'type': p.get('type', 'pantofi'),
                'category': p.get('category', 'girls'),
                'price': p.get('price', 0),
                'description': p.get('desc', ''),
                'is_barefoot': p.get('barefoot', False),
                'is_active': True,
                'zone': p.get('zone', 'normal'),
            }

            result = supabase_request('POST', 'products', product_data)
            if not result:
                errors += 1
                continue

            product_id = result[0]['id'] if isinstance(result, list) else result['id']

            # Upload imagini
            images_refs = p.get('images', [p.get('img', '')])
            for i, img_ref in enumerate(images_refs[:3]):
                b64_data = image_cache.get(img_ref)
                if not b64_data:
                    continue
                
                img_url, cloudinary_id = upload_to_cloudinary(b64_data, name, i)
                if img_url:
                    supabase_request('POST', 'product_images', {
                        'product_id': product_id,
                        'url': img_url,
                        'cloudinary_id': cloudinary_id,
                        'position': i
                    })

            # Mărimi
            size_prices = p.get('sizePrices', {})
            sizes = p.get('sizes', [])
            for size in sizes:
                price = size_prices.get(str(size), size_prices.get(size, p.get('price', 0)))
                supabase_request('POST', 'product_sizes', {
                    'product_id': product_id,
                    'size': size,
                    'price': price,
                    'stock_quantity': 10
                })

            migrated += 1
            print(f"  ✅ {name[:40]}... (ID: {p['id']})")

        except Exception as e:
            errors += 1
            print(f"  ❌ Eroare la {p.get('name', '?')}: {e}")

    print(f"\n=== REZULTAT ===")
    print(f"✅ Migrate cu succes: {migrated}")
    print(f"❌ Erori: {errors}")
    print(f"\nDeschide Supabase Dashboard pentru a verifica datele.")

if __name__ == '__main__':
    main()
