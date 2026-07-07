export default function Footer() {
  return (
    <footer style={{ background: '#1B2E4B', color: 'white', marginTop: 60, padding: '40px 20px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 8 }}>
            Linka<span style={{ color: '#4AADE8' }}>Style</span>
          </div>
          <p style={{ fontSize: 13, opacity: 0.7, maxWidth: 280 }}>
            Încălțăminte pentru copii de brand european. Biomecanics, Primigi, Garvalin, D.D.Step.
          </p>
        </div>
        <div style={{ fontSize: 13, opacity: 0.85, lineHeight: 2 }}>
          <div>📍 Chișinău, Moldova</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            <a href="tel:+37361299950" style={{ color: 'white' }}>061 299 950</a>
          </div>
          <div>🚚 Livrare gratuită de la 1000 MDL</div>
          <div>🔄 Garanție 365 zile</div>
          <div style={{ marginTop: 8 }}>
            <a href="https://instagram.com/linkastyle.md" target="_blank" rel="noopener" style={{ color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.5" y2="6.5"/></svg>
              Instagram
            </a>
          </div>
        </div>
      </div>
      <div style={{ textAlign: 'center', fontSize: 12, opacity: 0.5, marginTop: 24 }}>
        © {new Date().getFullYear()} Linka Style. Toate drepturile rezervate.
      </div>
    </footer>
  )
}
