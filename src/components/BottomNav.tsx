import { useNavigate, useLocation } from 'react-router-dom'

const TABS = [
  { path: '/', icon: '🔍', label: 'فين رايح؟' },
  { path: '/my-bookings', icon: '📋', label: 'رحلاتي' },
  { path: '/wallet', icon: '👛', label: 'المحفظة' },
  { path: '/profile', icon: '🧑', label: 'حسابي' },
]

export function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-white shadow-[0_-4px_16px_rgba(15,23,42,0.06)]">
      <div className="mx-auto flex max-w-lg">
        {TABS.map((tab) => {
          const active = location.pathname === tab.path
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-1 flex-col items-center gap-1 py-3 text-xs font-semibold ${
                active ? 'text-primary' : 'text-text-secondary'
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              {tab.label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
