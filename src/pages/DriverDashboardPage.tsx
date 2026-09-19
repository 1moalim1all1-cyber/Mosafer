import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/useAuth'
import { subscribeDriverTrips, subscribeDriverStatus } from '../lib/driverActions'
import type { Trip } from '../types/trip'
import { Button } from '../components/ui/Button'
import { Armchair, Users, Plus } from 'lucide-react'
import { subscribeDriverOffers } from '../lib/tripOffers'
import { getOrCreateChat } from '../lib/chat'
import type { TripOffer } from '../types/tripOffer'
import { MessageCircle } from 'lucide-react'

function getStatusLabels(t: (key: string) => string): Record<Trip['status'], { label: string; color: string }> {
  return {
    active: { label: t('admin.statusActiveTrip'), color: 'text-success' },
    full: { label: t('admin.statusFull'), color: 'text-primary' },
    driver_arriving: { label: 'السائق في الطريق', color: 'text-warning' },
    in_progress: { label: 'الرحلة بدأت', color: 'text-success' },
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
  const [offers, setOffers] = useState<TripOffer[]>([])
  const [chatError, setChatError] = useState('')

  useEffect(() => {
    if (!user) return
    const unsub1 = subscribeDriverTrips(user.uid, setTrips)
    const unsub2 = subscribeDriverStatus(user.uid, (s) => setApproved(s === 'approved'))
    const unsub3 = subscribeDriverOffers(user.uid, setOffers)
    return () => {
      unsub1()
      unsub2()
      unsub3()
    }
  }, [user])

  async function contactPassenger(offer: TripOffer) {
    try {
      setChatError('')
      const chatId = await getOrCreateChat(offer.passengerId, offer.driverId)
      navigate(`/chat/${chatId}`)
    } catch (error) {
      setChatError(error instanceof Error ? error.message : 'تعذر فتح المحادثة')
    }
  }

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

      <main className="mx-auto w-full max-w-6xl px-4 py-6">
        {offers.length > 0 && <section className="mb-8">
          <h2 className="mb-3 text-lg font-bold text-text-primary">عروضي لطلبات الركاب</h2>
          {chatError && <p className="mb-2 text-sm text-danger">{chatError}</p>}
          <div className="grid gap-3 lg:grid-cols-2">
            {offers.map((offer) => <div key={offer.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex justify-between gap-2"><span className="font-semibold text-text-primary">عرضك: {offer.seatsOffered} مقعد · {offer.pricePerSeat} ج.م للمقعد</span><span className={`text-sm font-bold ${offer.status === 'accepted' ? 'text-success' : offer.status === 'rejected' ? 'text-danger' : 'text-warning'}`}>{offer.status === 'accepted' ? 'الراكب وافق' : offer.status === 'rejected' ? 'تم الاعتذار' : 'بانتظار رد الراكب'}</span></div>
              <p className="mt-2 text-sm text-text-secondary">الساعة {offer.departureTime}</p>
              {offer.status === 'accepted' && offer.tripId && <button onClick={() => navigate(`/driver/trip/${offer.tripId}/bookings`)} className="mt-3 w-full rounded-xl border border-primary py-2 font-semibold text-primary">إدارة الرحلة والحجز</button>}
              {offer.status === 'accepted' && <button onClick={() => contactPassenger(offer)} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 font-semibold text-white"><MessageCircle size={18} /> تواصل مع الراكب</button>}
            </div>)}
          </div>
        </section>}
        {trips.length === 0 && <p className="py-12 text-center text-text-secondary">{t('driver.noTripsYet')}</p>}

        <div className="grid gap-4 lg:grid-cols-2">
        {trips.map((trip) => (
          <button
            key={trip.id}
            onClick={() => navigate(`/driver/trip/${trip.id}/bookings`)}
            className="flex w-full items-center justify-between rounded-2xl border border-border bg-card p-4 text-right transition hover:border-primary"
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
            <div className="min-w-36 text-left">
              <p className={`text-sm font-semibold ${STATUS_LABELS[trip.status].color}`}>
                {STATUS_LABELS[trip.status].label}
              </p>
              <p className="mt-1 flex items-center justify-end gap-1.5 text-sm font-semibold text-text-primary"><Armchair size={15} className="text-primary" /> متبقي {trip.availableSeats} من {trip.totalSeats}</p>
              <p className="flex items-center justify-end gap-1 text-xs text-text-secondary"><Users size={13} /> محجوز {Math.max(0, trip.totalSeats - trip.availableSeats)}</p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border"><div className="h-full rounded-full bg-gradient-to-l from-primary to-secondary" style={{ width: `${trip.totalSeats > 0 ? ((trip.totalSeats - trip.availableSeats) / trip.totalSeats) * 100 : 0}%` }} /></div>
            </div>
          </button>
        ))}
        </div>
      </main>

      {approved && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2">
          <Button onClick={() => navigate('/driver/create-trip')} fullWidth={false} icon={<Plus size={19} />}>
            {t('driver.newTrip')}
          </Button>
        </div>
      )}
    </div>
  )
}
