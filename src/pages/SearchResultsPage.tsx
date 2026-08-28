import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { searchTrips } from '../lib/trips'
import { saveTripAlert } from '../lib/tripAlerts'
import type { Trip } from '../types/trip'
import { TripCard } from '../components/TripCard'
import { Button } from '../components/ui/Button'
import { useAuth } from '../contexts/useAuth'

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { t } = useTranslation()

  const origin = searchParams.get('from') ?? ''
  const destination = searchParams.get('to') ?? ''
  const seats = Number(searchParams.get('seats') ?? '1')

  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [alertSaved, setAlertSaved] = useState(false)

  useEffect(() => {
    if (!origin || !destination) return
    setLoading(true)
    setError(null)

    searchTrips(
      {
        originCity: origin,
        destinationCity: destination,
        country: 'egypt',
        date: new Date(),
        seatsNeeded: seats,
        returnEmptyOnly: false,
        womenOnlyFilter: false,
      },
      user?.gender ?? 'male',
    )
      .then(setTrips)
      .catch(() => setError(t('search.searchError')))
      .finally(() => setLoading(false))
  }, [origin, destination, seats, user?.gender, t])

  return (
    <div className="min-h-screen bg-bg">
      <header className="flex items-center gap-3 border-b border-border bg-card px-4 py-4">
        <button onClick={() => navigate(-1)} className="text-xl">
          ←
        </button>
        <h1 className="text-lg font-bold text-text-primary">
          {origin} → {destination}
        </h1>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6">
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 animate-pulse rounded-2xl bg-card" />
            ))}
          </div>
        )}

        {error && (
          <div className="py-12 text-center">
            <p className="mb-4 text-text-secondary">{error}</p>
            <Button variant="secondary" onClick={() => window.location.reload()} fullWidth={false}>
              {t('search.retryButton')}
            </Button>
          </div>
        )}

        {!loading && !error && trips.length === 0 && (
          <div className="py-12 text-center">
            <p className="mb-2 text-lg font-semibold text-text-primary">{t('search.noResultsTitle')}</p>
            <p className="mb-4 text-sm text-text-secondary">{t('search.noResultsSubtitle')}</p>
            <div className="flex flex-col items-center gap-3">
              <Button variant="secondary" onClick={() => navigate('/')} fullWidth={false}>
                {t('search.backToSearch')}
              </Button>
              {alertSaved ? (
                <p className="text-sm font-semibold text-success">🔔 {t('search.alertSaved')}</p>
              ) : (
                <button
                  onClick={async () => {
                    await saveTripAlert({ country: 'egypt', originCity: origin, destinationCity: destination })
                    setAlertSaved(true)
                  }}
                  className="text-sm font-semibold text-primary"
                >
                  🔔 {t('search.notifyMeTitle')}
                </button>
              )}
            </div>
          </div>
        )}

        {!loading && trips.map((trip) => <TripCard key={trip.id} trip={trip} />)}
      </main>
    </div>
  )
}
