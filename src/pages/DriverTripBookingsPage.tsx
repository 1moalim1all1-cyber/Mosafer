import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet'
import L from 'leaflet'
import { subscribeTripBookings, respondToBooking, markTripCompleted, verifyPassengerPin } from '../lib/driverActions'
import { subscribeToTrip } from '../lib/trips'
import { calculateDistanceKm, estimateEtaMinutes } from '../lib/geo'
import { fetchUserProfile } from '../lib/users'
import { useAuth } from '../contexts/useAuth'
import type { AppUser } from '../types/user'
import { Button } from '../components/ui/Button'
import { RatingModal } from '../components/RatingModal'
import { LiveLocationToggle } from '../components/LiveLocationToggle'

const pickupIcon = new L.DivIcon({
  html: '<div style="background:#2563EB;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>',
  className: '',
  iconSize: [16, 16],
})

const driverIcon = new L.DivIcon({
  html: '<div style="background:#1E40AF;width:34px;height:34px;border-radius:50%;border:3px solid white;box-shadow:0 2px 12px rgba(30,64,175,0.5);display:flex;align-items:center;justify-content:center;font-size:16px">🚗</div>',
  className: '',
  iconSize: [34, 34],
  iconAnchor: [17, 17],
})

function isLiveLocationFresh(updatedAt?: Date | null): boolean {
  if (!updatedAt) return false
  return (Date.now() - updatedAt.getTime()) / 1000 < 60
}

interface BookingRow {
  id: string
  tripId: string
  passengerId: string
  seatsBooked: number
  status: string
  totalPrice: number
  pinVerified?: boolean
  pickupLat?: number | null
  pickupLng?: number | null
}

/**
 * خريطة مصغّرة بتوري السائق مكان الراكب المحدد بالظبط + موقع السائق
 * الحي (لو مفعّل مشاركة الموقع) - عشان التتبّع يبقى في الاتجاهين،
 * مش بس الراكب اللي بيشوف السائق.
 */
function PickupMiniMap({ tripId, pickupLat, pickupLng }: { tripId: string; pickupLat: number; pickupLng: number }) {
  const { t } = useTranslation()
  const [driverLat, setDriverLat] = useState<number | null>(null)
  const [driverLng, setDriverLng] = useState<number | null>(null)
  const [isFresh, setIsFresh] = useState(false)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    return subscribeToTrip(tripId, (trip) => {
      if (!trip) return
      const fresh = isLiveLocationFresh(trip.driverLiveUpdatedAt)
      setIsFresh(fresh)
      setDriverLat(fresh ? (trip.driverLiveLat ?? null) : null)
      setDriverLng(fresh ? (trip.driverLiveLng ?? null) : null)
    })
  }, [tripId])

  const pickupPoint: [number, number] = [pickupLat, pickupLng]
  const driverPoint: [number, number] | null = isFresh && driverLat && driverLng ? [driverLat, driverLng] : null
  const distanceKm = driverPoint ? calculateDistanceKm(driverPoint[0], driverPoint[1], pickupLat, pickupLng) : null

  return (
    <>
      <button
        onClick={() => setExpanded(true)}
        className="mb-3 block w-full overflow-hidden rounded-xl border border-border text-right"
        aria-label={t('driver.expandMap')}
      >
        <div style={{ height: 140 }} className="pointer-events-none">
          <MapContainer center={driverPoint ?? pickupPoint} zoom={13} style={{ height: '100%', width: '100%' }} attributionControl={false}>
            <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
            {driverPoint && <Polyline positions={[driverPoint, pickupPoint]} color="#1E40AF" weight={3} dashArray="6 8" />}
            <Marker position={pickupPoint} icon={pickupIcon} />
            {driverPoint && <Marker position={driverPoint} icon={driverIcon} />}
          </MapContainer>
        </div>
        <div className="flex items-center justify-between bg-bg px-3 py-1.5 text-xs">
          <span className="flex items-center gap-1 text-text-secondary">
            <span className="h-2 w-2 rounded-full bg-primary" /> {t('driver.passengerLocation')} · {t('driver.tapToExpand')}
          </span>
          {distanceKm != null ? (
            <span className="font-semibold text-primary">{t('driver.distanceEta', { km: distanceKm.toFixed(1), min: estimateEtaMinutes(distanceKm) })}</span>
          ) : (
            <span className="text-text-secondary">{t('driver.enableLocationSharing')}</span>
          )}
        </div>
      </button>

      {expanded && (
        <div className="fixed inset-0 z-50 flex flex-col bg-bg">
          <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-4">
            <button onClick={() => setExpanded(false)} className="text-xl" aria-label={t('driver.close')}>
              ✕
            </button>
            <h2 className="text-lg font-bold text-text-primary">{t('driver.passengerLocation')}</h2>
          </div>
          <div className="flex-1">
            <MapContainer center={driverPoint ?? pickupPoint} zoom={14} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
              {driverPoint && <Polyline positions={[driverPoint, pickupPoint]} color="#1E40AF" weight={3} dashArray="6 8" />}
              <Marker position={pickupPoint} icon={pickupIcon} />
              {driverPoint && <Marker position={driverPoint} icon={driverIcon} />}
            </MapContainer>
          </div>
          {distanceKm != null && (
            <div className="border-t border-border bg-card p-4 text-center font-semibold text-primary">
              {t('driver.distanceEta', { km: distanceKm.toFixed(1), min: estimateEtaMinutes(distanceKm) })}
            </div>
          )}
        </div>
      )}
    </>
  )
}

