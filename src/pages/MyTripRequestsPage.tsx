import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PlusCircle, ChevronDown } from 'lucide-react'
import { useAuth } from '../contexts/useAuth'
import { subscribeMyTripRequests, cancelTripRequest } from '../lib/tripRequests'
import { subscribeOffersForRequest, respondToTripOffer } from '../lib/tripOffers'
import type { TripRequest } from '../types/tripRequest'
import type { TripOffer } from '../types/tripOffer'
import { BottomNav } from '../components/BottomNav'

function getStatusConfig(t: (key: string) => string): Record<TripRequest['status'], { label: string; color: string }> {
  return {
    active: { label: t('community.statusActive'), color: 'text-success' },
    matched: { label: t('community.statusMatched'), color: 'text-primary' },
    expired: { label: t('community.statusExpired'), color: 'text-text-secondary' },
    cancelled: { label: t('community.statusCancelled'), color: 'text-danger' },
  }
}

function OfferRow({ offer }: { offer: TripOffer }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  async function handle(accept: boolean) {
    setLoading(true)
    try {
      await respondToTripOffer(offer, accept)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mb-2 rounded-xl border border-border bg-bg p-3">
      <div className="mb-1 flex items-center justify-between">
        <button onClick={() => navigate(`/profile/${offer.driverId}`)} className="font-semibold text-text-primary underline decoration-dotted">
          {offer.driverName}
        </button>
        <span className="font-bold text-primary">{offer.pricePerSeat} {t('common.currency')}</span>
      </div>
      <p className="mb-2 text-xs text-text-secondary">
        🕐 {offer.departureTime} · 💺 {offer.seatsOffered} {t('bookings.seatsCount')}
        {offer.pickupPoint && ` · 📍 ${offer.pickupPoint}`}
      </p>
      {offer.message && <p className="mb-2 text-xs text-text-secondary">"{offer.message}"</p>}

      {offer.status === 'pending' ? (
        <div className="flex gap-2">
          <button
            onClick={() => handle(false)}
            disabled={loading}
            className="flex-1 rounded-lg border border-danger/40 py-1.5 text-xs font-semibold text-danger disabled:opacity-50"
          >
            {t('admin.reject')}
          </button>
          <button
            onClick={() => handle(true)}
            disabled={loading}
            className="flex-1 rounded-lg bg-success py-1.5 text-xs font-semibold text-white disabled:opacity-50"
          >
            {t('admin.approveAction')}
          </button>
        </div>
      ) : (
        <span className={`text-xs font-semibold ${offer.status === 'accepted' ? 'text-success' : 'text-danger'}`}>
          {offer.status === 'accepted' ? `✅ ${t('community.offerAccepted')}` : `❌ ${t('community.offerRejected')}`}
        </span>
      )}
    </div>
  )
}

function RequestWithOffers({ request, statusConfig, onCancel }: { request: TripRequest; statusConfig: ReturnType<typeof getStatusConfig>; onCancel: (id: string) => void }) {
  const { t, i18n } = useTranslation()
  const [expanded, setExpanded] = useState(false)
  const [offers, setOffers] = useState<TripOffer[]>([])

  useEffect(() => {
    return subscribeOffersForRequest(request.id, setOffers)
  }, [request.id])

  return (
    <div className="mb-3 rounded-2xl border border-border bg-card p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="font-bold text-text-primary">
          {request.originCity} → {request.destinationCity}
        </p>
        <span className={`text-sm font-semibold ${statusConfig[request.status].color}`}>{statusConfig[request.status].label}</span>
      </div>
      <p className="mb-3 text-sm text-text-secondary">
        {new Intl.DateTimeFormat(i18n.language === 'ar' ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'short' }).format(
          new Date(request.travelDate),
        )}
        {request.preferredTime && ` · ${request.preferredTime}`} · {request.seatsNeeded} {t('bookings.seatsCount')}
      </p>

      <button onClick={() => setExpanded(!expanded)} className="mb-2 flex w-full items-center justify-between text-sm font-semibold text-primary">
        {t('community.offersReceived', { count: offers.length })}
        <ChevronDown size={16} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {expanded && (
        <div className="mb-2">
          {offers.length === 0 && <p className="py-2 text-center text-xs text-text-secondary">{t('community.noOffersYet')}</p>}
          {offers.map((o) => (
            <OfferRow key={o.id} offer={o} />
          ))}
        </div>
      )}

      {request.status === 'active' && (
        <button onClick={() => onCancel(request.id)} className="text-sm font-semibold text-danger">
          {t('community.cancelRequest')}
        </button>
      )}
    </div>
  )
}

export default function MyTripRequestsPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { user } = useAuth()
  const [requests, setRequests] = useState<TripRequest[]>([])
  const STATUS_CONFIG = getStatusConfig(t)

  useEffect(() => {
    if (!user) return
    return subscribeMyTripRequests(user.uid, setRequests)
  }, [user])

  async function handleCancel(id: string) {
    if (!confirm(t('community.confirmCancel'))) return
    await cancelTripRequest(id)
  }

  return (
    <div className="min-h-screen bg-bg pb-24">
      <header className="flex items-center justify-between border-b border-border bg-card px-4 py-4">
        <h1 className="text-lg font-bold text-text-primary">{t('community.myRequests')}</h1>
        <button onClick={() => navigate('/community/new-request')} className="flex items-center gap-1 text-sm font-semibold text-primary">
          <PlusCircle size={16} /> {t('community.requestTripTitle')}
        </button>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6">
        {requests.length === 0 && (
          <div className="flex flex-col items-center py-16 text-center">
            <p className="mb-4 text-text-secondary">{t('community.noMyRequestsYet')}</p>
            <button
              onClick={() => navigate('/community/new-request')}
              className="rounded-xl bg-gradient-to-l from-primary to-secondary px-6 py-2.5 text-sm font-semibold text-white"
            >
              {t('community.goPostRequest')}
            </button>
          </div>
        )}

        {requests.map((r) => (
          <RequestWithOffers key={r.id} request={r} statusConfig={STATUS_CONFIG} onCancel={handleCancel} />
        ))}
      </main>

      <BottomNav />
    </div>
  )
}
