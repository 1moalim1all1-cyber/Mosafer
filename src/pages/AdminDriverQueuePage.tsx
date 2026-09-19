import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { subscribePendingDrivers, subscribeApprovedDrivers, approveDriver, rejectDriver, returnDriverToReview, type PendingDriver } from '../lib/admin'
import { fetchUserProfile } from '../lib/users'
import type { AppUser } from '../types/user'
import { Button } from '../components/ui/Button'

function DriverRow({ driver, approved = false }: { driver: PendingDriver; approved?: boolean }) {
  const { t } = useTranslation()
  const [user, setUser] = useState<AppUser | null>(null)
  const [expanded, setExpanded] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchUserProfile(driver.uid).then(setUser)
  }, [driver.uid])

  async function handleApprove() {
    setLoading(true)
    try {
      await approveDriver(driver.uid)
    } catch (err) {
      alert(err instanceof Error ? err.message : t('admin.genericError'))
    } finally {
      setLoading(false)
    }
  }

  async function handleReject() {
    const reason = prompt(t('admin.rejectReasonPrompt'))
    if (!reason) return
    setLoading(true)
    try {
      await rejectDriver(driver.uid, reason)
    } catch (err) {
      alert(err instanceof Error ? err.message : t('admin.genericError'))
    } finally {
      setLoading(false)
    }
  }

  async function handleReturnToReview() {
    if (!confirm('إعادة السائق إلى قائمة المراجعة وإيقاف نشر رحلات جديدة مؤقتًا؟')) return
    setLoading(true)
    try {
      await returnDriverToReview(driver.uid)
    } catch (err) {
      alert(err instanceof Error ? err.message : t('admin.genericError'))
    } finally {
      setLoading(false)
    }
  }

  const docs = [
    { label: t('admin.docNationalId'), url: driver.nationalIdImageUrl },
    { label: t('admin.docLicense'), url: driver.licenseImageUrl },
    { label: t('admin.docVehicleLicense'), url: driver.vehicleLicenseImageUrl },
    { label: t('admin.docVehicleImage'), url: driver.vehicleImageUrl },
    { label: t('admin.docSelfie'), url: driver.selfieVerificationUrl },
  ]

  return (
    <div className="mb-3 rounded-2xl border border-border bg-card p-4">
      <button onClick={() => setExpanded((v) => !v)} className="flex w-full items-center justify-between text-right">
        <div>
          <div className="flex items-center gap-2">
            {user?.profileImageUrl && <img src={user.profileImageUrl} alt="" className="h-9 w-9 rounded-full object-cover" />}
            <div><p className="font-semibold text-text-primary">{user?.fullName ?? driver.uid}</p><p className="text-xs text-text-secondary">{approved ? 'سائق معتمد' : 'بانتظار المراجعة'}</p></div>
          </div>
          <p className="text-sm text-text-secondary">
            {driver.vehicleMake} {driver.vehicleModel}
          </p>
        </div>
        <span>{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <>
          <div className="mt-4 grid gap-2 rounded-xl border border-border bg-bg/40 p-3 text-sm sm:grid-cols-2">
            <p><span className="text-text-secondary">الهاتف: </span><span dir="ltr">{user?.phone || 'غير مسجل'}</span></p>
            <p><span className="text-text-secondary">البريد: </span>{user?.email || 'غير مسجل'}</p>
            <p><span className="text-text-secondary">حالة الحساب: </span>{user?.status === 'active' ? 'نشط' : user?.status || '—'}</p>
            <p><span className="text-text-secondary">التقييم: </span>{user?.avgRating ? `⭐ ${user.avgRating.toFixed(1)}` : 'جديد'}</p>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {docs.map((d) => (
              <div key={d.label}>
                {d.url ? (
                  <a href={d.url} target="_blank" rel="noreferrer" title="فتح الصورة بالحجم الكامل"><img src={d.url} alt={d.label} className="h-24 w-full rounded-lg object-cover transition hover:opacity-80" /></a>
                ) : (
                  <div className="flex h-24 items-center justify-center rounded-lg bg-bg text-text-secondary">{t('admin.notAvailable')}</div>
                )}
                <p className="mt-1 text-center text-xs text-text-secondary">{d.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-3">
            {approved ? (
              <><Button variant="danger" onClick={handleReject} loading={loading}>إلغاء الاعتماد</Button><Button variant="secondary" onClick={handleReturnToReview} loading={loading}>إعادة للمراجعة</Button></>
            ) : (
              <><Button variant="danger" onClick={handleReject} loading={loading}>{t('admin.reject')}</Button><Button variant="success" onClick={handleApprove} loading={loading}>{t('admin.approve')}</Button></>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default function AdminDriverQueuePage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [drivers, setDrivers] = useState<PendingDriver[]>([])
  const [approvedDrivers, setApprovedDrivers] = useState<PendingDriver[]>([])
  const [tab, setTab] = useState<'pending' | 'approved'>('pending')

  useEffect(() => subscribePendingDrivers(setDrivers), [])
  useEffect(() => subscribeApprovedDrivers(setApprovedDrivers), [])

  return (
    <div className="min-h-screen bg-bg">
      <header className="flex items-center gap-3 border-b border-border bg-card px-4 py-4">
        <button onClick={() => navigate(-1)} className="text-xl">
          ←
        </button>
        <h1 className="text-lg font-bold text-text-primary">{t('admin.driverQueueTitle')}</h1>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        <div className="mb-5 flex rounded-2xl border border-border bg-card p-1.5">
          <button onClick={() => setTab('pending')} className={`flex-1 rounded-xl px-3 py-3 text-sm font-bold ${tab === 'pending' ? 'bg-primary text-white' : 'text-text-secondary'}`}>قيد المراجعة ({drivers.length})</button>
          <button onClick={() => setTab('approved')} className={`flex-1 rounded-xl px-3 py-3 text-sm font-bold ${tab === 'approved' ? 'bg-success text-white' : 'text-text-secondary'}`}>السائقون المعتمدون ({approvedDrivers.length})</button>
        </div>
        {tab === 'pending' && drivers.length === 0 && <p className="py-12 text-center text-text-secondary">{t('admin.noPendingDrivers')}</p>}
        {tab === 'approved' && approvedDrivers.length === 0 && <p className="py-12 text-center text-text-secondary">لا يوجد سائقون معتمدون حاليًا</p>}
        {(tab === 'pending' ? drivers : approvedDrivers).map((d) => (
          <DriverRow key={d.uid} driver={d} approved={tab === 'approved'} />
        ))}
      </main>
    </div>
  )
}
