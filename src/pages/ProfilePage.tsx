import { useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/useAuth'
import { changeLanguage } from '../lib/i18n'
import { Button } from '../components/ui/Button'
import { BottomNav } from '../components/BottomNav'
import { Camera, Pencil, Save, UserRound } from 'lucide-react'
import { uploadImageToCloudinary } from '../lib/cloudinary'
import { updateMyProfile } from '../lib/users'
import { subscribeDriverStatus } from '../lib/driverActions'

export default function ProfilePage() {
  const { user, logout, refreshUser } = useAuth()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const [editing, setEditing] = useState(false)
  const [fullName, setFullName] = useState(user?.fullName ?? '')
  const [previewUrl, setPreviewUrl] = useState(user?.profileImageUrl ?? '')
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [driverStatus, setDriverStatus] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setFullName(user?.fullName ?? '')
    setPreviewUrl(user?.profileImageUrl ?? '')
  }, [user?.fullName, user?.profileImageUrl])

  useEffect(() => {
    if (!user) return
    return subscribeDriverStatus(user.uid, setDriverStatus)
  }, [user])

  function selectPhoto(file?: File) {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setProfileError('اختار ملف صورة فقط')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setProfileError('حجم الصورة لازم يكون أقل من 5 ميجا')
      return
    }
    setSelectedImage(file)
    setPreviewUrl(URL.createObjectURL(file))
    setEditing(true)
    setProfileError('')
  }

  async function saveProfile() {
    if (fullName.trim().length < 2) {
      setProfileError('اكتب اسم صحيح')
      return
    }
    setSaving(true)
    setProfileError('')
    try {
      const imageUrl = selectedImage ? await uploadImageToCloudinary(selectedImage, 'mosafer/users/profile') : undefined
      await updateMyProfile({ fullName, profileImageUrl: imageUrl })
      await refreshUser()
      setSelectedImage(null)
      setEditing(false)
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : 'تعذر حفظ البيانات')
    } finally {
      setSaving(false)
    }
  }

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
        <div className="app-surface mb-5 rounded-3xl p-5 text-center">
          <button onClick={() => fileInputRef.current?.click()} className="group relative mx-auto mb-3 block h-24 w-24" aria-label="تغيير الصورة الشخصية">
            <span className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-primary/50 bg-primary-light text-primary shadow-lg">
              {previewUrl ? <img src={previewUrl} alt={fullName || 'الصورة الشخصية'} className="h-full w-full object-cover" /> : <UserRound size={42} />}
            </span>
            <span className="absolute bottom-0 left-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-card bg-primary text-white"><Camera size={15} /></span>
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(event) => selectPhoto(event.target.files?.[0])} />
          {editing ? (
            <div className="mx-auto max-w-sm">
              <input value={fullName} onChange={(event) => setFullName(event.target.value)} className="mb-3 w-full rounded-xl border-2 border-border bg-bg px-4 py-3 text-center font-bold text-text-primary focus:border-primary focus:outline-none" placeholder="الاسم الكامل" />
              {profileError && <p className="mb-3 text-sm text-danger">{profileError}</p>}
              <div className="flex gap-2"><Button variant="secondary" onClick={() => { setEditing(false); setFullName(user?.fullName ?? ''); setPreviewUrl(user?.profileImageUrl ?? ''); setSelectedImage(null) }}>إلغاء</Button><Button onClick={saveProfile} loading={saving} icon={<Save size={17} />}>حفظ البيانات</Button></div>
            </div>
          ) : (
            <button onClick={() => setEditing(true)} className="inline-flex items-center gap-2 text-lg font-bold text-text-primary">{user?.fullName}<Pencil size={15} className="text-primary" /></button>
          )}
          <p className="text-text-secondary">{user?.phone}</p>
        </div>

        {user?.referralCode && (
          <div className="mb-6 rounded-2xl bg-gradient-to-br from-primary to-secondary p-5 text-center text-white">
            <p className="mb-2 text-sm text-white/70">{t('profile.referralSubtitle')}</p>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={shareCode}
                className="text-2xl font-bold tracking-widest underline decoration-dotted underline-offset-4"
                aria-label={t('profile.shareCode')}
              >
                {user.referralCode}
              </button>
              <button onClick={copyCode} className="text-lg" aria-label={t('profile.copyCode')}>
                📋
              </button>
              <button onClick={shareCode} className="text-lg" aria-label={t('profile.shareCode')}>
                📤
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {driverStatus === 'approved' && (
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
          <Button variant="secondary" onClick={() => navigate('/chats')}>
            {t('common.chats')}
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
