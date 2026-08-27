import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet'
import L from 'leaflet'
import { subscribeBooking } from '../lib/bookings'
import { subscribeToTrip, fetchLocationHistory } from '../lib/trips'
import { fetchUserProfile } from '../lib/users'
import { calculateDistanceKm, estimateEtaMinutes } from '../lib/geo'
import { EmergencyButton } from '../components/EmergencyButton'
import type { Booking } from '../types/booking'
import type { Trip } from '../types/trip'
import type { AppUser } from '../types/user'

const pickupIcon = new L.DivIcon({
  html: '<div style="background:#2563EB;width:18px;height:18px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>',
  className: '',
  iconSize: [18, 18],
})

const driverIcon = new L.DivIcon({
  html: '<div style="background:#1E40AF;width:40px;height:40px;border-radius:50%;border:3px solid white;box-shadow:0 2px 12px rgba(30,64,175,0.5);display:flex;align-items:center;justify-content:center;font-size:20px">🚗</div>',
  className: '',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
})

function isLiveLocationFresh(updatedAt?: Date | null): boolean {
  if (!updatedAt) return false
  return (Date.now() - updatedAt.getTime()) / 1000 < 60
}

export default function TrackTripPage() {
  const { bookingId } = useParams<{ bookingId: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [booking, setBooking] = useState<Booking | null | undefined>(undefined)
  const [trip, setTrip] = useState<Trip | null>(null)
  const [driver, setDriver] = useState<AppUser | null>(null)

  useEffect(() => {
    if (!bookingId) return
    return subscribeBooking(bookingId, setBooking)
  }, [bookingId])

  useEffect(() => {
    if (!booking?.tripId) return
    return subscribeToTrip(booking.tripId, setTrip)
  }, [booking?.tripId])

  useEffect(() => {
    if (!booking?.driverId) return
    fetchUserProfile(booking.driverId).then(setDriver)
  }, [booking?.driverId])

  const hasPickup = booking?.pickupLat != null && booking?.pickupLng != null
  const hasLiveDriver = trip ? isLiveLocationFresh(trip.driverLiveUpdatedAt) && trip.driverLiveLat && trip.driverLiveLng : false

  const pickupPoint: [number, number] | null = hasPickup ? [booking!.pickupLat!, booking!.pickupLng!] : null
  const driverPoint: [number, number] | null = hasLiveDriver ? [trip!.driverLiveLat!, trip!.driverLiveLng!] : null

  const distanceKm =
    pickupPoint && driverPoint ? calculateDistanceKm(driverPoint[0], driverPoint[1], pickupPoint[0], pickupPoint[1]) : null
  const isNear = distanceKm != null && distanceKm < 1

  // إشعار حقيقي من المتصفح لما السائق يقرب، حتى لو المستخدم مش واقف
  // على الشاشة دي بالظبط (في تاب تاني مثلاً) - بيتبعت مرة واحدة بس
  // لحد ما السائق يبعد تاني عشان منزعجش المستخدم بتكرار. لازم يتحط
  // قبل أي Return مبكر عشان قواعد الـ Hooks في React
  const [nearNotified, setNearNotified] = useState(false)
  const [pathHistory, setPathHistory] = useState<[number, number][] | null>(null)
  const [loadingPath, setLoadingPath] = useState(false)

  async function showPathHistory() {
    if (pathHistory) {
      setPathHistory(null)
      return
    }
    if (!booking?.tripId) return
    setLoadingPath(true)
    try {
      const points = await fetchLocationHistory(booking.tripId)
      setPathHistory(points.map((p) => [p.lat, p.lng]))
    } finally {
      setLoadingPath(false)
    }
  }
  useEffect(() => {
    if (isNear && !nearNotified) {
      setNearNotified(true)
      if ('Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification('مسافر', { body: 'السائق قريب منك جدًا! 🚗', icon: `${import.meta.env.BASE_URL}logo.jpeg` })
        } else if (Notification.permission !== 'denied') {
          Notification.requestPermission().then((perm) => {
            if (perm === 'granted') {
              new Notification('مسافر', { body: 'السائق قريب منك جدًا! 🚗', icon: `${import.meta.env.BASE_URL}logo.jpeg` })
            }
          })
        }
      }
    } else if (!isNear && nearNotified) {
      setNearNotified(false)
    }
  }, [isNear, nearNotified])

  if (booking === undefined || !trip) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (booking === null) {
    return <div className="flex min-h-screen items-center justify-center text-text-secondary">{t('track.bookingNotFound')}</div>
  }

  const etaMinutes = distanceKm != null ? estimateEtaMinutes(distanceKm) : null

  const center = driverPoint ?? pickupPoint ?? [30.0444, 31.2357]

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <header className="flex items-center gap-3 border-b border-border bg-card px-4 py-4">
        <button onClick={() => navigate(-1)} className="text-xl">
          ←
        </button>
        <h1 className="text-lg font-bold text-text-primary">{t('track.trackYourTrip')}</h1>
        <button
          onClick={async () => {
            const shareText = 'بتابع رحلتي على مسافر، اتفرج على تحرّكي لحد ما أوصل'
            const url = window.location.href
            if (navigator.share) {
              try {
                await navigator.share({ title: 'مسافر', text: shareText, url })
              } catch {
                // المستخدم لغى المشاركة
              }
            } else {
              window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + url)}`, '_blank')
            }
          }}
          className="mr-auto text-xl"
          aria-label={t('track.shareTrackLink')}
        >
          📤
        </button>
      </header>

      <div className="relative flex-1" style={{ minHeight: 320 }}>
        <MapContainer center={center} zoom={hasLiveDriver ? 14 : 11} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          {pickupPoint && driverPoint && (
            <Polyline positions={[driverPoint, pickupPoint]} color="#1E40AF" weight={3} dashArray="6 8" />
          )}
          {pathHistory && pathHistory.length > 1 && (
            <Polyline positions={pathHistory} color="#9333EA" weight={4} opacity={0.7} />
          )}
          {pickupPoint && <Marker position={pickupPoint} icon={pickupIcon} />}
          {driverPoint && <Marker position={driverPoint} icon={driverIcon} />}
        </MapContainer>

        <button
          onClick={showPathHistory}
          disabled={loadingPath}
          className="absolute bottom-3 right-3 z-[1000] rounded-full bg-card px-3 py-2 text-xs font-semibold text-primary shadow-lg"
        >
          {loadingPath ? '...' : pathHistory ? '🛣️ إخفاء المسار' : '🛣️ عرض المسار المقطوع'}
        </button>
      </div>

      <div className="border-t border-border bg-card p-4">
        {!hasLiveDriver ? (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-warning/10 p-3">
            <span>⏳</span>
            <span className="text-sm font-semibold text-warning">{t('track.driverNotSharingYet')}</span>
          </div>
        ) : isNear ? (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-success/10 p-3">
            <span>📍</span>
            <span className="text-sm font-semibold text-success">{t('track.driverVeryClose')}</span>
          </div>
        ) : (
          <div className="mb-4 flex items-center justify-between rounded-xl bg-primary-light p-3">
            <span className="text-sm font-semibold text-primary">{t('track.driverOnWay')}</span>
            {distanceKm != null && etaMinutes != null && (
              <span className="text-sm font-bold text-primary">
                {t('track.distanceEta', { km: distanceKm.toFixed(1), min: etaMinutes })}
              </span>
            )}
          </div>
        )}

        {driver && (
          <div className="flex items-center gap-3 rounded-xl border border-border p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-light text-xl">
              {driver.profileImageUrl ? (
                <img src={driver.profileImageUrl} className="h-12 w-12 rounded-full object-cover" alt="" />
              ) : (
                '🧑'
              )}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-text-primary">{driver.fullName}</p>
              <p className="text-sm text-text-secondary">⭐ {driver.avgRating.toFixed(1)}</p>
            </div>
            {driver.phone && (
              <a
                href={`tel:${driver.phone}`}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-success text-xl text-white"
                aria-label={t('track.callDriver')}
              >
                📞
              </a>
            )}
          </div>
        )}
      </div>
      <EmergencyButton />
    </div>
  )
}
