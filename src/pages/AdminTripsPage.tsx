import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Trash2 } from 'lucide-react'
import { subscribeAllTrips, deleteTrip, type ManagedTrip } from '../lib/admin'

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: 'قيد المراجعة', color: 'text-warning' },
  active: { label: 'نشطة', color: 'text-success' },
  full: { label: 'مكتملة المقاعد', color: 'text-primary' },
  completed: { label: 'منتهية', color: 'text-text-secondary' },
  cancelled: { label: 'ملغاة', color: 'text-danger' },
  expired: { label: 'انتهى موعدها', color: 'text-text-secondary' },
}

export default function AdminTripsPage() {
  const navigate = useNavigate()
  const [trips, setTrips] = useState<ManagedTrip[]>([])
  const [search, setSearch] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)

  useEffect(() => subscribeAllTrips(setTrips), [])

  const filtered = useMemo(() => {
    if (!search.trim()) return trips
    return trips.filter((t) => t.originCity.includes(search.trim()) || t.destinationCity.includes(search.trim()))
  }, [trips, search])

  async function handleDelete(trip: ManagedTrip) {
    if (!confirm(`متأكد إنك عايز تحذف الرحلة ${trip.originCity} → ${trip.destinationCity}؟ الإجراء ده نهائي.`)) return
    setBusyId(trip.id)
    try {
      await deleteTrip(trip.id)
    } catch {
      alert('حصل خطأ أثناء الحذف، حاول تاني')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="min-h-screen bg-bg">
      <header className="flex items-center gap-3 border-b border-border bg-card px-4 py-4">
        <button onClick={() => navigate(-1)} className="text-xl">
          ←
        </button>
        <h1 className="text-lg font-bold text-text-primary">إدارة الرحلات</h1>
      </header>

      <div className="sticky top-0 z-10 border-b border-border bg-card px-4 py-3">
        <div className="flex items-center gap-2 rounded-xl border-2 border-border px-3 py-2">
          <Search size={18} className="text-text-secondary" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="دوّر باسم المحافظة (من أو إلى)"
            className="flex-1 bg-transparent outline-none"
          />
        </div>
      </div>

      <main className="mx-auto max-w-lg px-4 py-6">
        <p className="mb-3 text-sm text-text-secondary">{filtered.length} رحلة</p>

        {filtered.length === 0 && <p className="py-12 text-center text-text-secondary">مفيش رحلات مطابقة</p>}

        {filtered.map((trip) => (
          <div key={trip.id} className="mb-3 rounded-2xl border border-border bg-card p-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="font-semibold text-text-primary">
                {trip.originCity} → {trip.destinationCity}
              </p>
              <span className={`text-sm font-semibold ${STATUS_CONFIG[trip.status]?.color ?? 'text-text-secondary'}`}>
                {STATUS_CONFIG[trip.status]?.label ?? trip.status}
              </span>
            </div>
            <p className="mb-3 text-sm text-text-secondary">
              {new Intl.DateTimeFormat('ar-EG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(
                trip.departureTime,
              )}{' '}
              · {trip.availableSeats}/{trip.totalSeats} مقاعد · {trip.pricePerSeat.toFixed(0)} ج.م
            </p>
            <button
              onClick={() => handleDelete(trip)}
              disabled={busyId === trip.id}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-danger/40 py-2 text-sm font-semibold text-danger disabled:opacity-40"
            >
              <Trash2 size={14} /> حذف الرحلة
            </button>
          </div>
        ))}
      </main>
    </div>
  )
}
