import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { collection, onSnapshot } from 'firebase/firestore'
import { Search } from 'lucide-react'
import { db } from '../lib/firebase'
import type { Booking, BookingStatus } from '../types/booking'

const STATUS_LABELS: Record<BookingStatus, { label: string; color: string }> = {
  pending: { label: 'قيد الانتظار', color: 'text-warning' },
  confirmed: { label: 'مؤكد', color: 'text-success' },
  rejected: { label: 'مرفوض', color: 'text-danger' },
  cancelled: { label: 'ملغي', color: 'text-danger' },
  completed: { label: 'مكتمل', color: 'text-primary' },
}

export default function AdminBookingsPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const statusFilter = searchParams.get('status') ?? 'all'

  useEffect(() => {
    return onSnapshot(collection(db, 'bookings'), (snap) => {
      const rows = snap.docs.map((d) => {
        const data = d.data()
        const created = data.createdAt as { toDate?: () => Date } | undefined
        return {
          id: d.id,
          tripId: data.tripId ?? '',
          passengerId: data.passengerId ?? '',
          driverId: data.driverId ?? '',
          seatsBooked: data.seatsBooked ?? 0,
          status: (data.status ?? 'pending') as BookingStatus,
          totalPrice: data.totalPrice ?? 0,
          paymentMethod: data.paymentMethod ?? 'cash',
          paymentStatus: data.paymentStatus ?? 'pending',
          pickupLat: data.pickupLat ?? null,
          pickupLng: data.pickupLng ?? null,
          passengerLiveLat: data.passengerLiveLat ?? null,
          passengerLiveLng: data.passengerLiveLng ?? null,
          passengerLiveUpdatedAt: null,
          startPin: data.startPin ?? null,
          pinVerified: data.pinVerified ?? false,
          createdAt: created?.toDate ? created.toDate() : new Date(),
        } as Booking
      })
      rows.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      setBookings(rows)
      setLoading(false)
    })
  }, [])

  const filtered = useMemo(() => {
    let result = bookings
    if (statusFilter !== 'all') result = result.filter((b) => b.status === statusFilter)
    const q = search.trim().toLowerCase()
    if (!q) return result
    return result.filter((b) => b.id.toLowerCase().includes(q) || b.tripId.toLowerCase().includes(q) || b.passengerId.toLowerCase().includes(q) || b.driverId.toLowerCase().includes(q))
  }, [bookings, search, statusFilter])

  function setStatus(status: string) {
    if (status === 'all') setSearchParams({})
    else setSearchParams({ status })
  }

  return (
    <div className="min-h-screen bg-bg">
      <header className="flex items-center gap-3 border-b border-border bg-card px-4 py-4">
        <button onClick={() => navigate(-1)} className="text-xl">←</button>
        <div>
          <h1 className="text-lg font-bold text-text-primary">إدارة الحجوزات</h1>
          {statusFilter === 'confirmed' && <p className="text-xs text-success">عرض الحجوزات المؤكدة فقط</p>}
        </div>
      </header>

      <div className="sticky top-0 z-10 border-b border-border bg-card px-4 py-3">
        <div className="mx-auto mb-3 flex w-full max-w-7xl gap-2 overflow-x-auto">
          {[
            ['all', 'كل الحجوزات'],
            ['confirmed', 'المؤكدة'],
            ['pending', 'قيد الانتظار'],
            ['completed', 'المكتملة'],
            ['cancelled', 'الملغية'],
            ['rejected', 'المرفوضة'],
          ].map(([value, label]) => (
            <button key={value} onClick={() => setStatus(value)} className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold ${statusFilter === value ? 'border-primary bg-primary-light text-primary' : 'border-border text-text-secondary'}`}>
              {label}
            </button>
          ))}
        </div>
        <div className="mx-auto flex w-full max-w-7xl items-center gap-2 rounded-xl border-2 border-border px-3 py-2">
          <Search size={18} className="text-text-secondary" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث برقم الحجز أو الرحلة أو المستخدم" className="flex-1 bg-transparent outline-none" />
        </div>
      </div>

      <main className="mx-auto w-full max-w-7xl px-4 py-6">
        <p className="mb-3 text-sm text-text-secondary">{filtered.length} حجز</p>
        {loading && <p className="py-12 text-center text-text-secondary">جاري تحميل الحجوزات...</p>}
        {!loading && filtered.length === 0 && <p className="py-12 text-center text-text-secondary">لا توجد حجوزات مطابقة للفلتر الحالي</p>}
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {filtered.map((booking) => (
            <div key={booking.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className={`text-sm font-bold ${STATUS_LABELS[booking.status]?.color ?? 'text-text-secondary'}`}>{STATUS_LABELS[booking.status]?.label ?? booking.status}</span>
                <span className="text-xs text-text-secondary">{new Intl.DateTimeFormat('ar-EG').format(booking.createdAt)}</span>
              </div>
              <p className="mb-1 text-sm text-text-primary"><span className="text-text-secondary">رقم الحجز:</span> {booking.id}</p>
              <p className="mb-1 text-sm text-text-primary"><span className="text-text-secondary">الرحلة:</span> {booking.tripId}</p>
              <p className="mb-1 text-sm text-text-primary"><span className="text-text-secondary">المقاعد:</span> {booking.seatsBooked}</p>
              <p className="mb-3 text-sm font-semibold text-text-primary">{booking.totalPrice.toFixed(0)} ج.م · {booking.paymentMethod}</p>
              <button onClick={() => navigate(`/trip/${booking.tripId}`)} className="w-full rounded-xl border border-primary/40 py-2 text-sm font-semibold text-primary">فتح تفاصيل الرحلة</button>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
