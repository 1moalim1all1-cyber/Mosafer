import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { subscribeTripBookings, respondToBooking, markTripCompleted } from '../lib/driverActions'
import { fetchUserProfile } from '../lib/users'
import { useAuth } from '../contexts/AuthContext'
import type { AppUser } from '../types/user'
import { Button } from '../components/ui/Button'
import { RatingModal } from '../components/RatingModal'

interface BookingRow {
  id: string
  tripId: string
  passengerId: string
  seatsBooked: number
  status: string
  totalPrice: number
}

function BookingCard({ booking, onRate }: { booking: BookingRow; onRate: () => void }) {
  const [passenger, setPassenger] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchUserProfile(booking.passengerId).then(setPassenger)
  }, [booking.passengerId])

  async function respond(accept: boolean) {
    setLoading(true)
    try {
      await respondToBooking(booking.id, accept)
    } finally {
      setLoading(false)
    }
  }

  const statusLabels: Record<string, { label: string; color: string }> = {
    pending: { label: 'بانتظار ردك', color: 'text-warning' },
    confirmed: { label: 'مؤكد', color: 'text-success' },
    rejected: { label: 'مرفوض', color: 'text-danger' },
    completed: { label: 'منتهي', color: 'text-primary' },
    cancelled: { label: 'ملغي', color: 'text-danger' },
  }

  return (
    <div className="mb-3 rounded-2xl border border-border bg-white p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-semibold text-text-primary">{passenger?.fullName ?? 'راكب'}</span>
        <span className={`text-sm font-semibold ${statusLabels[booking.status]?.color}`}>
          {statusLabels[booking.status]?.label}
        </span>
      </div>
      <p className="mb-3 text-sm text-text-secondary">
        {booking.seatsBooked} مقاعد · {booking.totalPrice.toFixed(0)} ج.م
      </p>
      {booking.status === 'pending' && (
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => respond(false)} loading={loading}>
            رفض
          </Button>
          <Button onClick={() => respond(true)} loading={loading}>
            قبول
          </Button>
        </div>
      )}
      {booking.status === 'completed' && (
        <button onClick={onRate} className="text-sm font-semibold text-warning">
          ⭐ قيّم الراكب
        </button>
      )}
    </div>
  )
}

export default function DriverTripBookingsPage() {
  const { tripId } = useParams<{ tripId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [bookings, setBookings] = useState<BookingRow[]>([])
  const [completing, setCompleting] = useState(false)
  const [ratingBooking, setRatingBooking] = useState<BookingRow | null>(null)

  useEffect(() => {
    if (!tripId) return
    return subscribeTripBookings(tripId, (rows) => setBookings(rows as BookingRow[]))
  }, [tripId])

  async function handleComplete() {
    if (!tripId) return
    if (!confirm('هيتم تحويل أرباح الحجوزات المدفوعة بالمحفظة لرصيدك بعد خصم عمولة المنصة. متأكد إن الرحلة خلصت فعلاً؟')) return
    setCompleting(true)
    try {
      await markTripCompleted(tripId)
      navigate('/driver')
    } catch {
      alert('حصل خطأ، حاول تاني')
    } finally {
      setCompleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg">
      <header className="flex items-center justify-between border-b border-border bg-white px-4 py-4">
        <h1 className="text-lg font-bold text-text-primary">طلبات الحجز</h1>
        <button onClick={handleComplete} disabled={completing} className="text-sm font-semibold text-primary">
          إنهاء الرحلة
        </button>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6">
        {bookings.length === 0 && <p className="py-12 text-center text-text-secondary">لسه مفيش حجوزات على الرحلة دي</p>}
        {bookings.map((b) => (
          <BookingCard key={b.id} booking={b} onRate={() => setRatingBooking(b)} />
        ))}
      </main>

      {ratingBooking && user && (
        <RatingModal
          tripId={ratingBooking.tripId}
          bookingId={ratingBooking.id}
          fromUserId={user.uid}
          toUserId={ratingBooking.passengerId}
          direction="driverToPassenger"
          otherPartyName="الراكب"
          onClose={() => setRatingBooking(null)}
        />
      )}
    </div>
  )
}
