import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Search, PlusCircle, List, MapIcon, CarFront, Users, Route, UserRoundSearch } from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { useAuth } from '../contexts/useAuth'
import { useCountry } from '../hooks/useCountry'
import { subscribeActiveTripRequests } from '../lib/tripRequests'
import { REGION_COORDINATES } from '../lib/regionCoordinates'
import type { TripRequest } from '../types/tripRequest'
import { BottomNav } from '../components/BottomNav'
import { SendOfferModal } from '../components/SendOfferModal'
import { subscribeAvailableTrips } from '../lib/trips'
import type { Trip } from '../types/trip'
import { TripCard } from '../components/TripCard'
import { fetchUserProfile } from '../lib/users'
import type { AppUser } from '../types/user'

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
  const [passenger, setPassenger] = useState<AppUser | null>(null)

  const isOwnRequest = user?.uid === request.passengerId
  const isDriver = user?.role === 'driver'

  useEffect(() => {
    fetchUserProfile(request.passengerId).then(setPassenger).catch(() => setPassenger(null))
  }, [request.passengerId])

  return (
    <div className="mb-3 rounded-2xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-primary/30 bg-primary-light text-primary">
          {passenger?.profileImageUrl ? <img src={passenger.profileImageUrl} alt={passenger.fullName} className="h-full w-full object-cover" /> : <Users size={20} />}
        </span>
        <div className="min-w-0"><p className="truncate font-bold text-text-primary">{passenger?.fullName || 'راكب'}</p><p className="text-xs text-text-secondary">طالب رحلة</p></div>
      </div>
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
  const { user } = useAuth()
  const [country] = useCountry()
  const [requests, setRequests] = useState<TripRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [trips, setTrips] = useState<Trip[]>([])
  const [tripsLoading, setTripsLoading] = useState(true)
  const [view, setView] = useState<'list' | 'map'>('list')
  const [feedType, setFeedType] = useState<'requests' | 'trips'>('requests')

  useEffect(() => {
    setLoading(true)
    return subscribeActiveTripRequests(country, (data) => {
      setRequests(data)
      setLoading(false)
    })
  }, [country])

  useEffect(() => {
    if (!user) return
    setTripsLoading(true)
    return subscribeAvailableTrips(user.gender, country, (data) => {
      setTrips(data)
      setTripsLoading(false)
    }, 30)
  }, [country, user])

  return (
    <div className="min-h-screen bg-bg pb-24">
      <header className="border-b border-border bg-card px-4 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-text-primary">سوق الرحلات</h1>
          <p className="text-xs text-text-secondary">اطلب عربية أو احجز مكان في رحلة رايحة نفس طريقك</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/community/my-requests')} className="text-sm font-semibold text-text-secondary">
            {t('community.myRequests')}
          </button>
        </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-7xl gap-3 px-4 pt-6 sm:grid-cols-2">
        <button onClick={() => navigate('/community/new-request')} className="group flex items-center gap-3 rounded-2xl border border-primary/35 bg-gradient-to-l from-primary/15 to-card p-4 text-right transition hover:border-primary">
          <span className="action-icon !h-12 !w-12"><UserRoundSearch size={23} /></span>
          <span><strong className="block text-text-primary">أنا راكب ومحتاج عربية</strong><small className="text-text-secondary">انشر خط سيرك وعدد الركاب</small></span>
          <PlusCircle className="mr-auto text-primary" size={20} />
        </button>
        <button onClick={() => navigate(user?.role === 'driver' ? '/driver/create-trip' : '/role-selection')} className="group flex items-center gap-3 rounded-2xl border border-secondary/35 bg-gradient-to-l from-secondary/15 to-card p-4 text-right transition hover:border-secondary">
          <span className="action-icon !h-12 !w-12 !from-secondary"><CarFront size={23} /></span>
          <span><strong className="block text-text-primary">أنا سائق ومعايا مكان</strong><small className="text-text-secondary">انشر رحلتك والمقاعد المتاحة</small></span>
          <PlusCircle className="mr-auto text-secondary" size={20} />
        </button>
      </div>

      <div className="mx-auto mt-5 w-full max-w-7xl px-4">
      <div className="flex rounded-2xl border border-border bg-card/70 p-1.5">
        <button onClick={() => setFeedType('requests')} className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition ${feedType === 'requests' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-text-secondary'}`}>
          <Users size={18} /> طلبات الركاب <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs">{requests.length}</span>
        </button>
        <button onClick={() => { setFeedType('trips'); setView('list') }} className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition ${feedType === 'trips' ? 'bg-secondary text-white shadow-lg shadow-secondary/20' : 'text-text-secondary'}`}>
          <Route size={18} /> عروض السائقين <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs">{trips.length}</span>
        </button>
      </div>
      </div>

      {feedType === 'requests' && <div className="mx-auto flex w-full max-w-7xl gap-2 px-4 pt-4">
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
      </div>}

      <main className="mx-auto w-full max-w-7xl px-4 py-6">
        {feedType === 'requests' && loading && (
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 animate-pulse rounded-2xl bg-card" />
            ))}
          </div>
        )}

        {feedType === 'requests' && !loading && requests.length === 0 && (
          <div className="flex flex-col items-center py-16 text-center">
            <Search size={40} className="mb-3 text-text-secondary" />
            <p className="mb-1 font-semibold text-text-primary">{t('community.noRequestsYet')}</p>
            <p className="text-sm text-text-secondary">{t('community.beFirstToPost')}</p>
          </div>
        )}

        {feedType === 'requests' && !loading && requests.length > 0 && view === 'list' && <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">{requests.map((r) => <RequestCard key={r.id} request={r} />)}</div>}

        {feedType === 'requests' && !loading && requests.length > 0 && view === 'map' && (
          <div className="overflow-hidden rounded-2xl border border-border" style={{ height: 'min(68vh, 680px)' }}>
            <MapContainer center={[26.8, 30.8]} zoom={country === 'saudi' ? 5 : 6} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
              {requests.map((request) => {
                const coords = request.originLat != null && request.originLng != null
                  ? { lat: request.originLat, lng: request.originLng }
                  : REGION_COORDINATES[request.originCity]
                if (!coords) return null
                return (
                  <Marker key={request.id} position={[coords.lat, coords.lng]} icon={requestMarkerIcon(1)}>
                    <Popup>
                      <p className="mb-1 font-bold">{request.originCity} → {request.destinationCity}</p>
                        <p className="text-xs">
                          {new Intl.DateTimeFormat(i18n.language === 'ar' ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'short' }).format(
                            new Date(request.travelDate),
                          )}
                        </p>
                    </Popup>
                  </Marker>
                )
              })}
            </MapContainer>
          </div>
        )}

        {feedType === 'trips' && tripsLoading && <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">{[1, 2, 3].map((i) => <div key={i} className="h-56 animate-pulse rounded-2xl bg-card" />)}</div>}
        {feedType === 'trips' && !tripsLoading && trips.length === 0 && (
          <div className="flex flex-col items-center py-16 text-center"><CarFront size={44} className="mb-3 text-text-secondary" /><p className="font-bold text-text-primary">مفيش رحلات متاحة دلوقتي</p><p className="mt-1 text-sm text-text-secondary">أول سائق ينشر رحلة هتظهر هنا فورًا</p></div>
        )}
        {feedType === 'trips' && !tripsLoading && trips.length > 0 && <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">{trips.map((trip) => <TripCard key={trip.id} trip={trip} />)}</div>}
      </main>

      <BottomNav />
    </div>
  )
}
