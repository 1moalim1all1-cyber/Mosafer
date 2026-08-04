import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { subscribePassengerBookings } from '../lib/bookings'
import { cancelBooking } from '../lib/booking'
import { hasRated } from '../lib/ratings'
import type { Booking } from '../types/booking'
import { Button } from '../components/ui/Button'
import { BottomNav } from '../components/BottomNav'
import { RatingModal } from '../components/RatingModal'

const STATUS_LABELS: Record<Booking['status'], { label: string; color: string }> = {
  pending: { label: 'بانتظار الرد', color: 'text-warning' },
  confirmed: { label: 'مؤكد', color: 'text-success' },
  rejected: { label: 'مرفوض', color: 'text-danger' },
  cancelled: { label: 'ملغي', color: 'text-danger' },
  completed: { label: 'منتهي', color: 'text-primary' },
}

export default function MyBookingsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [ratingBooking, setRatingBooking] = useState<Booking | null>(null)

  useEffect(() => {
    if (!user) return
    return subscribePassengerBookings(user.uid, setBookings)
  }, [user])

  async function openRating(booking: Booking) {
    if (!user) return
    const already = await hasRated(booking.id, user.uid)
    if (already) {
      alert('قيّمت الرحلة دي بالفعل')
      return
    }
    setRatingBooking(booking)
  }

  async function handleCancel(id: string) {
    if (!confirm('هتتفقد المقعد ده، وهترجعلك فلوسك لو كنت دفعت بالمحفظة')) return
    setCancellingId(id)
    try {
      await cancelBooking(id)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'حصل خطأ')
    } finally {
      setCancellingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-bg pb-24">
      <header className="border-b border-border bg-white px-4 py-4">
        <h1 className="text-lg font-bold text-text-primary">رحلاتي</h1>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6">
        {bookings.length === 0 && (
          <div className="py-12 text-center">
            <p className="mb-4 text-text-secondary">لسه معملتش أي حجز</p>
            <Button onClick={() => navigate('/')} fullWidth={false}>
              ابحث عن رحلة
            </Button>
          </div>
        )}

        {bookings.map((b) => (
          <div key={b.id} className="mb-3 rounded-2xl border border-border bg-white p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-text-secondary">{new Intl.DateTimeFormat('ar-EG').format(b.createdAt)}</span>
              <span className={`text-sm font-semibold ${STATUS_LABELS[b.status].color}`}>
                {STATUS_LABELS[b.status].label}
              </span>
            </div>
            <p className="mb-3 text-text-primary">
              {b.seatsBooked} مقاعد · {b.totalPrice.toFixed(0)} ج.م
            </p>
            <div className="flex items-center gap-3">
              {(b.status === 'pending' || b.status === 'confirmed') && (
                <button
                  onClick={() => handleCancel(b.id)}
                  disabled={cancellingId === b.id}
                  className="text-sm font-semibold text-danger"
                >
                  إلغاء الحجز
                </button>
              )}
              {b.status === 'completed' && (
                <button onClick={() => openRating(b)} className="text-sm font-semibold text-warning">
                  ⭐ قيّم السائق
                </button>
              )}
              <button onClick={() => navigate(`/trip/${b.tripId}`)} className="text-sm font-semibold text-primary">
                تفاصيل الرحلة
              </button>
            </div>
          </div>
        ))}
      </main>
      <BottomNav />

      {ratingBooking && user && (
        <RatingModal
          tripId={ratingBooking.tripId}
          bookingId={ratingBooking.id}
          fromUserId={user.uid}
          toUserId={ratingBooking.driverId}
          direction="passengerToDriver"
          otherPartyName="السائق"
          onClose={() => setRatingBooking(null)}
        />
      )}
    </div>
  )
}
