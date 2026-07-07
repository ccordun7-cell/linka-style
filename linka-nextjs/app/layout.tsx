import type { Metadata } from 'next'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'Încălțăminte pentru copii de brand european | Linka Style',
  description: 'Linka Style — magazin online de încălțăminte pentru copii. Biomecanics, Primigi, Garvalin, D.D.Step. Livrare gratuită de la 1000 MDL. Probă acasă. Garanție 365 zile.',
  metadataBase: new URL('https://linkastyle.com'),
  openGraph: {
    type: 'website',
    siteName: 'Linka Style',
    locale: 'ro_MD',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro">
      <body>{children}</body>
    </html>
  )
}
