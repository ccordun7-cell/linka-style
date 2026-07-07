import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { isAuthenticated } from '@/lib/auth'
import { deleteImage, uploadImage } from '@/lib/cloudinary'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!await isAuthenticated()) return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })

  const body = await req.json()
  const { name, price, description, category, is_barefoot, is_active, sizes, new_images } = body

  // Update produs
  const { data: updateData, error: updateError } = await supabaseAdmin.from('products').update({
    name, price, description, category, is_barefoot, is_active
  }).eq('id', params.id).select()

  if (updateError) {
    return NextResponse.json({ error: 'Eroare la actualizarea produsului: ' + updateError.message }, { status: 500 })
  }
  if (!updateData || updateData.length === 0) {
    return NextResponse.json({
      error: 'Produsul nu a fost modificat (0 randuri afectate). Cel mai probabil SUPABASE_SERVICE_ROLE_KEY din Vercel nu este cheia corecta (service_role) — verifica in Supabase: Settings > API > service_role secret, si compar-o cu variabila din Vercel > Settings > Environment Variables.'
    }, { status: 500 })
  }

  // Update mărimi
  if (sizes) {
    const { error: deleteSizesError } = await supabaseAdmin.from('product_sizes').delete().eq('product_id', params.id)
    if (deleteSizesError) {
      return NextResponse.json({ error: 'Eroare la stergerea marimilor vechi: ' + deleteSizesError.message }, { status: 500 })
    }
    if (sizes.length) {
      const { error: insertSizesError } = await supabaseAdmin.from('product_sizes').insert(
        sizes.map((s: any) => ({ product_id: params.id, size: s.size, price: s.price, stock_quantity: s.stock }))
      )
      if (insertSizesError) {
        return NextResponse.json({ error: 'Eroare la salvarea marimilor noi: ' + insertSizesError.message }, { status: 500 })
      }
    }
  }

  // Upload imagini noi
  if (new_images?.length) {
    // Șterg pozele vechi de pe Cloudinary
    const { data: oldImages } = await supabaseAdmin.from('product_images').select('cloudinary_id').eq('product_id', params.id)
    for (const img of oldImages || []) {
      if (img.cloudinary_id) await deleteImage(img.cloudinary_id)
    }
    const { error: deleteImagesError } = await supabaseAdmin.from('product_images').delete().eq('product_id', params.id)
    if (deleteImagesError) {
      return NextResponse.json({ error: 'Eroare la stergerea pozelor vechi: ' + deleteImagesError.message }, { status: 500 })
    }

    for (let i = 0; i < new_images.length; i++) {
      const { url, cloudinary_id } = await uploadImage(new_images[i])
      const { error: insertImageError } = await supabaseAdmin.from('product_images').insert({ product_id: params.id, url, cloudinary_id, position: i })
      if (insertImageError) {
        return NextResponse.json({ error: 'Eroare la salvarea pozei noi: ' + insertImageError.message }, { status: 500 })
      }
    }
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!await isAuthenticated()) return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })

  // Soft delete
  const { data, error } = await supabaseAdmin.from('products').update({ is_active: false }).eq('id', params.id).select()
  if (error) {
    return NextResponse.json({ error: 'Eroare la ascunderea produsului: ' + error.message }, { status: 500 })
  }
  if (!data || data.length === 0) {
    return NextResponse.json({
      error: 'Produsul nu a fost modificat (0 randuri afectate). Cel mai probabil SUPABASE_SERVICE_ROLE_KEY din Vercel nu este cheia corecta (service_role) — verifica in Supabase: Settings > API > service_role secret, si compar-o cu variabila din Vercel > Settings > Environment Variables.'
    }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}
