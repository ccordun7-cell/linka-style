export default function Hero() {
  return (
    <section style={{
      background: 'linear-gradient(135deg, #4AADE8 0%, #1B2E4B 100%)',
      color: 'white', padding: '56px 20px', textAlign: 'center'
    }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <h1 style={{ fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 900, marginBottom: 12 }}>
          Încălțăminte de brand european pentru copii
        </h1>
        <p style={{ fontSize: 16, opacity: 0.9, marginBottom: 24 }}>
          Biomecanics, Primigi, Garvalin, D.D.Step — calitate ortopedică, confort garantat
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', fontSize: 13, fontWeight: 700 }}>
          <span style={{ background: 'rgba(255,255,255,.15)', padding: '8px 16px', borderRadius: 20 }}>
            🚚 Livrare gratuită de la 1000 MDL
          </span>
          <span style={{ background: 'rgba(255,255,255,.15)', padding: '8px 16px', borderRadius: 20 }}>
            🔄 Garanție 365 zile
          </span>
          <span style={{ background: 'rgba(255,255,255,.15)', padding: '8px 16px', borderRadius: 20 }}>
            💵 Plată ramburs la livrare
          </span>
        </div>
      </div>
    </section>
  )
}
