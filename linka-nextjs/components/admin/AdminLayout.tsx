'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const menuItems = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/produse', label: 'Produse', icon: '👟' },
  { href: '/admin/produse/descrieri', label: 'Descrieri', icon: '📝' },
  { href: '/admin/branduri', label: 'Branduri', icon: '🏷️' },
  { href: '/admin/comenzi', label: 'Comenzi', icon: '📦' },
  { href: '/admin/setari', label: 'Setari', icon: '⚙️' },
]

export default function AdminLayout({ children, title }: { children: React.ReactNode, title: string }) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE' })
    router.push('/admin/login')
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div style={{padding:'0 20px 24px',borderBottom:'1px solid rgba(255,255,255,.1)'}}>
          <h1 style={{fontSize:'20px',fontWeight:900,color:'#4AADE8'}}>Linka<span style={{color:'white'}}>Style</span></h1>
          <p style={{fontSize:'11px',color:'rgba(255,255,255,.5)',marginTop:'2px'}}>Panou admin</p>
        </div>
        <nav style={{padding:'16px 0'}}>
          {menuItems.map(item => (
            <Link key={item.href} href={item.href}
              style={{display:'flex',alignItems:'center',gap:'10px',padding:'12px 20px',fontSize:'14px',fontWeight:600,
                color: pathname === item.href ? '#4AADE8' : 'rgba(255,255,255,.7)',
                background: pathname === item.href ? 'rgba(74,173,232,.15)' : 'transparent',
                borderLeft: pathname === item.href ? '3px solid #4AADE8' : '3px solid transparent'}}>
              <span>{item.icon}</span>{item.label}
            </Link>
          ))}
        </nav>
        <div style={{position:'absolute',bottom:'20px',left:0,right:0,padding:'0 20px'}}>
          <Link href="/" target="_blank"
            style={{display:'block',textAlign:'center',padding:'10px',borderRadius:'10px',background:'rgba(255,255,255,.1)',color:'rgba(255,255,255,.7)',fontSize:'13px',marginBottom:'8px'}}>
            Viziteaza site-ul →
          </Link>
          <button onClick={handleLogout}
            style={{width:'100%',padding:'10px',borderRadius:'10px',background:'rgba(232,68,68,.2)',color:'#ff8a80',border:'none',fontSize:'13px',fontWeight:600,cursor:'pointer'}}>
            Deconectare
          </button>
        </div>
      </aside>
      <main className="admin-content">
        <div style={{marginBottom:'24px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <h1 style={{fontSize:'24px',fontWeight:900,color:'#1B2E4B'}}>{title}</h1>
          <div style={{fontSize:'13px',color:'#6B7A90'}}>{new Date().toLocaleDateString('ro-MD', {weekday:'long',year:'numeric',month:'long',day:'numeric'})}</div>
        </div>
        {children}
      </main>
    </div>
  )
}
