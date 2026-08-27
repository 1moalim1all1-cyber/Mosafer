import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/useAuth'
import { changeLanguage } from '../lib/i18n'
import { Button } from '../components/ui/Button'
import { BottomNav } from '../components/BottomNav'

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()

  async function handleLogout() {
    if (!confirm('متأكد إنك عايز تسجّل خروج من حسابك؟')) return
    await logout()
    navigate('/login')
  }

  function getReferralLink() {
    // رابط حقيقي بيفتح صفحة التسجيل وكود الدعوة متعبّي جواه لوحده -
    // لازم يكون بعد علامة # عشان يتماشى مع نظام التنقّل (Hash Router)
    return `${window.location.origin}${window.location.pathname}#/register?ref=${user?.referralCode}`
  }

  function copyCode() {
    if (!user?.referralCode) return
    navigator.clipboard.writeText(getReferralLink())
    alert('اتنسخ الرابط')
  }

  async function shareCode() {
    if (!user?.referralCode) return
    const link = getReferralLink()
    const text = `سجّل في تطبيق مسافر بكود الدعوة بتاعي "${user.referralCode}" وخد رصيد ترحيبي في محفظتك!\n${link}`
    if (navigator.share) {
      try {
        await navigator.share({ title: 'مسافر', text, url: link })
      } catch {
        // المستخدم لغى المشاركة
      }
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
    }
  }

  return (
    <div className="min-h-screen bg-bg pb-24">
      <header className="border-b border-border bg-card px-4 py-4">
        <h1 className="text-lg font-bold text-text-primary">{t('profile.title')}</h1>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6">
        <div className="mb-4 text-center">
          <div className="mx-auto mb-2 flex h-20 w-20 items-center justify-center rounded-full bg-primary-light text-3xl">
            🧑
          </div>
          <p className="text-lg font-bold text-text-primary">{user?.fullName}</p>
          <p className="text-text-secondary">{user?.phone}</p>
        </div>

        {user?.referralCode && (
          <div className="mb-6 rounded-2xl bg-gradient-to-br from-primary to-secondary p-5 text-center text-white">
            <p className="mb-2 text-sm text-white/70">{t('profile.referralSubtitle')}</p>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => window.open(getReferralLink(), '_blank')}
                className="text-2xl font-bold tracking-widest underline decoration-dotted underline-offset-4"
                aria-label="فتح رابط الدعوة"
              >
                {user.referralCode}
              </button>
              <button onClick={copyCode} className="text-lg" aria-label="نسخ الكود">
                📋
              </button>
              <button onClick={shareCode} className="text-lg" aria-label="مشاركة الكود">
                📤
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {user?.role === 'driver' && (
            <Button variant="secondary" onClick={() => navigate('/driver')}>
              {t('profile.driverDashboard')}
            </Button>
          )}
          {user?.role === 'admin' && (
            <Button variant="secondary" onClick={() => navigate('/admin')}>
              {t('profile.adminDashboard')}
            </Button>
          )}
          <Button variant="secondary" onClick={() => navigate('/wallet')}>
            {t('bottomNav.wallet')}
          </Button>
          <Button variant="secondary" onClick={() => navigate('/my-bookings')}>
            {t('bottomNav.myTrips')}
          </Button>
          <Button variant="secondary" onClick={() => navigate('/favorites')}>
            {t('profile.favorites')}
          </Button>
          <Button
            variant="secondary"
            onClick={() => changeLanguage(i18n.language === 'ar' ? 'en' : 'ar')}
          >
            🌐 {i18n.language === 'ar' ? 'English' : 'العربية'}
          </Button>
          <Button variant="secondary" onClick={() => navigate('/about-help')}>
            {t('profile.aboutHelp')}
          </Button>
          <Button variant="secondary" onClick={() => navigate('/support')}>
            {t('profile.support')}
          </Button>
          <Button variant="danger" onClick={handleLogout}>
            {t('profile.logout')}
          </Button>
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
