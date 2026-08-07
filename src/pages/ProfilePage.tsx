import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/Button'
import { BottomNav } from '../components/BottomNav'

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    if (!confirm('متأكد إنك عايز تسجّل خروج من حسابك؟')) return
    await logout()
    navigate('/login')
  }

  function copyCode() {
    if (!user?.referralCode) return
    navigator.clipboard.writeText(user.referralCode)
    alert('اتنسخ الكود')
  }

  async function shareCode() {
    if (!user?.referralCode) return
    const text = `سجّل في تطبيق مسافر بكود الدعوة بتاعي "${user.referralCode}" وخد رصيد ترحيبي في محفظتك!`
    if (navigator.share) {
      try {
        await navigator.share({ title: 'مسافر', text })
      } catch {
        // المستخدم لغى المشاركة
      }
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
    }
  }

  return (
    <div className="min-h-screen bg-bg pb-24">
      <header className="border-b border-border bg-white px-4 py-4">
        <h1 className="text-lg font-bold text-text-primary">الملف الشخصي</h1>
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
          <div className="mb-6 rounded-2xl bg-gradient-to-br from-primary to-primary-hover p-5 text-center text-white">
            <p className="mb-2 text-sm text-white/70">ادعُ صديقك واكسبوا مكافأة سوا</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl font-bold tracking-widest">{user.referralCode}</span>
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
              لوحة السائق
            </Button>
          )}
          {user?.role === 'admin' && (
            <Button variant="secondary" onClick={() => navigate('/admin')}>
              لوحة الإدارة
            </Button>
          )}
          <Button variant="secondary" onClick={() => navigate('/wallet')}>
            المحفظة
          </Button>
          <Button variant="secondary" onClick={() => navigate('/my-bookings')}>
            رحلاتي
          </Button>
          <Button variant="secondary" onClick={() => navigate('/favorites')}>
            المفضلة
          </Button>
          <Button variant="secondary" onClick={() => navigate('/about-help')}>
            عن مسافر ومساعدة
          </Button>
          <Button variant="secondary" onClick={() => navigate('/support')}>
            الدعم والشكاوى
          </Button>
          <Button variant="danger" onClick={handleLogout}>
            تسجيل الخروج
          </Button>
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
