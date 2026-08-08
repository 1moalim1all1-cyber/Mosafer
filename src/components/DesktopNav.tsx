import { useNavigate, useLocation } from 'react-router-dom'
import { Search, CarFront, Wallet, UserCircle, LayoutDashboard, Bell } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

/**
 * شريط تنقّل علوي بيظهر بس على شاشات الكمبيوتر (lg فأكبر)، عشان
 * التطبيق يحس زي موقع ويب عادي نضيف من غير شريط سفلي (اللي شكله
 * مخصص للموبايل)، بينما الموبايل والتطبيق المثبّت بيفضلوا شايفين
 * الشريط السفلي زي أي أبليكيشن حقيقي.
 */
export function DesktopNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()

  const links = [
    { path: '/', icon: Search, label: 'مسافر فين؟' },
    { path: '/my-bookings', icon: CarFront, label: 'رحلاتي' },
    { path: '/wallet', icon: Wallet, label: 'المحفظة' },
    { path: '/notifications', icon: Bell, label: 'الإشعارات' },
  ]

  if (user?.role === 'driver') {
    links.splice(1, 0, { path: '/driver', icon: CarFront, label: 'لوحة السائق' })
  }
  if (user?.role === 'admin') {
    links.splice(1, 0, { path: '/admin', icon: LayoutDashboard, label: 'الإدارة' })
  }

  return (
    <header className="sticky top-0 z-40 hidden border-b border-border bg-card/90 backdrop-blur-md lg:block">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <button onClick={() => navigate('/')} className="flex items-center gap-2">
          <img src={`${import.meta.env.BASE_URL}logo.jpeg`} alt="مسافر" className="h-9 w-9 rounded-xl object-cover" />
          <span className="font-bold text-text-primary">مسافر</span>
        </button>

        <nav className="flex items-center gap-6 text-sm">
          {links.map((link) => {
            const active = location.pathname === link.path
            return (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className={`flex items-center gap-1.5 font-semibold transition ${
                  active ? 'text-primary' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <link.icon size={16} />
                {link.label}
              </button>
            )
          })}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm font-semibold text-text-primary hover:border-primary"
          >
            <UserCircle size={16} />
            {user?.fullName ?? 'حسابي'}
          </button>
          <button onClick={() => logout()} className="text-sm font-semibold text-danger">
            خروج
          </button>
        </div>
      </div>
    </header>
  )
}