function BookingCard({ booking, onRate }: { booking: BookingRow; onRate: () => void }) {
  const { t } = useTranslation()
  const [passenger, setPassenger] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(false)
  const [pinInput, setPinInput] = useState('')
  const [pinError, setPinError] = useState(false)
  const [verifying, setVerifying] = useState(false)

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

  async function checkPin() {
    if (pinInput.length !== 4) return
    setVerifying(true)
    setPinError(false)
    try {
      const ok = await verifyPassengerPin(booking.id, pinInput)
      if (!ok) setPinError(true)
    } finally {
      setVerifying(false)
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
    <div className="mb-3 rounded-2xl border border-border bg-card p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-semibold text-text-primary">{passenger?.fullName ?? 'راكب'}</span>
        <span className={`text-sm font-semibold ${statusLabels[booking.status]?.color}`}>
          {statusLabels[booking.status]?.label}
        </span>
      </div>
      <p className="mb-3 text-sm text-text-secondary">
        {booking.seatsBooked} مقاعد · {booking.totalPrice.toFixed(0)} ج.م
      </p>
      {booking.status === 'confirmed' && booking.pickupLat != null && booking.pickupLng != null && (
        <PickupMiniMap tripId={booking.tripId} pickupLat={booking.pickupLat} pickupLng={booking.pickupLng} />
      )}

      {booking.status === 'confirmed' && passenger?.phone && (
        <a
          href={`tel:${passenger.phone}`}
          className="mb-3 flex items-center justify-center gap-2 rounded-xl border border-success/40 bg-success/5 py-2.5 text-sm font-semibold text-success"
        >
          📞 اتصل بالراكب
        </a>
      )}
      {booking.status === 'confirmed' && (
        booking.pinVerified ? (
          <div className="mb-3 flex items-center justify-center gap-2 rounded-xl bg-success/10 py-2.5 text-sm font-semibold text-success">
            ✅ تم التحقق من الراكب
          </div>
        ) : (
          <div className="mb-3 rounded-xl border border-border p-3">
            <p className="mb-2 text-xs text-text-secondary">
              اطلب من الراكب الكود اللي عنده (4 أرقام) واكتبه هنا للتأكد إنه فعلاً الشخص اللي حجز
            </p>
            <div className="flex gap-2">
              <input
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="0000"
                inputMode="numeric"
                dir="ltr"
                className="w-24 rounded-lg border-2 border-border px-3 py-2 text-center text-lg font-bold tracking-widest focus:border-primary focus:outline-none"
              />
              <Button onClick={checkPin} loading={verifying} disabled={pinInput.length !== 4} fullWidth={false}>
                تحقق
              </Button>
            </div>
            {pinError && <p className="mt-1 text-xs text-danger">{t('driver.pinWrong')}</p>}
          </div>
        )
      )}
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
  const { t } = useTranslation()
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
      <header className="flex items-center justify-between border-b border-border bg-card px-4 py-4">
        <h1 className="text-lg font-bold text-text-primary">{t('driver.bookingRequests')}</h1>
        <button onClick={handleComplete} disabled={completing} className="text-sm font-semibold text-primary">
          إنهاء الرحلة
        </button>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6">
        {tripId && <LiveLocationToggle tripId={tripId} />}
        {bookings.length === 0 && <p className="py-12 text-center text-text-secondary">{t('driver.noBookingsYet')}</p>}
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
