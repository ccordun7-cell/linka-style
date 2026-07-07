import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { uploadImage } from '@/lib/cloudinary'

export async function POST(req: NextRequest) {
  if (!await isAuthenticated()) return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })

  const { image, folder } = await req.json()
  const result = await uploadImage(image, folder || 'linka-style/produse')
  return NextResponse.json(result)
}
