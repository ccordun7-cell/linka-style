import { supabaseAdmin } from '@/lib/supabase'

interface PromoValidationResult {
  valid: boolean
  code?: string
  discount_amount?: number
  error?: string
}

// Revalidează codul promo direct din baza de date — niciodată nu se are
// încredere în reducerea trimisă de client. Reguli: activ, neexpirat,
// sub limita de utilizare, iar reducerea nu poate depăși subtotalul.
export async function validatePromoCode(code: string, subtotal: number): Promise<PromoValidationResult> {
  if (!code || typeof code !== 'string') {
    return { valid: false, error: 'Cod promo invalid' }
  }

  const normalizedCode = code.trim().toUpperCase()

  const { data: promo, error } = await supabaseAdmin
    .from('promo_codes')
    .select('code, discount_type, discount_value, is_active, usage_limit, used_count, expires_at')
    .eq('code', normalizedCode)
    .single()

  if (error || !promo) {
    return { valid: false, error: 'Codul promo nu există' }
  }

  if (!promo.is_active) {
    return { valid: false, error: 'Codul promo nu mai este activ' }
  }

  if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
    return { valid: false, error: 'Codul promo a expirat' }
  }

  if (promo.usage_limit !== null && promo.used_count >= promo.usage_limit) {
    return { valid: false, error: 'Codul promo a atins limita de utilizări' }
  }

  let discount_amount = 0
  if (promo.discount_type === 'percent') {
    discount_amount = (subtotal * promo.discount_value) / 100
  } else {
    discount_amount = promo.discount_value
  }

  // Reducerea nu poate depăși subtotalul comenzii
  discount_amount = Math.min(discount_amount, subtotal)
  discount_amount = Math.round(discount_amount * 100) / 100

  return { valid: true, code: promo.code, discount_amount }
}

// Incrementează contorul de utilizări după ce comanda a fost înregistrată cu succes.
export async function incrementPromoUsage(code: string): Promise<void> {
  const { data: promo } = await supabaseAdmin
    .from('promo_codes')
    .select('used_count')
    .eq('code', code)
    .single()

  if (!promo) return

  await supabaseAdmin
    .from('promo_codes')
    .update({ used_count: (promo.used_count || 0) + 1 })
    .eq('code', code)
}
