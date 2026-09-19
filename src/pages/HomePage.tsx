import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '../components/ui/Button'
import { BottomNav } from '../components/BottomNav'
import { TripCard } from '../components/TripCard'
import { useAuth } from '../contexts/useAuth'
import { subscribeUnreadCount } from '../lib/notifications'
import { subscribeAvailableTrips, subscribeCompletedTripsCount } from '../lib/trips'
import type { Trip } from '../types/trip'
import { Animated3DCar } from '../components/Animated3DCar'
import { Users2, Bell, MapPin, ArrowLeftRight, Users, Search, CarFront, Siren, ExternalLink, Handshake, CalendarDays, Clock3, ArrowLeft } from 'lucide-react'
import { fetchAppSettings } from '../lib/admin'
import { subscribeDriverStatus } from '../lib/driverActions'
import { useCountry } from '../hooks/useCountry'
import { subscribeActiveTripRequests } from '../lib/tripRequests'
import type { TripRequest } from '../types/tripRequest'

const GOVERNORATES = [
  'القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'البحر الأحمر', 'البحيرة',
  'الفيوم', 'الغربية', 'الإسماعيلية', 'المنوفية', 'المنيا', 'القليوبية',
  'الوادي الجديد', 'السويس', 'أسوان', 'أسيوط', 'بني سويف', 'بورسعيد',
  'دمياط', 'الشرقية', 'جنوب سيناء', 'كفر الشيخ', 'مطروح', 'الأقصر',
  'قنا', 'شمال سيناء', 'سوهاج',
]

