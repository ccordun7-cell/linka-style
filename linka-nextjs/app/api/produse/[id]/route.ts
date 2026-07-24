import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { isAuthenticated } from '@/lib/auth'
import { deleteImage, uploadImage } from '@/lib/cloudinary'
import { findOrCreateBrand } from '@/lib/brands'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAuthenticated()) return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const { name, name_ru, brand_name, price, description, description_ru, category, is_barefoot, is_active, sizes, new_images, image_order, deleted_image_ids } = body

  const updatePayload: Record<string, unknown> = {
    name, name_ru, price, description, description_ru, category, is_barefoot, is_active
  }

  // Daca s-a trimis un nume de brand, il caut/creez si actualizez legatura produsului
  if (brand_name && brand_name.trim()) {
    try {
      updatePayload.brand_id = await findOrCreateBrand(brand_name)
    } catch (e: any) {
      return NextResponse.json({ error: 'Eroare la brand: ' + e.message }, { status: 500 })
    }
  }

  // Update produs
  const { data: updateData, error: updateError } = await supabaseAdmin.from('products').update(updatePayload).eq('id', id).select()

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
    const { error: deleteSizesError } = await supabaseAdmin.from('product_sizes').delete().eq('product_id', id)
    if (deleteSizesError) {
      return NextResponse.json({ error: 'Eroare la stergerea marimilor vechi: ' + deleteSizesError.message }, { status: 500 })
    }
    if (sizes.length) {
      const { error: insertSizesError } = await supabaseAdmin.from('product_sizes').insert(
        sizes.map((s: any) => ({ product_id: id, size: s.size, price: s.price, stock_quantity: s.stock }))
      )
      if (insertSizesError) {
        return NextResponse.json({ error: 'Eroare la salvarea marimilor noi: ' + insertSizesError.message }, { status: 500 })
      }
    }
  }

  // Sterg pozele marcate individual pentru stergere (de pe Cloudinary + din baza de date)
  if (deleted_image_ids?.length) {
    const { data: toDelete } = await supabaseAdmin.from('product_images').select('id, cloudinary_id').in('id', deleted_image_ids)
    for (const img of toDelete || []) {
      if (img.cloudinary_id) await deleteImage(img.cloudinary_id)
    }
    const { error: deleteImagesError } = await supabaseAdmin.from('product_images').delete().in('id', deleted_image_ids)
    if (deleteImagesError) {
      return NextResponse.json({ error: 'Eroare la stergerea pozelor selectate: ' + deleteImagesError.message }, { status: 500 })
    }
  }

  // Actualizez ordinea pozelor existente (prima din lista = poza de fata a produsului)
  let nextPosition = 0
  if (image_order?.length) {
    for (let i = 0; i < image_order.length; i++) {
      const { error: reorderError } = await supabaseAdmin.from('product_images').update({ position: i }).eq('id', image_order[i])
      if (reorderError) {
        return NextResponse.json({ error: 'Eroare la reordonarea pozelor: ' + reorderError.message }, { status: 500 })
      }
    }
    nextPosition = image_order.length
  }

  // Adaug pozele noi la final (nu mai sterg pozele existente)
  if (new_images?.length) {
    for (let i = 0; i < new_images.length; i++) {
      const { url, cloudinary_id } = await uploadImage(new_images[i])
      const { error: insertImageError } = await supabaseAdmin.from('product_images').insert({ product_id: id, url, cloudinary_id, position: nextPosition + i })
      if (insertImageError) {
        return NextResponse.json({ error: 'Eroare la salvarea pozei noi: ' + insertImageError.message }, { status: 500 })
      }
    }
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAuthenticated()) return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })

  const { id } = await params

  // Soft delete
  const { data, error } = await supabaseAdmin.from('products').update({ is_active: false }).eq('id', id).select()
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
