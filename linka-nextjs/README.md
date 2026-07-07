# Linka Style — Site e-commerce profesional

## Structura proiectului

```
linka-nextjs/
├── app/                    # Paginile site-ului (Next.js App Router)
│   ├── admin/              # Panou administrare (protejat cu parola)
│   │   ├── login/          # Pagina de login admin
│   │   ├── produse/        # Gestionare produse
│   │   ├── comenzi/        # Gestionare comenzi
│   │   └── setari/         # Setari generale
│   ├── api/                # API endpoints
│   │   ├── produse/        # CRUD produse
│   │   ├── comenzi/        # Creare/gestionare comenzi
│   │   ├── auth/           # Autentificare admin
│   │   └── upload/         # Upload imagini
│   └── layout.tsx          # Layout global
├── components/             # Componente reutilizabile
│   ├── admin/              # Componente panou admin
│   └── shop/               # Componente magazin
├── lib/                    # Functii utilitare
│   ├── supabase.ts         # Client baza de date
│   ├── cloudinary.ts       # Upload imagini
│   ├── email.ts            # Trimitere emailuri
│   └── auth.ts             # Autentificare JWT
├── sql/                    # SQL pentru Supabase
│   ├── schema.sql          # Schema completa baza de date
│   └── migrate.py          # Script migrare date din HTML vechi
├── types/                  # TypeScript types
├── .env.local.template     # Template variabile de mediu
└── README.md               # Acest fisier
```

## Pasi de configurare (15 minute)

### Pasul 1: Creare conturi (gratuit)
1. **GitHub**: https://github.com → Sign up
2. **Supabase**: https://supabase.com → Sign up with GitHub
3. **Cloudinary**: https://cloudinary.com → Sign up
4. **Vercel**: https://vercel.com → Sign up with GitHub

### Pasul 2: Configurare Supabase
1. Mergi pe https://supabase.com/dashboard
2. Click "New project" → nume: `linka-style`
3. Alege parola pentru baza de date (salveaz-o!)
4. Asteapta 2 minute pana se creeaza
5. Mergi in Project Settings → API
6. Copiaza: `Project URL` si `anon public key` si `service_role key`
7. Mergi in SQL Editor → copiaza si ruleaza continutul din `sql/schema.sql`

### Pasul 3: Configurare Cloudinary
1. Mergi pe https://cloudinary.com/console
2. Copiaza: `Cloud Name`, `API Key`, `API Secret`

### Pasul 4: Configureaza .env.local
1. Copiaza `.env.local.template` → `.env.local`
2. Inlocuieste toate valorile XXXX cu cele reale din pasii 2-3

### Pasul 5: Migrare date din site-ul actual
```bash
# Seteaza variabilele de mediu
export NEXT_PUBLIC_SUPABASE_URL=https://XXXX.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=eyXXXX
export NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=XXXX
export CLOUDINARY_API_KEY=XXXX
export CLOUDINARY_API_SECRET=XXXX

# Ruleaza migrarea (pune linka_complet.html in acelasi folder)
cd sql && python3 migrate.py
```

### Pasul 6: Deploy pe Vercel
1. Urc codul pe GitHub (New repo → upload files)
2. Mergi pe https://vercel.com → "Import Project" → selecteaza repo-ul
3. Adauga variabilele din .env.local in Vercel → Environment Variables
4. Click Deploy!

### Pasul 7: Schimba domeniul
1. In Vercel → Project → Settings → Domains
2. Adauga: `linkastyle.com` si `www.linkastyle.com`
3. In panoul Porkbun/Namecheap unde ai domeniul:
   - Sterge A records existente
   - Adauga A record: `@` → `76.76.21.21`
   - Adauga CNAME: `www` → `cname.vercel-dns.com`

## Accesul la panoul admin
URL: https://linkastyle.com/admin
Parola: cea setata in ADMIN_PASSWORD din .env.local

## Suport
Pentru orice problema, contacteaza WebHub.md
