import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchDashboardStats } from '../lib/admin'

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<{ activeTrips: number; pendingDrivers: number; totalUsers: number } | null>(null)

  useEffect(() => {
    fetchDashboardStats().then(setStats)
  }, [])

  const links = [
    { path: '/admin/drivers', icon: '🪪', label: 'مراجعة السائقين' },
    { path: '/admin/wallet-requests', icon: '👛', label: 'طلبات المحفظة' },
    { path: '/admin/governorates', icon: '🗺️', label: 'إدارة المحافظات' },
    { path: '/admin/coupons', icon: '🏷️', label: 'إدارة الكوبونات' },
  ]

  return (
    <div className="min-h-screen bg-bg">
      <header className="flex items-center justify-between border-b border-border bg-white px-4 py-4">
        <h1 className="text-lg font-bold text-text-primary">لوحة الإدارة</h1>
        <button onClick={() => navigate('/')} className="text-sm font-semibold text-primary">
          الرئيسية
        </button>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6">
        <h2 className="mb-3 font-bold text-text-primary">نظرة عامة</h2>
        <div className="mb-6 grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-success/30 bg-success/5 p-4 text-center">
            <p className="text-2xl font-bold text-success">{stats?.activeTrips ?? '-'}</p>
            <p className="text-xs text-text-secondary">رحلات نشطة</p>
          </div>
          <div className="rounded-xl border border-warning/30 bg-warning/5 p-4 text-center">
            <p className="text-2xl font-bold text-warning">{stats?.pendingDrivers ?? '-'}</p>
            <p className="text-xs text-text-secondary">سائقين بالمراجعة</p>
          </div>
          <div className="rounded-xl border border-primary/30 bg-primary-light p-4 text-center">
            <p className="text-2xl font-bold text-primary">{stats?.totalUsers ?? '-'}</p>
            <p className="text-xs text-text-secondary">إجمالي المستخدمين</p>
          </div>
        </div>

        <h2 className="mb-3 font-bold text-text-primary">الإدارة</h2>
        {links.map((link) => (
          <button
            key={link.path}
            onClick={() => navigate(link.path)}
            className="mb-2 flex w-full items-center gap-3 rounded-xl border border-border bg-white p-4 text-right"
          >
            <span className="text-xl">{link.icon}</span>
            <span className="flex-1 font-semibold text-text-primary">{link.label}</span>
            <span className="text-text-secondary">‹</span>
          </button>
        ))}
      </main>
    </div>
  )
}
