import { supabaseAdmin } from '@/lib/supabase'

// Genereaza un slug simplu dintr-un text (nume brand, nume produs etc)
export function slugify(text: string) {
  return text.toLowerCase()
    .replace(/[ăâ]/g, 'a').replace(/[îí]/g, 'i')
    .replace(/[șş]/g, 's').replace(/[țţ]/g, 't')
    .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

// Gaseste brandul dupa nume (case-insensitive) sau il creeaza daca nu exista.
// Folosit atat la crearea unui produs nou, cat si la schimbarea brandului
// unui produs existent (vezi app/api/produse/[id]/route.ts).
export async function findOrCreateBrand(brandName: string): Promise<string> {
  const cleanName = brandName.trim()
  const slug = slugify(cleanName)

  const { data: existing } = await supabaseAdmin
    .from('brands')
    .select('id')
    .ilike('name', cleanName)
    .maybeSingle()

  if (existing) return existing.id

  const { data: created, error } = await supabaseAdmin
    .from('brands')
    .insert({ slug, name: cleanName })
    .select('id')
    .single()

  if (error) throw new Error(error.message)
  return created.id
}