export default function HomePage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { user, logout } = useAuth()
  const [country] = useCountry()
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [seats, setSeats] = useState(1)
  const [unread, setUnread] = useState(0)
  const [availableTrips, setAvailableTrips] = useState<Trip[]>([])
  const [tripsLoading, setTripsLoading] = useState(true)
  const [tripRequests, setTripRequests] = useState<TripRequest[]>([])
  const [requestsLoading, setRequestsLoading] = useState(true)
  const [completedCount, setCompletedCount] = useState(0)
  const [driverStatus, setDriverStatus] = useState<string | null>(null)
  const [services, setServices] = useState({
    emergencyTitle: 'الإنقاذ السريع',
    emergencySubtitle: 'اطلب سيارة إنقاذ من مكانك',
    emergencyLogoUrl: '',
    emergencyActionUrl: '',
    partners: [] as { name: string; logoUrl: string; url: string }[],
  })

  useEffect(() => {
    return subscribeCompletedTripsCount(setCompletedCount)
  }, [])

  useEffect(() => {
    fetchAppSettings().then((settings) => {
      setServices({
        emergencyTitle: settings.emergencyTitle,
        emergencySubtitle: settings.emergencySubtitle,
        emergencyLogoUrl: settings.emergencyLogoUrl,
        emergencyActionUrl: settings.emergencyActionUrl,
        partners: [1, 2, 3, 4, 5].map((number) => ({
          name: settings[`partner${number}Name` as keyof typeof settings] as string,
          logoUrl: settings[`partner${number}LogoUrl` as keyof typeof settings] as string,
          url: settings[`partner${number}Url` as keyof typeof settings] as string,
        })).filter((partner) => partner.name),
      })
    }).catch(() => undefined)
  }, [])

  useEffect(() => {
    if (!user) return
    return subscribeUnreadCount(user.uid, setUnread)
  }, [user])

  useEffect(() => {
    if (!user) return
    return subscribeDriverStatus(user.uid, setDriverStatus)
  }, [user])

  function openDriverFlow() {
    if (driverStatus === 'approved') navigate('/driver/create-trip')
    else if (driverStatus === 'pending') navigate('/driver/pending-approval')
    else navigate('/driver/documents')
  }

  useEffect(() => {
    if (!user) return
    setTripsLoading(true)
    const unsubscribe = subscribeAvailableTrips(user.gender, country, (trips: Trip[]) => {
      setAvailableTrips(trips)
      setTripsLoading(false)
    })
    return unsubscribe
  }, [country, user])

  useEffect(() => {
    setRequestsLoading(true)
    return subscribeActiveTripRequests(country, (requests) => {
      setTripRequests(requests.slice(0, 6))
      setRequestsLoading(false)
    }, 6)
  }, [country])

  function handleSearch() {
    if (!origin || !destination) return
    navigate(`/search?from=${encodeURIComponent(origin)}&to=${encodeURIComponent(destination)}&seats=${seats}`)
  }

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/8 bg-card/92 px-4 py-3 shadow-lg backdrop-blur-xl lg:hidden">
        <div className="flex items-center gap-2">
          <img src={`${import.meta.env.BASE_URL}logo.jpeg`} alt="مسافر" className="h-11 w-11 rounded-2xl object-cover shadow-md" />
          <h1 className="text-xl font-bold text-primary">مسافر</h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/notifications')} className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-bg/45 transition active:scale-95">
            <Bell size={22} className="text-text-secondary" />
            {unread > 0 && (
              <span className="absolute -left-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] text-white">
                {unread}
              </span>
            )}
          </button>
          <span className="max-w-24 truncate text-sm font-semibold text-text-primary">{user?.fullName}</span>
          <button onClick={() => logout()} className="rounded-lg bg-danger/10 px-2 py-1.5 text-xs font-semibold text-danger">
            خروج
          </button>
        </div>
      </header>

      <div className="bg-gradient-to-br from-primary to-secondary px-4 pb-16 pt-8 text-white">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-1 text-2xl font-bold">{t('home.whereTo')}</h2>
          <p className="text-sm text-white/70">{t('home.heroSubtitle')}</p>
          {completedCount >= 5 && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-card/15 px-4 py-2 backdrop-blur-sm">
              <Users2 size={16} />
              <span className="text-sm font-semibold">أكتر من {completedCount} رحلة اتعملت على مسافر</span>
            </div>
          )}
        </div>
      </div>

      <main className="mx-auto grid w-full max-w-7xl gap-8 px-4 pb-24 pt-6 lg:grid-cols-[minmax(360px,460px)_minmax(0,1fr)] lg:items-start">
        <section className="-mt-16 lg:sticky lg:top-24">

        <div className="app-surface flex flex-col gap-3 rounded-3xl p-5">
          <div className="relative">
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-text-primary">
                <span className="icon-chip"><MapPin size={15} /></span> {t('search.from')}
              </label>
              <select
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full rounded-xl border-2 border-border bg-bg px-4 py-3.5 text-base transition focus:border-primary focus:outline-none"
              >
                <option value="">{t('search.selectGovernorate')}</option>
                {GOVERNORATES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => {
                const o = origin
                setOrigin(destination)
                setDestination(o)
              }}
              aria-label={t('search.swap')}
              className="absolute left-1/2 top-full z-10 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-border bg-card text-primary shadow-sm transition hover:border-primary"
            >
              <ArrowLeftRight size={14} className="rotate-90" />
            </button>
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-text-primary">
              <span className="icon-chip"><MapPin size={15} /></span> {t('search.to')}
            </label>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full rounded-xl border-2 border-border bg-bg px-4 py-3.5 text-base transition focus:border-primary focus:outline-none"
            >
              <option value="">{t('search.selectGovernorate')}</option>
              {GOVERNORATES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between rounded-xl border-2 border-border bg-bg px-4 py-3">
            <span className="flex items-center gap-1.5 text-sm font-semibold text-text-primary">
              <span className="icon-chip"><Users size={15} /></span> {t('search.passengers')}
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSeats((s) => Math.max(1, s - 1))}
                className="h-8 w-8 rounded-full border border-border text-lg transition hover:border-primary"
              >
                −
              </button>
              <span className="w-4 text-center font-semibold">{seats}</span>
              <button
                onClick={() => setSeats((s) => Math.min(8, s + 1))}
                className="h-8 w-8 rounded-full border border-border text-lg transition hover:border-primary"
              >
                +
              </button>
            </div>
          </div>

          <Button onClick={handleSearch} disabled={!origin || !destination} icon={<Search size={18} />}>
            {t('search.searchButton')}
          </Button>
        </div>

        {/* ---- قسم "رايح فين؟" - مدخل واضح لمجتمع الرحلات (طلب/عرض) ---- */}
        <div className="app-surface mt-6 rounded-3xl p-5">
          <h2 className="mb-4 text-lg font-bold text-text-primary">{t('community.whereTo')}</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/community/new-request')}
              className="group flex flex-col items-center gap-3 rounded-2xl border border-border bg-bg/30 py-5 transition-all hover:-translate-y-0.5 hover:border-primary hover:bg-primary/8"
            >
              <span className="action-icon"><Search size={25} /></span>
              <span className="text-sm font-semibold text-text-primary">{t('community.searchForTrip')}</span>
            </button>
            <button
              onClick={openDriverFlow}
              className="group flex flex-col items-center gap-3 rounded-2xl border border-border bg-bg/30 py-5 transition-all hover:-translate-y-0.5 hover:border-primary hover:bg-primary/8"
            >
              <span className="action-icon"><CarFront size={25} /></span>
              <span className="text-sm font-semibold text-text-primary">{t('community.iAmGoingHaveSeats')}</span>
            </button>
          </div>
        </div>

        <button
          onClick={() => services.emergencyActionUrl ? window.open(services.emergencyActionUrl, '_blank', 'noopener,noreferrer') : navigate('/support')}
          className="group mt-6 flex w-full items-center gap-4 overflow-hidden rounded-3xl border border-danger/35 bg-gradient-to-l from-danger/20 via-card to-card p-4 text-right shadow-[0_14px_35px_rgba(239,68,68,.12)] transition hover:border-danger/70"
        >
          <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-danger/30 bg-danger/15 text-danger">
            {services.emergencyLogoUrl ? <img src={services.emergencyLogoUrl} alt={services.emergencyTitle} className="h-full w-full object-contain p-1" /> : <Siren size={28} />}
          </span>
          <span className="min-w-0 flex-1"><strong className="block text-base text-danger">{services.emergencyTitle}</strong><small className="mt-1 block text-text-secondary">{services.emergencySubtitle}</small></span>
          <ExternalLink size={19} className="shrink-0 text-danger transition group-hover:scale-110" />
        </button>
        </section>

        <section className="min-w-0">
        <h2 className="mb-4 text-xl font-bold text-text-primary">{t('home.availableTripsNow')}</h2>

        {(tripsLoading || requestsLoading) && (
          <div className="grid gap-4 xl:grid-cols-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 animate-pulse rounded-2xl bg-card" />
            ))}
          </div>
        )}

        {!tripsLoading && !requestsLoading && availableTrips.length === 0 && tripRequests.length === 0 && (
          <div className="flex flex-col items-center py-6">
            <Animated3DCar size={110} />
            <p className="mt-2 text-text-secondary">{t('home.noTripsNow')}</p>
          </div>
        )}

        {!tripsLoading && availableTrips.length > 0 && (
          <div className="grid gap-4 xl:grid-cols-2">{availableTrips.map((trip) => <TripCard key={trip.id} trip={trip} />)}</div>
        )}

        {!requestsLoading && tripRequests.length > 0 && (
          <div className={availableTrips.length > 0 ? 'mt-7' : ''}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-text-primary">طلبات ركاب متاحة</h3>
                <p className="text-xs text-text-secondary">ركاب محتاجين عربية على نفس الطريق</p>
              </div>
              <button onClick={() => navigate('/community')} className="flex items-center gap-1 text-sm font-semibold text-primary">
                عرض الكل <ArrowLeft size={16} />
              </button>
            </div>
            <div className="grid gap-4 xl:grid-cols-2">
              {tripRequests.map((request) => (
                <button
                  key={request.id}
                  onClick={() => navigate('/community')}
                  className="app-surface w-full rounded-2xl p-4 text-right transition hover:-translate-y-0.5 hover:border-primary"
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">طلب راكب</span>
                    <span className="flex items-center gap-1 text-xs text-text-secondary"><Users size={14} /> {request.seatsNeeded} مقعد</span>
                  </div>
                  <p className="text-lg font-bold text-text-primary">{request.originCity} ← {request.destinationCity}</p>
                  <div className="mt-3 flex flex-wrap gap-3 text-sm text-text-secondary">
                    <span className="flex items-center gap-1"><CalendarDays size={15} /> {request.travelDate}</span>
                    {request.preferredTime && <span className="flex items-center gap-1"><Clock3 size={15} /> {request.preferredTime}</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        </section>
      </main>

      {services.partners.length > 0 && (
        <section className="mx-auto w-full max-w-7xl px-4 pb-28 lg:pb-10">
          <div className="app-surface rounded-3xl p-5">
            <div className="mb-4 flex items-center gap-2"><span className="icon-chip"><Handshake size={16} /></span><h2 className="font-bold text-text-primary">رعاة وشركاء مسافر</h2></div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {services.partners.map((partner, index) => {
                const partnerContent = <><span className="flex h-14 w-full items-center justify-center overflow-hidden rounded-xl bg-white/[0.04] p-2">{partner.logoUrl ? <img src={partner.logoUrl} alt={partner.name} className="h-full max-w-full object-contain" /> : <span className="text-center font-bold text-text-primary">{partner.name}</span>}</span>{partner.logoUrl && <span className="mt-2 block truncate text-xs font-semibold text-text-secondary">{partner.name}</span>}</>
                return partner.url ? <a key={`${partner.name}-${index}`} href={partner.url} target="_blank" rel="noreferrer" className="rounded-2xl border border-border bg-bg/35 p-2 text-center transition hover:-translate-y-0.5 hover:border-primary">{partnerContent}</a> : <div key={`${partner.name}-${index}`} className="rounded-2xl border border-border bg-bg/35 p-2 text-center">{partnerContent}</div>
              })}
            </div>
          </div>
        </section>
      )}
      <BottomNav />
    </div>
  )
}
