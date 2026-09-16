import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Search, CarFront, PlusCircle, Wallet, UserCircle, LayoutDashboard, Users2 } from 'lucide-react'
import { useAuth } from '../contexts/useAuth'

export function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { t } = useTranslation()

  const passengerTabs = [
    { path: '/', icon: Search, label: t('bottomNav.home') },
    { path: '/community', icon: Users2, label: t('community.title') },
    { path: '/my-bookings', icon: CarFront, label: t('bottomNav.myTrips') },
    { path: '/wallet', icon: Wallet, label: t('bottomNav.wallet') },
    { path: '/profile', icon: UserCircle, label: t('bottomNav.profile') },
  ]

  let tabs = passengerTabs

  if (user?.role === 'driver') {
    tabs = [
      passengerTabs[0],
      passengerTabs[1],
      { path: '/driver', icon: CarFront, label: t('bottomNav.driverTrips') },
      { path: '/driver/create-trip', icon: PlusCircle, label: t('bottomNav.addTrip') },
      passengerTabs[3],
      passengerTabs[4],
    ]
  }

  if (user?.role === 'admin') {
    tabs = [
      passengerTabs[0],
      { path: '/admin', icon: LayoutDashboard, label: t('bottomNav.admin') },
      passengerTabs[3],
      passengerTabs[4],
    ]
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 hidden border-t border-white/10 bg-card/94 px-2 pb-[max(.4rem,env(safe-area-inset-bottom))] pt-1.5 shadow-[0_-12px_35px_rgba(0,0,0,.28)] backdrop-blur-xl max-lg:block">
      <div className="mx-auto flex max-w-lg gap-1">
        {tabs.map((tab) => {
          const active = location.pathname === tab.path
          const isAddTrip = tab.path === '/driver/create-trip'
          const Icon = tab.icon
          const compact = tabs.length > 5
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`relative flex min-w-0 flex-1 flex-col items-center gap-1 rounded-2xl py-2 font-semibold transition-all active:scale-95 ${
                compact ? 'text-[10px]' : 'text-xs'
              } ${isAddTrip ? 'bg-warning/10 text-warning' : active ? 'bg-primary/12 text-primary' : 'text-text-secondary hover:bg-white/5'}`}
            >
              {active && !isAddTrip && <span className="absolute top-0 h-0.5 w-7 rounded-full bg-primary shadow-[0_0_10px_rgba(22,119,255,.9)]" />}
              <span className={`flex h-8 w-8 items-center justify-center rounded-xl transition ${active ? 'bg-primary text-white shadow-[0_5px_14px_rgba(22,119,255,.3)]' : isAddTrip ? 'bg-warning text-tertiary' : ''}`}>
                <Icon size={compact ? 18 : 20} strokeWidth={active || isAddTrip ? 2.5 : 2} />
              </span>
              <span className="max-w-full truncate px-0.5">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
