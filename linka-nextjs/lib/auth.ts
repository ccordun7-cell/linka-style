import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const secret = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET || 'fallback-secret-schimba')

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
  const cookieStore = cookies()
  const token = cookieStore.get('admin_token')?.value
  if (!token) return false
  const payload = await verifyToken(token)
  return !!payload
}
