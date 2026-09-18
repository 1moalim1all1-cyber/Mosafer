import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/useAuth'
import { useCountry } from '../hooks/useCountry'
import { createTripRequest } from '../lib/tripRequests'
import { findMatchingTrips, type MatchedTrip } from '../lib/tripMatching'
import { COUNTRIES } from '../lib/countries'
import { CountrySelector } from '../components/CountrySelector'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { LocationPicker } from '../components/LocationPicker'
import { calculateDistanceKm, estimateEtaMinutes } from '../lib/geo'

export default function CreateTripRequestPage() {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  const [country, setCountry] = useCountry()

  const now = new Date()
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [travelDate, setTravelDate] = useState(todayStr)
  const [preferredTime, setPreferredTime] = useState('')
  const [seats, setSeats] = useState('1')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [matches, setMatches] = useState<MatchedTrip[] | null>(null)
  const [originPoint, setOriginPoint] = useState<{ lat: number; lng: number } | null>(null)
  const [destinationPoint, setDestinationPoint] = useState<{ lat: number; lng: number } | null>(null)
  const [pickingLocation, setPickingLocation] = useState<'origin' | 'destination' | null>(null)
  const routeDistanceKm = originPoint && destinationPoint
    ? calculateDistanceKm(originPoint.lat, originPoint.lng, destinationPoint.lat, destinationPoint.lng)
    : null

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!user) return
    if (!origin || !destination) {
      setError(t('community.errorFillOriginDestination'))
      return
    }
    if (origin === destination) {
      setError(t('community.errorSameCity'))
      return
    }
    const requestedTime = new Date(`${travelDate}T${preferredTime || '23:59:59'}`)
    if (Number.isNaN(requestedTime.getTime()) || requestedTime.getTime() <= Date.now()) {
      setError('الميعاد اللي اخترته فات بالفعل. اختار وقت لسه مجاش عشان الطلب يفضل ظاهر للسائقين.')
      return
    }

    setLoading(true)
    setError(null)
    try {
      await createTripRequest({
        country,
        originCity: origin,
        originLat: originPoint?.lat,
        originLng: originPoint?.lng,
        destinationCity: destination,
        destinationLat: destinationPoint?.lat,
        destinationLng: destinationPoint?.lng,
        travelDate,
        preferredTime: preferredTime || undefined,
        seatsNeeded: Number(seats),
        notes: notes || undefined,
      })

    } catch (publishError) {
      console.error('Failed to publish trip request', publishError)
      const firebaseError = publishError as { code?: string; message?: string }
      const errorCode = firebaseError.code || 'unknown'
      setError(firebaseError.message || `تعذّر نشر الطلب — كود الخطأ: ${errorCode}`)
      setLoading(false)
      return
    }

    try {
      const found = await findMatchingTrips({ country, originCity: origin, destinationCity: destination, travelDate, preferredTime })
      if (found.length > 0) setMatches(found)
      else navigate('/community')
    } catch (matchingError) {
      // الطلب اتحفظ بالفعل؛ فشل البحث عن المطابقات لا يعني فشل النشر.
      console.error('Trip request published, but matching failed', matchingError)
      navigate('/community')
    } finally {
      setLoading(false)
    }
  }

  if (matches) {
    return (
      <div className="mx-auto max-w-lg px-4 py-8 pb-24">
        <h1 className="mb-2 text-2xl font-bold text-text-primary">{t('community.matchesFoundTitle', { count: matches.length })}</h1>
        <p className="mb-6 text-text-secondary">{t('community.matchesFoundSubtitle')}</p>

        <div className="flex flex-col gap-3">
          {matches.map(({ trip, matchPercent }) => (
            <button
              key={trip.id}
              onClick={() => navigate(`/trip/${trip.id}`)}
              className="rounded-2xl border border-border bg-card p-4 text-right transition hover:border-primary"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-bold text-success">
                  {matchPercent}% {t('community.match')}
                </span>
                <span className="text-xs text-text-secondary">
                  {new Intl.DateTimeFormat(i18n.language === 'ar' ? 'ar-EG' : 'en-US', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  }).format(trip.departureTime)}
                </span>
              </div>
              <p className="mb-1 font-bold text-text-primary">
                {trip.originCity} → {trip.destinationCity}
              </p>
              <p className="text-sm text-text-secondary">
                {trip.availableSeats} {t('bookings.seatsCount')} · {trip.pricePerSeat} {t('common.currency')}
              </p>
            </button>
          ))}
        </div>

        <Button variant="secondary" onClick={() => navigate('/community')} className="mt-6">
          {t('community.viewCommunityInstead')}
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 pb-24">
      <h1 className="mb-2 text-2xl font-bold text-text-primary">{t('community.requestTripTitle')}</h1>
      <p className="mb-6 text-text-secondary">{t('community.requestTripSubtitle')}</p>

      <form onSubmit={handleSubmit} className="grid w-full gap-4 rounded-2xl border border-border bg-card/35 p-4 sm:p-6 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-1.5 block text-sm font-semibold text-text-primary">{t('driver.country')}</label>
          <CountrySelector value={country} onChange={setCountry} />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-text-primary">{t('search.from')}</label>
          <select
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            className="w-full rounded-xl border-2 border-border bg-card px-4 py-3 focus:border-primary focus:outline-none"
          >
            <option value="">{t('search.selectGovernorate')}</option>
            {COUNTRIES[country].regions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <button type="button" onClick={() => setPickingLocation('origin')} className={`mt-2 rounded-lg border px-3 py-2 text-sm ${originPoint ? 'border-success/40 text-success' : 'border-border text-text-secondary'}`}>
            {originPoint ? '✅ تم تحديد نقطة الركوب' : '📍 حدد نقطة الركوب على الخريطة'}
          </button>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-text-primary">{t('search.to')}</label>
          <select
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="w-full rounded-xl border-2 border-border bg-card px-4 py-3 focus:border-primary focus:outline-none"
          >
            <option value="">{t('search.selectGovernorate')}</option>
            {COUNTRIES[country].regions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <button type="button" onClick={() => setPickingLocation('destination')} className={`mt-2 rounded-lg border px-3 py-2 text-sm ${destinationPoint ? 'border-success/40 text-success' : 'border-border text-text-secondary'}`}>
            {destinationPoint ? '✅ تم تحديد نقطة الوصول' : '📍 حدد نقطة الوصول على الخريطة'}
          </button>
        </div>

        <Input label={t('driver.date')} type="date" value={travelDate} min={todayStr} onChange={(e) => setTravelDate(e.target.value)} />
        <Input
          label={t('community.preferredTimeOptional')}
          type="time"
          value={preferredTime}
          onChange={(e) => setPreferredTime(e.target.value)}
        />
        <Input label={t('driver.availableSeatsCount')} type="number" min={1} value={seats} onChange={(e) => setSeats(e.target.value)} />

        <div className="md:col-span-2">
          <label className="mb-1.5 block text-sm font-semibold text-text-primary">{t('community.notesOptional')}</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full rounded-xl border-2 border-border bg-card px-4 py-3 focus:border-primary focus:outline-none"
          />
        </div>

        {routeDistanceKm != null && <p className="text-sm text-success md:col-span-2">المسافة التقريبية {routeDistanceKm.toFixed(1)} كم · حوالي {estimateEtaMinutes(routeDistanceKm)} دقيقة</p>}
        {error && <p className="text-sm text-danger md:col-span-2">{error}</p>}

        <div className="md:col-span-2"><Button type="submit" loading={loading}>{t('community.publishRequest')}</Button></div>
      </form>

      {pickingLocation && (
        <LocationPicker
          title={pickingLocation === 'origin' ? 'حدد نقطة الركوب' : 'حدد نقطة الوصول'}
          initialLat={pickingLocation === 'origin' ? originPoint?.lat : destinationPoint?.lat}
          initialLng={pickingLocation === 'origin' ? originPoint?.lng : destinationPoint?.lng}
          onClose={() => setPickingLocation(null)}
          onConfirm={(lat, lng) => {
            if (pickingLocation === 'origin') setOriginPoint({ lat, lng })
            else setDestinationPoint({ lat, lng })
            setPickingLocation(null)
          }}
        />
      )}
    </div>
  )
}
