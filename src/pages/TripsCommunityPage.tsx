import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Search, PlusCircle, List, MapIcon } from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { useAuth } from '../contexts/useAuth'
import { useCountry } from '../hooks/useCountry'
import { subscribeActiveTripRequests } from '../lib/tripRequests'
import { REGION_COORDINATES } from '../lib/regionCoordinates'
import type { TripRequest } from '../types/tripRequest'
import { BottomNav } from '../components/BottomNav'
import { SendOfferModal } from '../components/SendOfferModal'

function requestMarkerIcon(count: number) {
  return new L.DivIcon({
    html: `<div style="background:#1E40AF;color:white;width:${count > 1 ? 38 : 30}px;height:${
      count > 1 ? 38 : 30
    }px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:13px">${count}</div>`,
    className: '',
    iconSize: [count > 1 ? 38 : 30, count > 1 ? 38 : 30],
    iconAnchor: [count > 1 ? 19 : 15, count > 1 ? 19 : 15],
  })
}

function RequestCard({ request }: { request: TripRequest }) {
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  const [showOfferModal, setShowOfferModal] = useState(false)

  const isOwnRequest = user?.uid === request.passengerId
  const isDriver = user?.role === 'driver'

  return (
    <div className="mb-3 rounded-2xl border border-border bg-card p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="rounded-full bg-primary-light px-2 py-0.5 text-xs font-semibold text-primary">
          {t('community.lookingForTrip')}
        </span>
        <span className="text-xs text-text-secondary">
          {new Intl.DateTimeFormat(i18n.language === 'ar' ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'short' }).format(
            new Date(request.travelDate),
          )}
        </span>
      </div>
      <p className="mb-2 text-lg font-bold text-text-primary">
        {request.originCity} → {request.destinationCity}
      </p>
      <div className="mb-3 flex flex-wrap gap-3 text-sm text-text-secondary">
        {request.preferredTime && <span>🕐 {request.preferredTime}</span>}
        <span>👥 {request.seatsNeeded} {t('bookings.seatsCount')}</span>
      </div>
      {request.notes && <p className="mb-3 text-sm text-text-secondary">"{request.notes}"</p>}

      {!isOwnRequest && isDriver && (
        <button
          onClick={() => setShowOfferModal(true)}
          className="w-full rounded-xl bg-gradient-to-l from-primary to-secondary py-2.5 text-sm font-semibold text-white"
        >
          {t('community.iHaveTrip')}
        </button>
      )}

      {showOfferModal && <SendOfferModal request={request} onClose={() => setShowOfferModal(false)} />}
    </div>
  )
}

export default function TripsCommunityPage() {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const [country] = useCountry()
  const [requests, setRequests] = useState<TripRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'list' | 'map'>('list')

  useEffect(() => {
    setLoading(true)
    return subscribeActiveTripRequests(country, (data) => {
      setRequests(data)
      setLoading(false)
    })
  }, [country])

  // نجمّع الطلبات حسب مدينة الانطلاق عشان نعرض علامة واحدة لكل مدينة
  // على الخريطة (مش تكديس علامات فوق بعض لو أكتر من طلب من نفس المكان)
  const groupedByOrigin = requests.reduce<Record<string, TripRequest[]>>((acc, r) => {
    acc[r.originCity] = acc[r.originCity] ? [...acc[r.originCity], r] : [r]
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-bg pb-24">
      <header className="flex items-center justify-between border-b border-border bg-card px-4 py-4">
        <h1 className="text-lg font-bold text-text-primary">{t('community.title')}</h1>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/community/my-requests')} className="text-sm font-semibold text-text-secondary">
            {t('community.myRequests')}
          </button>
          <button onClick={() => navigate('/community/new-request')} className="flex items-center gap-1 text-sm font-semibold text-primary">
            <PlusCircle size={16} /> {t('community.requestTripTitle')}
          </button>
        </div>
      </header>

      <div className="mx-auto flex max-w-lg gap-2 px-4 pt-4">
        <button
          onClick={() => setView('list')}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border-2 py-2 text-sm font-semibold ${
            view === 'list' ? 'border-primary bg-primary-light text-primary' : 'border-border text-text-secondary'
          }`}
        >
          <List size={16} /> {t('community.listView')}
        </button>
        <button
          onClick={() => setView('map')}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border-2 py-2 text-sm font-semibold ${
            view === 'map' ? 'border-primary bg-primary-light text-primary' : 'border-border text-text-secondary'
          }`}
        >
          <MapIcon size={16} /> {t('community.mapView')}
        </button>
      </div>

      <main className="mx-auto max-w-lg px-4 py-6">
        {loading && (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 animate-pulse rounded-2xl bg-card" />
            ))}
          </div>
        )}

        {!loading && requests.length === 0 && (
          <div className="flex flex-col items-center py-16 text-center">
            <Search size={40} className="mb-3 text-text-secondary" />
            <p className="mb-1 font-semibold text-text-primary">{t('community.noRequestsYet')}</p>
            <p className="text-sm text-text-secondary">{t('community.beFirstToPost')}</p>
          </div>
        )}

        {!loading && requests.length > 0 && view === 'list' && requests.map((r) => <RequestCard key={r.id} request={r} />)}

        {!loading && requests.length > 0 && view === 'map' && (
          <div className="overflow-hidden rounded-2xl border border-border" style={{ height: 420 }}>
            <MapContainer center={[26.8, 30.8]} zoom={country === 'saudi' ? 5 : 6} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
              {Object.entries(groupedByOrigin).map(([city, cityRequests]) => {
                const coords = REGION_COORDINATES[city]
                if (!coords) return null
                return (
                  <Marker key={city} position={[coords.lat, coords.lng]} icon={requestMarkerIcon(cityRequests.length)}>
                    <Popup>
                      <p className="mb-1 font-bold">{city}</p>
                      {cityRequests.map((r) => (
                        <p key={r.id} className="text-xs">
                          → {r.destinationCity} ·{' '}
                          {new Intl.DateTimeFormat(i18n.language === 'ar' ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'short' }).format(
                            new Date(r.travelDate),
                          )}
                        </p>
                      ))}
                    </Popup>
                  </Marker>
                )
              })}
            </MapContainer>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
