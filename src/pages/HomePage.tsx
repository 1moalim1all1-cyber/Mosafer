import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Button } from '../components/ui/Button'
import { BottomNav } from '../components/BottomNav'
import { TripCard } from '../components/TripCard'
import { useAuth } from '../contexts/AuthContext'
import { subscribeUnreadCount } from '../lib/notifications'
import { subscribeAvailableTrips, subscribeCompletedTripsCount } from '../lib/trips'
import type { Trip } from '../types/trip'
import { Animated3DCar } from '../components/Animated3DCar'
import { Users2, Bell } from 'lucide-react'

const GOVERNORATES = [
  'القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'البحر الأحمر', 'البحيرة',
  'الفيوم', 'الغربية', 'الإسماعيلية', 'المنوفية', 'المنيا', 'القليوبية',
  'الوادي الجديد', 'السويس', 'أسوان', 'أسيوط', 'بني سويف', 'بورسعيد',
  'دمياط', 'الشرقية', 'جنوب سيناء', 'كفر الشيخ', 'مطروح', 'الأقصر',
  'قنا', 'شمال سيناء', 'سوهاج',
]

export default function HomePage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [seats, setSeats] = useState(1)
  const [unread, setUnread] = useState(0)
  const [availableTrips, setAvailableTrips] = useState<Trip[]>([])
  const [tripsLoading, setTripsLoading] = useState(true)
  const [completedCount, setCompletedCount] = useState(0)

  useEffect(() => {
    return subscribeCompletedTripsCount(setCompletedCount)
  }, [])

  useEffect(() => {
    if (!user) return
    return subscribeUnreadCount(user.uid, setUnread)
  }, [user])

  useEffect(() => {
    if (!user) return
    setTripsLoading(true)
    const unsubscribe = subscribeAvailableTrips(user.gender, (trips) => {
      setAvailableTrips(trips)
      setTripsLoading(false)
    })
    return unsubscribe
  }, [user])

  function handleSearch() {
    if (!origin || !destination) return
    navigate(`/search?from=${encodeURIComponent(origin)}&to=${encodeURIComponent(destination)}&seats=${seats}`)
  }

  return (
    <div className="min-h-screen bg-bg">
      <header className="flex items-center justify-between border-b border-border bg-white px-4 py-4">
        <div className="flex items-center gap-2">
          <img src="/Mosafer/logo.jpeg" alt="مسافر" className="h-11 w-11 rounded-2xl object-cover shadow-md" />
          <h1 className="text-xl font-bold text-primary">مسافر</h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/notifications')} className="relative">
            <Bell size={22} className="text-text-secondary" />
            {unread > 0 && (
              <span className="absolute -left-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] text-white">
                {unread}
              </span>
            )}
          </button>
          <span className="text-sm text-text-secondary">{user?.fullName}</span>
          <button onClick={() => logout()} className="text-sm font-semibold text-danger">
            خروج
          </button>
        </div>
      </header>

      <div className="bg-gradient-to-br from-primary to-secondary px-4 pb-10 pt-6 text-white">
        <div className="mx-auto max-w-lg">
          <h2 className="mb-1 text-2xl font-bold">فين رايح؟</h2>
          <p className="text-sm text-white/70">شارك رحلتك مع آلاف الركاب والسائقين في مصر</p>
          {completedCount >= 5 && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 backdrop-blur-sm">
              <Users2 size={16} />
              <span className="text-sm font-semibold">أكتر من {completedCount} رحلة اتعملت على مسافر</span>
            </div>
          )}
        </div>
      </div>

      <main className="mx-auto max-w-lg px-4 pb-24 pt-6">
        <div className="-mt-14 mb-8">

        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.08)]">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-text-primary">من</label>
            <select
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="w-full rounded-xl border-2 border-border bg-white px-4 py-3 text-base focus:border-primary focus:outline-none"
            >
              <option value="">اختار المحافظة</option>
              {GOVERNORATES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-text-primary">إلى</label>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full rounded-xl border-2 border-border bg-white px-4 py-3 text-base focus:border-primary focus:outline-none"
            >
              <option value="">اختار المحافظة</option>
              {GOVERNORATES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-text-primary">عدد الركاب</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSeats((s) => Math.max(1, s - 1))}
                className="h-8 w-8 rounded-full border border-border text-lg"
              >
                −
              </button>
              <span className="w-4 text-center font-semibold">{seats}</span>
              <button
                onClick={() => setSeats((s) => Math.min(8, s + 1))}
                className="h-8 w-8 rounded-full border border-border text-lg"
              >
                +
              </button>
            </div>
          </div>

          <Button onClick={handleSearch} disabled={!origin || !destination}>
            ابحث عن رحلة
          </Button>
        </div>
        </div>

        <h2 className="mb-4 mt-8 text-xl font-bold text-text-primary">رحلات متاحة دلوقتي</h2>

        {tripsLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 animate-pulse rounded-2xl bg-white" />
            ))}
          </div>
        )}

        {!tripsLoading && availableTrips.length === 0 && (
          <div className="flex flex-col items-center py-6">
            <Animated3DCar size={110} />
            <p className="mt-2 text-text-secondary">مفيش رحلات متاحة دلوقتي، جرّب تاني بعد شوية</p>
          </div>
        )}

        {!tripsLoading && availableTrips.map((trip) => <TripCard key={trip.id} trip={trip} />)}
      </main>
      <BottomNav />
    </div>
  )
}
