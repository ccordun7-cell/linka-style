import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function uploadImage(base64: string, folder: string = 'linka-style/produse') {
  const result = await cloudinary.uploader.upload(base64, {
    folder,
    transformation: [
      { width: 800, height: 800, crop: 'fill', gravity: 'center' },
      { format: 'webp', quality: 'auto:good' }
    ]
  })
  return { url: result.secure_url, cloudinary_id: result.public_id }
}

// Bannerele au nevoie de format lat (nu patrat ca la produse) — decupaj
// panoramic, potrivit pentru caruselul de sus de pe site.
export async function uploadBannerImage(base64: string) {
  const result = await cloudinary.uploader.upload(base64, {
    folder: 'linka-style/bannere',
    transformation: [
      { width: 1600, height: 600, crop: 'fill', gravity: 'auto' },
      { format: 'webp', quality: 'auto:good' }
    ]
  })
  return { url: result.secure_url, cloudinary_id: result.public_id }
}

export async function deleteImage(cloudinary_id: string) {
  await cloudinary.uploader.destroy(cloudinary_id)
}

export default cloudinary
