import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { isAuthenticated } from '@/lib/auth'
import { deleteImage, uploadImage } from '@/lib/cloudinary'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!await isAuthenticated()) return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })

  const body = await req.json()
  const { name, price, description, category, is_barefoot, is_active, sizes, new_images } = body

  // Update produs
  await supabaseAdmin.from('products').update({
    name, price, description, category, is_barefoot, is_active
  }).eq('id', params.id)

  // Update mărimi
  if (sizes) {
    await supabaseAdmin.from('product_sizes').delete().eq('product_id', params.id)
    await supabaseAdmin.from('product_sizes').insert(
      sizes.map((s: any) => ({ product_id: params.id, size: s.size, price: s.price, stock_quantity: s.stock }))
    )
  }

  // Upload imagini noi
  if (new_images?.length) {
    // Șterg pozele vechi de pe Cloudinary
    const { data: oldImages } = await supabaseAdmin.from('product_images').select('cloudinary_id').eq('product_id', params.id)
    for (const img of oldImages || []) {
      if (img.cloudinary_id) await deleteImage(img.cloudinary_id)
    }
    await supabaseAdmin.from('product_images').delete().eq('product_id', params.id)

    for (let i = 0; i < new_images.length; i++) {
      const { url, cloudinary_id } = await uploadImage(new_images[i])
      await supabaseAdmin.from('product_images').insert({ product_id: params.id, url, cloudinary_id, position: i })
    }
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!await isAuthenticated()) return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })

  // Soft delete
  await supabaseAdmin.from('products').update({ is_active: false }).eq('id', params.id)
  return NextResponse.json({ success: true })
}
