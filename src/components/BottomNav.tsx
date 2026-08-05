import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const PASSENGER_TABS = [
  { path: '/', icon: '🔍', label: 'فين رايح؟' },
  { path: '/my-bookings', icon: '📋', label: 'رحلاتي' },
  { path: '/wallet', icon: '👛', label: 'المحفظة' },
  { path: '/profile', icon: '🧑', label: 'حسابي' },
]

export function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()

  // السائق بيشوف أيقونة "إضافة رحلة" سريعة في نص الشريط، عشان ينشر رحلة
  // بضغطة واحدة من غير ما يدخل بروفايله ويدور على لوحة السائق
  const tabs = user?.role === 'driver'
    ? [
        PASSENGER_TABS[0],
        { path: '/driver', icon: '🚘', label: 'رحلاتي كسائق' },
        { path: '/driver/create-trip', icon: '➕', label: 'أضف رحلة' },
        PASSENGER_TABS[2],
        PASSENGER_TABS[3],
      ]
    : PASSENGER_TABS

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-white shadow-[0_-4px_16px_rgba(15,23,42,0.06)]">
      <div className="mx-auto flex max-w-lg">
        {tabs.map((tab) => {
          const active = location.pathname === tab.path
          const isAddTrip = tab.path === '/driver/create-trip'
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-1 flex-col items-center gap-1 py-3 text-xs font-semibold ${
                isAddTrip ? 'text-warning' : active ? 'text-primary' : 'text-text-secondary'
              }`}
            >
              <span className={`text-xl ${isAddTrip ? 'scale-110' : ''}`}>{tab.icon}</span>
              {tab.label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
