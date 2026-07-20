import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

// SECURITATE: fara secret real, aplicatia NU trebuie sa porneasca — altfel oricine
// putea semna un token admin valid folosind secretul implicit, cunoscut public in cod.
if (!process.env.ADMIN_JWT_SECRET) {
  throw new Error('ADMIN_JWT_SECRET lipseste din variabilele de mediu. Seteaz-o in Vercel > Settings > Environment Variables inainte de a porni aplicatia.')
}
const secret = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET)

export async function createToken() {
  return await new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secret)
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload
  } catch {
    return null
  }
}

export async function isAuthenticated() {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_token')?.value
  if (!token) return false
  const payload = await verifyToken(token)
  return !!payload
}
