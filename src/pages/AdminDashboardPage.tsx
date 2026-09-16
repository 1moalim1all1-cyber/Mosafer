import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { fetchDashboardStats } from '../lib/admin'

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [stats, setStats] = useState<{
    activeTrips: number
    pendingDrivers: number
    totalUsers: number
    activeRequests: number
    confirmedBookings: number
    totalReports: number
  } | null>(null)

  useEffect(() => {
    fetchDashboardStats().then(setStats)
  }, [])

  const overviewCards = [
    {
      value: stats?.activeTrips ?? '-',
      label: t('admin.activeTrips'),
      path: '/admin/trips?status=active',
      cardClass: 'border-success/30 bg-success/5 hover:border-success/70 hover:bg-success/10',
      valueClass: 'text-success',
    },
    {
      value: stats?.pendingDrivers ?? '-',
      label: t('admin.pendingDrivers'),
      path: '/admin/drivers',
      cardClass: 'border-warning/30 bg-warning/5 hover:border-warning/70 hover:bg-warning/10',
      valueClass: 'text-warning',
    },
    {
      value: stats?.totalUsers ?? '-',
      label: t('admin.totalUsers'),
      path: '/admin/users',
      cardClass: 'border-primary/30 bg-primary-light hover:border-primary/70',
      valueClass: 'text-primary',
    },
    {
      value: stats?.activeRequests ?? '-',
      label: 'طلبات ركاب نشطة',
      path: '/community',
      cardClass: 'border-primary/30 bg-primary-light hover:border-primary/70',
      valueClass: 'text-primary',
    },
    {
      value: stats?.confirmedBookings ?? '-',
      label: 'حجوزات مؤكدة',
      path: '/admin/bookings?status=confirmed',
      cardClass: 'border-success/30 bg-success/5 hover:border-success/70 hover:bg-success/10',
      valueClass: 'text-success',
    },
    {
      value: stats?.totalReports ?? '-',
      label: 'بلاغات الدعم',
      path: '/admin/reports',
      cardClass: 'border-warning/30 bg-warning/5 hover:border-warning/70 hover:bg-warning/10',
      valueClass: 'text-warning',
    },
  ]

  const links = [
    { path: '/admin/users', icon: '👥', label: t('admin.manageUsers') },
    { path: '/admin/trips', icon: '🚗', label: t('admin.manageTrips') },
    { path: '/admin/bookings', icon: '🎫', label: 'إدارة الحجوزات' },
    { path: '/admin/drivers', icon: '🪪', label: t('admin.reviewDrivers') },
    { path: '/admin/wallet-requests', icon: '👛', label: t('admin.walletRequests') },
    { path: '/admin/governorates', icon: '🗺️', label: t('admin.manageGovernorates') },
    { path: '/admin/coupons', icon: '🏷️', label: t('admin.manageCoupons') },
    { path: '/admin/reports', icon: '📨', label: t('admin.reportsTitle') },
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

      <main className="mx-auto w-full max-w-7xl px-4 py-6">
        <h2 className="mb-3 font-bold text-text-primary">{t('admin.overview')}</h2>
        <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          {overviewCards.map((card) => (
            <button
              key={card.label}
              type="button"
              onClick={() => navigate(card.path)}
              className={`group rounded-xl border p-4 text-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 ${card.cardClass}`}
              aria-label={`فتح ${card.label}`}
            >
              <p className={`text-2xl font-bold ${card.valueClass}`}>{card.value}</p>
              <p className="text-xs text-text-secondary transition group-hover:text-text-primary">{card.label}</p>
              <p className="mt-1 text-[10px] text-text-secondary/70 opacity-0 transition group-hover:opacity-100">اضغط للتفاصيل</p>
            </button>
          ))}
        </div>

        <h2 className="mb-3 font-bold text-text-primary">{t('admin.management')}</h2>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {links.map((link) => (
          <button
            key={link.path}
            onClick={() => navigate(link.path)}
            className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-4 text-right transition hover:border-primary"
          >
            <span className="text-xl">{link.icon}</span>
            <span className="flex-1 font-semibold text-text-primary">{link.label}</span>
            <span className="text-text-secondary">‹</span>
          </button>
        ))}
        </div>
      </main>
    </div>
  )
}
