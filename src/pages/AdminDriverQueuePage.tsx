import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { subscribePendingDrivers, approveDriver, rejectDriver, type PendingDriver } from '../lib/admin'
import { fetchUserProfile } from '../lib/users'
import type { AppUser } from '../types/user'
import { Button } from '../components/ui/Button'

function DriverRow({ driver }: { driver: PendingDriver }) {
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
      alert(err instanceof Error ? err.message : 'حصل خطأ')
    } finally {
      setLoading(false)
    }
  }

  async function handleReject() {
    const reason = prompt('سبب الرفض:')
    if (!reason) return
    setLoading(true)
    try {
      await rejectDriver(driver.uid, reason)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'حصل خطأ')
    } finally {
      setLoading(false)
    }
  }

  const docs = [
    { label: 'بطاقة الرقم القومي', url: driver.nationalIdImageUrl },
    { label: 'رخصة القيادة', url: driver.licenseImageUrl },
    { label: 'رخصة السيارة', url: driver.vehicleLicenseImageUrl },
    { label: 'صورة السيارة', url: driver.vehicleImageUrl },
    { label: 'التحقق الشخصي', url: driver.selfieVerificationUrl },
  ]

  return (
    <div className="mb-3 rounded-2xl border border-border bg-card p-4">
      <button onClick={() => setExpanded((v) => !v)} className="flex w-full items-center justify-between text-right">
        <div>
          <p className="font-semibold text-text-primary">{user?.fullName ?? driver.uid}</p>
          <p className="text-sm text-text-secondary">
            {driver.vehicleMake} {driver.vehicleModel}
          </p>
        </div>
        <span>{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {docs.map((d) => (
              <div key={d.label}>
                {d.url ? (
                  <img src={d.url} alt={d.label} className="h-24 w-full rounded-lg object-cover" />
                ) : (
                  <div className="flex h-24 items-center justify-center rounded-lg bg-bg text-text-secondary">لا يوجد</div>
                )}
                <p className="mt-1 text-center text-xs text-text-secondary">{d.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-3">
            <Button variant="danger" onClick={handleReject} loading={loading}>
              رفض
            </Button>
            <Button variant="success" onClick={handleApprove} loading={loading}>
              اعتماد
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

export default function AdminDriverQueuePage() {
  const navigate = useNavigate()
  const [drivers, setDrivers] = useState<PendingDriver[]>([])

  useEffect(() => subscribePendingDrivers(setDrivers), [])

  return (
    <div className="min-h-screen bg-bg">
      <header className="flex items-center gap-3 border-b border-border bg-card px-4 py-4">
        <button onClick={() => navigate(-1)} className="text-xl">
          ←
        </button>
        <h1 className="text-lg font-bold text-text-primary">مراجعة السائقين</h1>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6">
        {drivers.length === 0 && <p className="py-12 text-center text-text-secondary">مفيش سائقين بانتظار المراجعة دلوقتي</p>}
        {drivers.map((d) => (
          <DriverRow key={d.uid} driver={d} />
        ))}
      </main>
    </div>
  )
}
