import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { fetchDashboardStats } from '../lib/admin'

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [stats, setStats] = useState<{ activeTrips: number; pendingDrivers: number; totalUsers: number } | null>(null)

  useEffect(() => {
    fetchDashboardStats().then(setStats)
  }, [])

  const links = [
    { path: '/admin/users', icon: '👥', label: t('admin.manageUsers') },
    { path: '/admin/trips', icon: '🚗', label: t('admin.manageTrips') },
    { path: '/admin/drivers', icon: '🪪', label: t('admin.reviewDrivers') },
    { path: '/admin/wallet-requests', icon: '👛', label: t('admin.walletRequests') },
    { path: '/admin/governorates', icon: '🗺️', label: t('admin.manageGovernorates') },
    { path: '/admin/coupons', icon: '🏷️', label: t('admin.manageCoupons') },
    { path: '/admin/settings', icon: '⚙️', label: t('admin.generalSettings') },
  ]

  return (
    <div className="min-h-screen bg-bg">
      <header className="flex items-center justify-between border-b border-border bg-card px-4 py-4">
        <h1 className="text-lg font-bold text-text-primary">{t('admin.dashboard')}</h1>
        <button onClick={() => navigate('/')} className="text-sm font-semibold text-primary">
          {t('landing.home')}
        </button>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6">
        <h2 className="mb-3 font-bold text-text-primary">{t('admin.overview')}</h2>
        <div className="mb-6 grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-success/30 bg-success/5 p-4 text-center">
            <p className="text-2xl font-bold text-success">{stats?.activeTrips ?? '-'}</p>
            <p className="text-xs text-text-secondary">{t('admin.activeTrips')}</p>
          </div>
          <div className="rounded-xl border border-warning/30 bg-warning/5 p-4 text-center">
            <p className="text-2xl font-bold text-warning">{stats?.pendingDrivers ?? '-'}</p>
            <p className="text-xs text-text-secondary">{t('admin.pendingDrivers')}</p>
          </div>
          <div className="rounded-xl border border-primary/30 bg-primary-light p-4 text-center">
            <p className="text-2xl font-bold text-primary">{stats?.totalUsers ?? '-'}</p>
            <p className="text-xs text-text-secondary">{t('admin.totalUsers')}</p>
          </div>
        </div>

        <h2 className="mb-3 font-bold text-text-primary">{t('admin.management')}</h2>
        {links.map((link) => (
          <button
            key={link.path}
            onClick={() => navigate(link.path)}
            className="mb-2 flex w-full items-center gap-3 rounded-xl border border-border bg-card p-4 text-right"
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
