import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { subscribeToTrip } from '../lib/trips'
import { fetchUserProfile } from '../lib/users'
import { createBooking } from '../lib/booking'
import { getOrCreateChat } from '../lib/chat'
import { subscribeFavorites, toggleFavorite } from '../lib/favorites'
import type { Trip } from '../types/trip'
import type { AppUser } from '../types/user'
import type { PaymentMethod } from '../types/booking'
import { Button } from '../components/ui/Button'
import { useAuth } from '../contexts/AuthContext'

export default function TripDetailsPage() {
  const { tripId } = useParams<{ tripId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [trip, setTrip] = useState<Trip | null | undefined>(undefined)
  const [driver, setDriver] = useState<AppUser | null>(null)
  const [seats, setSeats] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [openingChat, setOpeningChat] = useState(false)
  const [favorites, setFavorites] = useState<string[]>([])

  useEffect(() => {
    if (!user) return
    return subscribeFavorites(user.uid, setFavorites)
  }, [user])

  const isFavorite = trip ? favorites.includes(trip.id) : false

  async function openChat() {
    if (!trip || !user) return
    setOpeningChat(true)
    try {
      const chatId = await getOrCreateChat(user.uid, trip.driverId)
      navigate(`/chat/${chatId}`)
    } finally {
      setOpeningChat(false)
    }
  }

  useEffect(() => {
    if (!tripId) return
    const unsubscribe = subscribeToTrip(tripId, (t) => {
      setTrip(t)
      if (t) fetchUserProfile(t.driverId).then(setDriver)
    })
    return unsubscribe
  }, [tripId])

  async function handleBook() {
    if (!trip || !user) return
    setLoading(true)
    setError(null)
    try {
      await createBooking({ tripId: trip.id, seatsBooked: seats, paymentMethod })
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حصل خطأ، حاول تاني')
    } finally {
      setLoading(false)
    }
  }

  if (trip === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (trip === null) {
    return (
      <div className="flex min-h-screen items-center justify-center text-text-secondary">
        الرحلة دي مش موجودة
      </div>
    )
  }

  const timeFormat = new Intl.DateTimeFormat('ar-EG', { hour: '2-digit', minute: '2-digit', weekday: 'long', day: 'numeric', month: 'long' })
  const total = trip.pricePerSeat * seats

  if (success) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="text-5xl">🎉</div>
        <h1 className="text-2xl font-bold text-text-primary">تم الحجز بنجاح</h1>
        <p className="text-text-secondary">حجزك بانتظار موافقة السائق، هتوصلك إشعار فور ما يتم التأكيد</p>
        <Button onClick={() => navigate('/')} fullWidth={false}>
          الرجوع للرئيسية
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg pb-24">
      <header className="flex items-center gap-3 border-b border-border bg-white px-4 py-4">
        <button onClick={() => navigate(-1)} className="text-xl">
          ←
        </button>
        <h1 className="text-lg font-bold text-text-primary">تفاصيل الرحلة</h1>
        <div className="mr-auto flex items-center gap-3">
          {trip && user && (
            <button onClick={() => toggleFavorite(user.uid, trip.id, isFavorite)} className="text-xl">
              {isFavorite ? '❤️' : '🤍'}
            </button>
          )}
          <button onClick={openChat} disabled={openingChat} className="text-xl">
            💬
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6">
        {trip.isWomenOnly && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-pink-50 p-3 text-pink-700">
            👩 <span>رحلة سيدات فقط</span>
          </div>
        )}

        {driver && (
          <div className="mb-4 flex items-center gap-3 rounded-2xl border border-border bg-white p-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-light text-2xl">
              {driver.profileImageUrl ? (
                <img src={driver.profileImageUrl} className="h-14 w-14 rounded-full object-cover" alt="" />
              ) : (
                '🧑'
              )}
            </div>
            <div>
              <p className="text-lg font-semibold text-text-primary">{driver.fullName}</p>
              <p className="text-sm text-text-secondary">
                ⭐ {driver.avgRating.toFixed(1)} · {driver.totalTrips} رحلة
              </p>
            </div>
          </div>
        )}

        <h2 className="mb-1 text-xl font-bold text-text-primary">
          {trip.originCity} → {trip.destinationCity}
        </h2>
        <p className="mb-4 text-text-secondary">{timeFormat.format(trip.departureTime)}</p>

        <div className="mb-4 flex flex-col gap-2 text-text-secondary">
          <span>💺 {trip.availableSeats} مقاعد متاحة</span>
          <span>🚗 {trip.carType}</span>
          <span>⏱️ {trip.estimatedDurationMinutes} دقيقة تقريبًا</span>
        </div>

        <hr className="my-4 border-border" />

        <div className="mb-4 flex items-center justify-between">
          <span className="font-semibold text-text-primary">عدد المقاعد</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSeats((s) => Math.max(1, s - 1))}
              className="h-8 w-8 rounded-full border border-border"
            >
              −
            </button>
            <span className="w-4 text-center font-semibold">{seats}</span>
            <button
              onClick={() => setSeats((s) => Math.min(trip.availableSeats, s + 1))}
              className="h-8 w-8 rounded-full border border-border"
            >
              +
            </button>
          </div>
        </div>

        <div className="mb-4">
          <p className="mb-2 font-semibold text-text-primary">طريقة الدفع</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setPaymentMethod('cash')}
              className={`rounded-xl border-2 py-3 font-semibold ${
                paymentMethod === 'cash' ? 'border-primary bg-primary-light text-primary' : 'border-border text-text-secondary'
              }`}
            >
              💵 نقدي
            </button>
            <button
              onClick={() => setPaymentMethod('wallet')}
              className={`rounded-xl border-2 py-3 font-semibold ${
                paymentMethod === 'wallet' ? 'border-primary bg-primary-light text-primary' : 'border-border text-text-secondary'
              }`}
            >
              👛 المحفظة
            </button>
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between rounded-xl bg-white p-4">
          <span className="font-semibold text-text-primary">الإجمالي</span>
          <span className="text-xl font-bold text-primary">{total.toFixed(0)} ج.م</span>
        </div>

        {error && <p className="mb-4 text-sm text-danger">{error}</p>}

        <Button onClick={handleBook} loading={loading} disabled={trip.availableSeats < 1}>
          احجز الآن
        </Button>
      </main>
    </div>
  )
}
