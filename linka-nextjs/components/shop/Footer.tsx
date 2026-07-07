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
          <div>🚚 Livrare gratuită de la 1000 MDL</div>
          <div>🔄 Garanție 365 zile</div>
        </div>
      </div>
      <div style={{ textAlign: 'center', fontSize: 12, opacity: 0.5, marginTop: 24 }}>
        © {new Date().getFullYear()} Linka Style. Toate drepturile rezervate.
      </div>
    </footer>
  )
}
