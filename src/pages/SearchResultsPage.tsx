import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { searchTrips } from '../lib/trips'
import type { Trip } from '../types/trip'
import { TripCard } from '../components/TripCard'
import { Button } from '../components/ui/Button'
import { useAuth } from '../contexts/AuthContext'

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const origin = searchParams.get('from') ?? ''
  const destination = searchParams.get('to') ?? ''
  const seats = Number(searchParams.get('seats') ?? '1')

  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!origin || !destination) return
    setLoading(true)
    setError(null)

    searchTrips(
      {
        originCity: origin,
        destinationCity: destination,
        date: new Date(),
        seatsNeeded: seats,
        returnEmptyOnly: false,
        womenOnlyFilter: false,
      },
      user?.gender ?? 'male',
    )
      .then(setTrips)
      .catch(() => setError('حصل خطأ أثناء البحث'))
      .finally(() => setLoading(false))
  }, [origin, destination, seats, user?.gender])

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
              إعادة المحاولة
            </Button>
          </div>
        )}

        {!loading && !error && trips.length === 0 && (
          <div className="py-12 text-center">
            <p className="mb-2 text-lg font-semibold text-text-primary">مفيش رحلات متاحة على المعايير دي</p>
            <p className="mb-4 text-sm text-text-secondary">جرّب تاريخ تاني أو قلّل عدد الركاب المطلوبين</p>
            <Button variant="secondary" onClick={() => navigate('/')} fullWidth={false}>
              رجوع للبحث
            </Button>
          </div>
        )}

        {!loading && trips.map((trip) => <TripCard key={trip.id} trip={trip} />)}
      </main>
    </div>
  )
}
