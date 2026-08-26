import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import confetti from 'canvas-confetti'
import { collection, query, where, limit, getDocs, Timestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { subscribeToTrip } from '../lib/trips'
import { fetchUserProfile } from '../lib/users'
import { createBooking } from '../lib/booking'
import { getOrCreateChat } from '../lib/chat'
import { subscribeFavorites, toggleFavorite } from '../lib/favorites'
import { TripRouteMap } from '../components/TripRouteMap'
import { LocationPicker } from '../components/LocationPicker'
import type { Trip } from '../types/trip'
import type { AppUser } from '../types/user'
import type { PaymentMethod } from '../types/booking'
import { Button } from '../components/ui/Button'
import { useAuth } from '../contexts/useAuth'

export default function TripDetailsPage() {
  const { tripId } = useParams<{ tripId: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
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
  const [couponCode, setCouponCode] = useState('')
  const [couponMessage, setCouponMessage] = useState<string | null>(null)
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [pickupPoint, setPickupPoint] = useState<{ lat: number; lng: number } | null>(null)
  const [pickingLocation, setPickingLocation] = useState(false)
  const [confirmedBookingId, setConfirmedBookingId] = useState<string | null>(null)

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

  async function applyCoupon() {
    if (!trip || !couponCode.trim()) return
    const code = couponCode.trim().toUpperCase()
    setCouponMessage(null)
    setCouponDiscount(0)

    try {
      const q = query(collection(db, 'coupons'), where('code', '==', code), limit(1))
      const snap = await getDocs(q)
      if (snap.empty) {
        setCouponMessage(t('tripDetails.couponNotFound'))
        return
      }
      const coupon = snap.docs[0].data()
      const isActive = coupon.isActive === true
      const notExpired = !coupon.expiresAt || (coupon.expiresAt as Timestamp).toDate() > new Date()
      const notExhausted = (coupon.usedCount ?? 0) < (coupon.maxUses ?? 0)

      if (!isActive || !notExpired || !notExhausted) {
        setCouponMessage(t('tripDetails.couponExpired'))
        return
      }

      const original = trip.pricePerSeat * seats
      const discount = coupon.discountType === 'percentage' ? original * (coupon.value / 100) : coupon.value
      const finalDiscount = Math.min(discount, original)
      setCouponDiscount(finalDiscount)
      setCouponMessage(`${t('tripDetails.couponApplied')} ${finalDiscount.toFixed(0)} ${t('common.currency')}`)
    } catch {
      setCouponMessage(t('tripDetails.genericError'))
    }
  }

  async function handleBook() {
    if (!trip || !user) return
    if (!pickupPoint) {
      setError(t('tripDetails.pickupRequired'))
      return
    }
    setLoading(true)
    setError(null)
    try {
      const bookingId = await createBooking({
        tripId: trip.id,
        seatsBooked: seats,
        paymentMethod,
        couponCode: couponCode.trim() || undefined,
        pickupLat: pickupPoint.lat,
        pickupLng: pickupPoint.lng,
      })
      setConfirmedBookingId(bookingId)
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('tripDetails.genericError'))
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
        {t('tripDetails.tripNotFound')}
      </div>
    )
  }

  const timeFormat = new Intl.DateTimeFormat('ar-EG', { hour: '2-digit', minute: '2-digit', weekday: 'long', day: 'numeric', month: 'long' })
  const total = Math.max(0, trip.pricePerSeat * seats - couponDiscount)

  if (success) {
    return <BookingSuccessView confirmedBookingId={confirmedBookingId} onNavigate={navigate} />
  }

  return (
    <div className="min-h-screen bg-bg pb-24">
      <header className="flex items-center gap-3 border-b border-border bg-card px-4 py-4">
        <button onClick={() => navigate(-1)} className="text-xl">
          ←
        </button>
        <h1 className="text-lg font-bold text-text-primary">{t('tripDetails.title')}</h1>
        <div className="mr-auto flex items-center gap-3">
          <button
            onClick={async () => {
              const url = window.location.href
              const shareText = `${t('tripDetails.shareText')}: ${trip?.originCity} → ${trip?.destinationCity}`
              if (navigator.share) {
                try {
                  await navigator.share({ title: 'مسافر', text: shareText, url })
                } catch {
                  // المستخدم لغى المشاركة، مفيش داعي نعمل حاجة
                }
              } else {
                window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + url)}`, '_blank')
              }
            }}
            className="text-xl"
            aria-label={t('tripDetails.shareTrip')}
          >
            📤
          </button>
          {trip && user && (
            <button onClick={() => toggleFavorite(user.uid, trip.id, isFavorite)} className="text-xl">
              {isFavorite ? '❤️' : '🤍'}
            </button>
          )}
          {driver?.phone && (
            <a href={`tel:${driver.phone}`} className="text-xl">
              📞
            </a>
          )}
          <button onClick={openChat} disabled={openingChat} className="text-xl">
            💬
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6">
        {trip.isWomenOnly && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-pink-50 p-3 text-pink-700">
            👩 <span>{t('tripDetails.womenOnly')}</span>
          </div>
        )}

        {driver && (
          <div className="mb-4 flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
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
                ⭐ {driver.avgRating.toFixed(1)} · {driver.totalTrips} {t('tripDetails.trip')}
              </p>
            </div>
          </div>
        )}

        <h2 className="mb-1 text-xl font-bold text-text-primary">
          {trip.originCity} → {trip.destinationCity}
        </h2>
        <p className="mb-4 text-text-secondary">{timeFormat.format(trip.departureTime)}</p>

        <div className="mb-4 flex flex-col gap-2 text-text-secondary">
          <span>💺 {trip.availableSeats} {t('tripDetails.availableSeats')}</span>
          <span>🚗 {trip.carType}</span>
          <span>⏱️ {trip.estimatedDurationMinutes} {t('tripDetails.approxMinutes')}</span>
        </div>

        {(trip.originLat !== 0 || trip.originLng !== 0) && (
          <div className="mb-4">
            <TripRouteMap trip={trip} />
          </div>
        )}

        <hr className="my-4 border-border" />

        <div className="mb-4 flex items-center justify-between">
          <span className="font-semibold text-text-primary">{t('tripDetails.seatsCount')}</span>
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
          <p className="mb-2 font-semibold text-text-primary">{t('tripDetails.paymentMethod')}</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setPaymentMethod('cash')}
              className={`rounded-xl border-2 py-3 font-semibold ${
                paymentMethod === 'cash' ? 'border-primary bg-primary-light text-primary' : 'border-border text-text-secondary'
              }`}
            >
              💵 {t('tripDetails.cash')}
            </button>
            <button
              onClick={() => setPaymentMethod('wallet')}
              className={`rounded-xl border-2 py-3 font-semibold ${
                paymentMethod === 'wallet' ? 'border-primary bg-primary-light text-primary' : 'border-border text-text-secondary'
              }`}
            >
              👛 {t('tripDetails.wallet')}
            </button>
          </div>
        </div>

        <div className="mb-4">
        <div className="mb-4">
          <p className="mb-2 font-semibold text-text-primary">{t('tripDetails.pickupPoint')}</p>
          <button
            type="button"
            onClick={() => setPickingLocation(true)}
            className={`flex w-full items-center gap-3 rounded-xl border-2 p-4 text-right ${
              pickupPoint ? 'border-success/40 bg-success/5' : 'border-border bg-card'
            }`}
          >
            <span className="text-xl">{pickupPoint ? '✅' : '📍'}</span>
            <span className={pickupPoint ? 'font-semibold text-success' : 'text-text-secondary'}>
              {pickupPoint ? t('tripDetails.pickupSet') : t('tripDetails.pickupNotSet')}
            </span>
          </button>
        </div>

        <p className="mb-2 font-semibold text-text-primary">{t('tripDetails.couponOptional')}</p>
          <div className="flex gap-3">
            <input
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder={t('tripDetails.couponPlaceholder')}
              className="flex-1 rounded-xl border-2 border-border px-4 py-2.5 focus:border-primary focus:outline-none"
            />
            <button
              type="button"
              onClick={applyCoupon}
              className="rounded-xl border-2 border-primary px-4 py-2.5 font-semibold text-primary"
            >
              {t('tripDetails.apply')}
            </button>
          </div>
          {couponMessage && (
            <p className={`mt-2 text-sm ${couponDiscount > 0 ? 'text-success' : 'text-danger'}`}>{couponMessage}</p>
          )}
        </div>

        <div className="mb-4 flex items-center justify-between rounded-xl bg-card p-4">
          <span className="font-semibold text-text-primary">{t('tripDetails.total')}</span>
          <span className="text-xl font-bold text-primary">{total.toFixed(0)} ج.م</span>
        </div>

        {error && <p className="mb-4 text-sm text-danger">{error}</p>}

        <Button onClick={handleBook} loading={loading} disabled={trip.availableSeats < 1 || !pickupPoint}>
          {t('tripDetails.bookNow')}
        </Button>
      </main>

      {pickingLocation && (
        <LocationPicker
          title={t('tripDetails.pickupPickerTitle')}
          initialLat={pickupPoint?.lat}
          initialLng={pickupPoint?.lng}
          onClose={() => setPickingLocation(false)}
          onConfirm={(lat, lng) => {
            setPickupPoint({ lat, lng })
            setPickingLocation(false)
          }}
        />
      )}
    </div>
  )
}

/**
 * شاشة نجاح الحجز باحتفال Confetti حقيقي (مش مجرد إيموجي ثابت) - أول
 * انطباع بعد أي حجز لازم يحس المستخدم إنه حصل حاجة كويسة فعلاً.
 */
function BookingSuccessView({
  confirmedBookingId,
  onNavigate,
}: {
  confirmedBookingId: string | null
  onNavigate: (path: string) => void
}) {
  const { t } = useTranslation()

  useEffect(() => {
    const colors = ['#1E40AF', '#1D4ED8', '#22C55E', '#F59E0B']
    confetti({ particleCount: 120, spread: 90, origin: { y: 0.6 }, colors })
    const timer = setTimeout(() => {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.5, x: 0.2 }, colors })
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.5, x: 0.8 }, colors })
    }, 300)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="text-6xl">🎉</div>
      <h1 className="text-2xl font-bold text-text-primary">{t('tripDetails.bookingSuccessTitle')}</h1>
      <p className="text-text-secondary">{t('tripDetails.bookingSuccessSubtitle')}</p>
      <div className="flex gap-3">
        <Button variant="secondary" onClick={() => onNavigate('/')} fullWidth={false}>
          {t('tripDetails.home')}
        </Button>
        {confirmedBookingId && (
          <Button onClick={() => onNavigate(`/track/${confirmedBookingId}`)} fullWidth={false}>
            {t('tripDetails.trackDriver')} 🚗
          </Button>
        )}
      </div>
    </div>
  )
}
