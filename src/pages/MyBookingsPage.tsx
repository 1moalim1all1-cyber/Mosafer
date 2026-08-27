import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/useAuth'
import { subscribePassengerBookings } from '../lib/bookings'
import { cancelBooking } from '../lib/booking'
import { hasRated } from '../lib/ratings'
import type { Booking } from '../types/booking'
import { Button } from '../components/ui/Button'
import { BottomNav } from '../components/BottomNav'
import { RatingModal } from '../components/RatingModal'

function getStatusLabels(t: (key: string) => string): Record<Booking['status'], { label: string; color: string }> {
  return {
    pending: { label: t('bookings.pending'), color: 'text-warning' },
    confirmed: { label: t('bookings.confirmed'), color: 'text-success' },
    rejected: { label: t('bookings.rejected'), color: 'text-danger' },
    cancelled: { label: t('bookings.cancelled'), color: 'text-danger' },
    completed: { label: t('bookings.completed'), color: 'text-primary' },
  }
}

export default function MyBookingsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const STATUS_LABELS = getStatusLabels(t)
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
      <header className="border-b border-border bg-card px-4 py-4">
        <h1 className="text-lg font-bold text-text-primary">{t('bookings.title')}</h1>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6">
        {bookings.length === 0 && (
          <div className="py-12 text-center">
            <p className="mb-4 text-text-secondary">{t('bookings.noBookingsYet2')}</p>
            <Button onClick={() => navigate('/')} fullWidth={false}>
              ابحث عن رحلة
            </Button>
          </div>
        )}

        {bookings.map((b) => (
          <div key={b.id} className="mb-3 rounded-2xl border border-border bg-card p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-text-secondary">{new Intl.DateTimeFormat('ar-EG').format(b.createdAt)}</span>
              <span className={`text-sm font-semibold ${STATUS_LABELS[b.status].color}`}>
                {STATUS_LABELS[b.status].label}
              </span>
            </div>
            <p className="mb-3 text-text-primary">
              {b.seatsBooked} {t('bookings.seatsCount')} · {b.totalPrice.toFixed(0)} {t('common.currency')}
            </p>
            {b.status === 'confirmed' && b.startPin && !b.pinVerified && (
              <div className="mb-3 rounded-xl bg-primary-light p-3 text-center">
                <p className="mb-1 text-xs text-text-secondary">{t('bookings.sayThisCode')}</p>
                <p dir="ltr" className="text-2xl font-bold tracking-[0.3em] text-primary">
                  {b.startPin}
                </p>
              </div>
            )}
            <div className="flex items-center gap-3">
              {(b.status === 'pending' || b.status === 'confirmed') && (
                <button
                  onClick={() => handleCancel(b.id)}
                  disabled={cancellingId === b.id}
                  className="text-sm font-semibold text-danger"
                >
                  {t('bookings.cancelBooking')}
                </button>
              )}
              {b.status === 'confirmed' && (
                <button
                  onClick={() => navigate(`/track/${b.id}`)}
                  className="text-sm font-semibold text-success"
                >
                  🚗 {t('bookings.trackDriver')}
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
