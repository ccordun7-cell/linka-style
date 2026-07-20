-- Migrare 004 — aplicata iulie 2026, in urma unui audit extern de securitate
-- PROBLEMA: politicile de mai jos permiteau oricui sa insereze direct in
-- orders/order_items cu cheia publica (anon), ocolind complet API-ul si
-- validarea de pret facuta acolo. Cineva putea comanda orice produs la orice
-- pret dorea, trimitand cererea direct catre Supabase, nu catre site.
--
-- FIX: eliminam accesul public de scriere. De acum, comenzile se pot crea
-- DOAR prin /api/comenzi (Next.js), care foloseste service_role (ocoleste
-- RLS) si recalculeaza fiecare pret din product_sizes inainte de a salva.

DROP POLICY IF EXISTS "Oricine poate comanda" ON orders;
DROP POLICY IF EXISTS "Oricine poate adauga produse in comanda" ON order_items;
