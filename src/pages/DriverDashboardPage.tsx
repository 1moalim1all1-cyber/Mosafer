import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/useAuth'
import { subscribeDriverTrips, subscribeDriverStatus } from '../lib/driverActions'
import type { Trip } from '../types/trip'
import { Button } from '../components/ui/Button'

function getStatusLabels(t: (key: string) => string): Record<Trip['status'], { label: string; color: string }> {
  return {
    active: { label: t('admin.statusActiveTrip'), color: 'text-success' },
    full: { label: t('admin.statusFull'), color: 'text-primary' },
    completed: { label: t('admin.statusCompleted'), color: 'text-text-secondary' },
    cancelled: { label: t('admin.statusCancelled'), color: 'text-danger' },
    expired: { label: t('admin.statusExpired'), color: 'text-text-secondary' },
    pending: { label: t('admin.statusPending'), color: 'text-warning' },
  }
}

export default function DriverDashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const STATUS_LABELS = getStatusLabels(t)
  const [trips, setTrips] = useState<Trip[]>([])
  const [approved, setApproved] = useState<boolean | null>(null)

  useEffect(() => {
    if (!user) return
    const unsub1 = subscribeDriverTrips(user.uid, setTrips)
    const unsub2 = subscribeDriverStatus(user.uid, (s) => setApproved(s === 'approved'))
    return () => {
      unsub1()
      unsub2()
    }
  }, [user])

  return (
    <div className="min-h-screen bg-bg pb-24">
      <header className="flex items-center justify-between border-b border-border bg-card px-4 py-4">
        <h1 className="text-lg font-bold text-text-primary">{t('driver.dashboardTitle')}</h1>
        <button onClick={() => navigate('/')} className="text-sm font-semibold text-primary">
          {t('landing.home')}
        </button>
      </header>

      {approved === false && (
        <div className="flex items-center justify-between bg-warning/10 px-4 py-3">
          <span className="text-sm text-text-primary">{t('driver.pendingReviewBanner')}</span>
          <button onClick={() => navigate('/driver/pending-approval')} className="text-sm font-semibold text-primary">
            {t('driver.details')}
          </button>
        </div>
      )}

      <main className="mx-auto max-w-lg px-4 py-6">
        {trips.length === 0 && <p className="py-12 text-center text-text-secondary">{t('driver.noTripsYet')}</p>}

        {trips.map((trip) => (
          <button
            key={trip.id}
            onClick={() => navigate(`/driver/trip/${trip.id}/bookings`)}
            className="mb-3 flex w-full items-center justify-between rounded-2xl border border-border bg-card p-4 text-right"
          >
            <div>
              <p className="font-semibold text-text-primary">
                {trip.originCity} → {trip.destinationCity}
              </p>
              <p className="text-sm text-text-secondary">
                {new Intl.DateTimeFormat(i18n.language === 'ar' ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(
                  trip.departureTime,
                )}
              </p>
            </div>
            <div className="text-left">
              <p className={`text-sm font-semibold ${STATUS_LABELS[trip.status].color}`}>
                {STATUS_LABELS[trip.status].label}
              </p>
              <p className="text-sm text-text-secondary">
                {trip.availableSeats}/{trip.totalSeats} {t('driver.available')}
              </p>
            </div>
          </button>
        ))}
      </main>

      {approved && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2">
          <Button onClick={() => navigate('/driver/create-trip')} fullWidth={false} icon="➕">
            {t('driver.newTrip')}
          </Button>
        </div>
      )}
    </div>
  )
}
