import { useNavigate, useLocation } from 'react-router-dom'
import { Search, CarFront, PlusCircle, Wallet, UserCircle, LayoutDashboard } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const PASSENGER_TABS = [
  { path: '/', icon: Search, label: 'مسافر فين؟' },
  { path: '/my-bookings', icon: CarFront, label: 'رحلاتي' },
  { path: '/wallet', icon: Wallet, label: 'المحفظة' },
  { path: '/profile', icon: UserCircle, label: 'حسابي' },
]

export function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()

  let tabs = PASSENGER_TABS

  if (user?.role === 'driver') {
    tabs = [
      PASSENGER_TABS[0],
      { path: '/driver', icon: CarFront, label: 'رحلاتي كسائق' },
      { path: '/driver/create-trip', icon: PlusCircle, label: 'أضف رحلة' },
      PASSENGER_TABS[2],
      PASSENGER_TABS[3],
    ]
  }

  if (user?.role === 'admin') {
    tabs = [
      PASSENGER_TABS[0],
      { path: '/admin', icon: LayoutDashboard, label: 'الإدارة' },
      PASSENGER_TABS[2],
      PASSENGER_TABS[3],
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
