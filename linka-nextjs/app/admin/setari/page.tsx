import AdminLayout from '@/components/admin/AdminLayout'
import { isAuthenticated } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function SetariPage() {
  if (!await isAuthenticated()) redirect('/admin/login')

  return (
    <AdminLayout title="Setari">
      <div className="admin-card" style={{marginBottom:'16px'}}>
        <h3 style={{fontWeight:800,marginBottom:'16px'}}>Informatii magazin</h3>
        <div style={{display:'grid',gap:'12px',fontSize:'14px',color:'#6B7A90'}}>
          <div><strong>Telegram Bot:</strong> Activ — comenzile vin pe Telegram automat</div>
          <div><strong>Email confirmare:</strong> Se trimite automat la fiecare comanda cu email</div>
          <div><strong>Livrare gratuita:</strong> Comenzi peste 1000 MDL</div>
          <div><strong>Parola admin:</strong> Configurata in fisierul .env</div>
        </div>
      </div>

      <div className="admin-card">
        <h3 style={{fontWeight:800,marginBottom:'16px'}}>Linkuri utile</h3>
        <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
          {[
            { label: 'Supabase Dashboard', url: 'https://supabase.com/dashboard' },
            { label: 'Cloudinary Media Library', url: 'https://cloudinary.com/console' },
            { label: 'Vercel Deployments', url: 'https://vercel.com/dashboard' },
            { label: 'Google Analytics', url: 'https://analytics.google.com' },
          ].map(link => (
            <a key={link.label} href={link.url} target="_blank"
              style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 16px',background:'#f8faff',borderRadius:'10px',color:'#1B2E4B',fontWeight:600,fontSize:'14px'}}>
              {link.label} <span style={{color:'#4AADE8'}}>→</span>
            </a>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}
