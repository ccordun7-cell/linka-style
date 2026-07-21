/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  {
    key: 'Content-Security-Policy',
    // Next.js foloseste script-uri/stiluri inline pentru hidratare, de aceea
    // 'unsafe-inline'/'unsafe-eval' raman necesare pe script-src fara nonce-uri
    // (imbunatatire viitoare). Restul directivelor sunt restranse strict la
    // domeniile chiar folosite de site (reCAPTCHA, Cloudinary, Supabase).
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com https://www.gstatic.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https://res.cloudinary.com https://images.unsplash.com",
      "font-src 'self' data:",
      "frame-src https://www.google.com",
      "connect-src 'self' https://*.supabase.co https://www.google.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ')
  },
]

const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  experimental: {
    serverActions: { allowedOrigins: ['linkastyle.com', 'localhost:3000'] }
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
}
module.exports = nextConfig
