import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Search, CarFront, PlusCircle, Wallet, UserCircle, LayoutDashboard } from 'lucide-react'
import { useAuth } from '../contexts/useAuth'

export function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { t } = useTranslation()

  const passengerTabs = [
    { path: '/', icon: Search, label: t('bottomNav.home') },
    { path: '/my-bookings', icon: CarFront, label: t('bottomNav.myTrips') },
    { path: '/wallet', icon: Wallet, label: t('bottomNav.wallet') },
    { path: '/profile', icon: UserCircle, label: t('bottomNav.profile') },
  ]

  let tabs = passengerTabs

  if (user?.role === 'driver') {
    tabs = [
      passengerTabs[0],
      { path: '/driver', icon: CarFront, label: t('bottomNav.driverTrips') },
      { path: '/driver/create-trip', icon: PlusCircle, label: t('bottomNav.addTrip') },
      passengerTabs[2],
      passengerTabs[3],
    ]
  }

  if (user?.role === 'admin') {
    tabs = [
      passengerTabs[0],
      { path: '/admin', icon: LayoutDashboard, label: t('bottomNav.admin') },
      passengerTabs[2],
      passengerTabs[3],
    ]
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 hidden border-t border-border bg-card shadow-[0_-4px_16px_rgba(15,23,42,0.06)] max-lg:block">
      <div className="mx-auto flex max-w-lg">
        {tabs.map((tab) => {
          const active = location.pathname === tab.path
          const isAddTrip = tab.path === '/driver/create-trip'
          const Icon = tab.icon
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-1 flex-col items-center gap-1 py-3 text-xs font-semibold transition-transform active:scale-95 ${
                isAddTrip ? 'text-warning' : active ? 'text-primary' : 'text-text-secondary'
              }`}
            >
              <Icon size={22} strokeWidth={active || isAddTrip ? 2.4 : 2} className={isAddTrip ? 'scale-110' : ''} />
              {tab.label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
