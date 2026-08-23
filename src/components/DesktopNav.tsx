import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Search, CarFront, Wallet, UserCircle, LayoutDashboard, Bell, Globe } from 'lucide-react'
import { useAuth } from '../contexts/useAuth'
import { changeLanguage } from '../lib/i18n'

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
  const { t, i18n } = useTranslation()

  const links = [
    { path: '/', icon: Search, label: t('bottomNav.home') },
    { path: '/my-bookings', icon: CarFront, label: t('bottomNav.myTrips') },
    { path: '/wallet', icon: Wallet, label: t('bottomNav.wallet') },
    { path: '/notifications', icon: Bell, label: t('notifications.title') },
  ]

  if (user?.role === 'driver') {
    links.splice(1, 0, { path: '/driver', icon: CarFront, label: t('bottomNav.driverTrips') })
  }
  if (user?.role === 'admin') {
    links.splice(1, 0, { path: '/admin', icon: LayoutDashboard, label: t('bottomNav.admin') })
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
            onClick={() => changeLanguage(i18n.language === 'ar' ? 'en' : 'ar')}
            className="flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-sm font-semibold text-text-secondary hover:text-text-primary"
            aria-label="تغيير اللغة"
          >
            <Globe size={14} />
            {i18n.language === 'ar' ? 'EN' : 'عربي'}
          </button>
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm font-semibold text-text-primary hover:border-primary"
          >
            <UserCircle size={16} />
            {user?.fullName ?? t('bottomNav.profile')}
          </button>
          <button onClick={() => logout()} className="text-sm font-semibold text-danger">
            {t('profile.logout')}
          </button>
        </div>
      </div>
    </header>
  )
}
