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

export default function CreateTripRequestPage() {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  const [country, setCountry] = useCountry()

  const todayStr = new Date().toISOString().split('T')[0]

  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [travelDate, setTravelDate] = useState(todayStr)
  const [preferredTime, setPreferredTime] = useState('')
  const [seats, setSeats] = useState('1')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [matches, setMatches] = useState<MatchedTrip[] | null>(null)

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

    setLoading(true)
    setError(null)
    try {
      await createTripRequest({
        country,
        originCity: origin,
        destinationCity: destination,
        travelDate,
        preferredTime: preferredTime || undefined,
        seatsNeeded: Number(seats),
        notes: notes || undefined,
      })

      const found = await findMatchingTrips({ country, originCity: origin, destinationCity: destination, travelDate, preferredTime })
      if (found.length > 0) {
        setMatches(found)
      } else {
        navigate('/community')
      }
    } catch {
      setError(t('community.errorPublish'))
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
    <div className="mx-auto max-w-lg px-4 py-8 pb-24">
      <h1 className="mb-2 text-2xl font-bold text-text-primary">{t('community.requestTripTitle')}</h1>
      <p className="mb-6 text-text-secondary">{t('community.requestTripSubtitle')}</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
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
        </div>

        <Input label={t('driver.date')} type="date" value={travelDate} min={todayStr} onChange={(e) => setTravelDate(e.target.value)} />
        <Input
          label={t('community.preferredTimeOptional')}
          type="time"
          value={preferredTime}
          onChange={(e) => setPreferredTime(e.target.value)}
        />
        <Input label={t('driver.availableSeatsCount')} type="number" min={1} value={seats} onChange={(e) => setSeats(e.target.value)} />

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-text-primary">{t('community.notesOptional')}</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full rounded-xl border-2 border-border bg-card px-4 py-3 focus:border-primary focus:outline-none"
          />
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}

        <Button type="submit" loading={loading}>
          {t('community.publishRequest')}
        </Button>
      </form>
    </div>
  )
}
