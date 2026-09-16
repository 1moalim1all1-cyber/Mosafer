import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Search, CarFront, Wallet, UserCircle, LayoutDashboard, Bell, Globe, Users2, MessageCircle } from 'lucide-react'
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
    { path: '/community', icon: Users2, label: t('community.title') },
    { path: '/my-bookings', icon: CarFront, label: t('bottomNav.myTrips') },
    { path: '/wallet', icon: Wallet, label: t('bottomNav.wallet') },
    { path: '/notifications', icon: Bell, label: t('notifications.title') },
    { path: '/chats', icon: MessageCircle, label: t('common.chats') },
  ]

  if (user?.role === 'driver') {
    links.splice(1, 0, { path: '/driver', icon: CarFront, label: t('bottomNav.driverTrips') })
  }
  if (user?.role === 'admin') {
    links.splice(1, 0, { path: '/admin', icon: LayoutDashboard, label: t('bottomNav.admin') })
  }

  return (
    <header className="sticky top-0 z-40 hidden border-b border-white/8 bg-card/88 shadow-[0_10px_35px_rgba(0,0,0,.16)] backdrop-blur-xl lg:block">
      <div className="mx-auto flex w-full max-w-7xl min-w-0 items-center justify-between gap-4 overflow-hidden px-5 py-2.5">
        <button onClick={() => navigate('/')} className="group flex items-center gap-2.5 rounded-2xl p-1.5 transition hover:bg-white/5">
          <img src={`${import.meta.env.BASE_URL}logo.jpeg`} alt="مسافر" className="h-10 w-10 rounded-xl object-cover ring-1 ring-white/15 shadow-[0_5px_16px_rgba(22,119,255,.25)]" />
          <span className="hidden font-bold text-text-primary 2xl:inline">مسافر</span>
        </button>

        <nav className="flex min-w-0 flex-1 items-center justify-center gap-1 rounded-2xl border border-white/7 bg-bg/35 p-1.5 text-sm xl:gap-1.5">
          {links.map((link) => {
            const active = location.pathname === link.path
            return (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className={`group flex h-10 items-center gap-2 rounded-xl px-2.5 font-semibold transition-all xl:px-3 ${
                  active ? 'bg-primary text-white shadow-[0_7px_18px_rgba(22,119,255,.28)]' : 'text-text-secondary hover:bg-white/6 hover:text-text-primary'
                }`}
              >
                <link.icon size={17} strokeWidth={active ? 2.5 : 2} className="shrink-0" />
                <span className="hidden xl:inline">{link.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={() => changeLanguage(i18n.language === 'ar' ? 'en' : 'ar')}
            className="flex h-10 items-center gap-1.5 rounded-xl border border-border bg-bg/35 px-3 text-sm font-semibold text-text-secondary transition hover:border-primary/70 hover:text-text-primary"
            aria-label="تغيير اللغة"
          >
            <Globe size={14} />
            {i18n.language === 'ar' ? 'EN' : 'عربي'}
          </button>
          <button
            onClick={() => navigate('/profile')}
            className="flex h-10 items-center gap-2 rounded-xl border border-border bg-bg/35 px-3 text-sm font-semibold text-text-primary transition hover:border-primary"
          >
            <UserCircle size={16} />
            <span className="hidden 2xl:inline">{user?.fullName ?? t('bottomNav.profile')}</span>
          </button>
          <button onClick={() => logout()} className="rounded-xl px-2 py-2 text-sm font-semibold text-danger transition hover:bg-danger/10">
            {t('profile.logout')}
          </button>
        </div>
      </div>
    </header>
  )
}
