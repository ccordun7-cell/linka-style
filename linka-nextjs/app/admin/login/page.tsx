'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Script from 'next/script'

declare global {
  interface Window {
    onRecaptchaSuccess?: (token: string) => void
    onRecaptchaExpired?: () => void
    grecaptcha?: { reset: () => void }
  }
}

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [recaptchaToken, setRecaptchaToken] = useState('')
  const router = useRouter()

  useEffect(() => {
    window.onRecaptchaSuccess = (token: string) => setRecaptchaToken(token)
    window.onRecaptchaExpired = () => setRecaptchaToken('')
    return () => {
      window.onRecaptchaSuccess = undefined
      window.onRecaptchaExpired = undefined
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!recaptchaToken) {
      setError('Te rugam sa bifezi "Nu sunt un robot" mai jos.')
      return
    }
    setLoading(true)
    setError('')
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, recaptchaToken })
    })
    if (res.ok) { router.push('/admin') }
    else {
      const data = await res.json().catch(() => ({}))
      setError(data.error || 'Parola incorecta. Incearca din nou.')
      setRecaptchaToken('')
      if (window.grecaptcha) window.grecaptcha.reset()
    }
    setLoading(false)
  }

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#f0f4f8'}}>
      <Script src="https://www.google.com/recaptcha/api.js" strategy="afterInteractive" async defer />
      <div style={{background:'white',borderRadius:'20px',padding:'40px',width:'100%',maxWidth:'400px',boxShadow:'0 8px 32px rgba(0,0,0,.12)'}}>
        <div style={{textAlign:'center',marginBottom:'32px'}}>
          <h1 style={{fontSize:'24px',fontWeight:900,color:'#1B2E4B'}}>Linka<span style={{color:'#4AADE8'}}>Style</span></h1>
          <p style={{color:'#6B7A90',fontSize:'14px',marginTop:'4px'}}>Panou de administrare</p>
        </div>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Parola</label>
            <input type="password" className="form-control" value={password}
              onChange={e => setPassword(e.target.value)} placeholder="Introdu parola..." autoFocus />
          </div>
          <div
            className="g-recaptcha"
            data-sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
            data-callback="onRecaptchaSuccess"
            data-expired-callback="onRecaptchaExpired"
            style={{ margin: '16px 0' }}
          />
          {error && <div style={{background:'#ffebee',color:'#c62828',padding:'10px 14px',borderRadius:'8px',fontSize:'13px',marginBottom:'16px'}}>{error}</div>}
          <button type="submit" className="btn-primary" style={{width:'100%',justifyContent:'center',padding:'14px'}} disabled={loading || !recaptchaToken}>
            {loading ? 'Se verifica...' : 'Intra in panou'}
          </button>
        </form>
      </div>
    </div>
  )
}
