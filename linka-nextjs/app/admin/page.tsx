import { redirect } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import AdminLayout from '@/components/admin/AdminLayout'
import Link from 'next/link'

export default async function AdminDashboard() {
  if (!await isAuthenticated()) redirect('/admin/login')

  const { data: stats } = await supabaseAdmin.rpc('get_stats')
  const { data: recentOrders } = await supabaseAdmin
    .from('orders_with_items')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <AdminLayout title="Dashboard">
      {/* Statistici */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {[
          { label: 'Comenzi noi', value: stats?.new_orders || 0, icon: '🔔', color: '#fff9c4', link: '/admin/comenzi' },
          { label: 'Comenzi azi', value: stats?.orders_today || 0, icon: '📦', color: '#e3f2fd', link: '/admin/comenzi' },
          { label: 'Vânzări azi', value: `${stats?.revenue_today || 0} MDL`, icon: '💰', color: '#e8f5e9', link: '/admin/comenzi' },
          { label: 'Total produse', value: stats?.total_products || 0, icon: '👟', color: '#f3e5f5', link: '/admin/produse' },
        ].map(stat => (
          <Link key={stat.label} href={stat.link} style={{ textDecoration: 'none' }}>
            <div className="admin-card" style={{ background: stat.color, cursor: 'pointer' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>{stat.icon}</div>
              <div style={{ fontSize: '28px', fontWeight: 900, color: '#1B2E4B' }}>{stat.value}</div>
              <div style={{ fontSize: '13px', color: '#6B7A90', fontWeight: 600 }}>{stat.label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Comenzi recente */}
      <div className="admin-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800 }}>Comenzi recente</h2>
          <Link href="/admin/comenzi" className="btn-primary" style={{ fontSize: '13px' }}>
            Vezi toate →
          </Link>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f0f4f8' }}>
                {['#', 'Client', 'Telefon', 'Total', 'Status', 'Data'].map(h => (
                  <th key={h} style={{ padding: '10px', textAlign: 'left', fontSize: '12px', color: '#6B7A90', fontWeight: 700, textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders?.map((order: any) => (
                <tr key={order.id} style={{ borderBottom: '1px solid #f0f4f8' }}>
                  <td style={{ padding: '12px 10px', fontWeight: 700 }}>#{order.order_number}</td>
                  <td style={{ padding: '12px 10px' }}>{order.customer_name}</td>
                  <td style={{ padding: '12px 10px' }}><a href={`tel:${order.customer_phone}`} style={{ color: '#4AADE8' }}>{order.customer_phone}</a></td>
                  <td style={{ padding: '12px 10px', fontWeight: 700 }}>{order.total} MDL</td>
                  <td style={{ padding: '12px 10px' }}>
                    <span className={`badge badge-${order.status}`}>
                      {order.status === 'noua' ? '🔔 Nouă' : order.status === 'confirmata' ? '✅ Confirmată' : order.status === 'in_livrare' ? '🚚 Livrare' : order.status === 'livrata' ? '✅ Livrată' : '❌ Anulată'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 10px', color: '#6B7A90', fontSize: '13px' }}>
                    {new Date(order.created_at).toLocaleDateString('ro-MD')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}
