import { useNavigate } from 'react-router-dom'
import {
  ShieldCheck,
  Tag,
  Zap,
  Users2,
  UserRound,
  CarFront,
  Bus,
  Truck,
  MapPin,
  Calendar,
  Search,
  Navigation2,
  Wallet,
  Headphones,
  MessageCircle,
  ExternalLink,
  Phone,
  Mail,
  MapPinned,
  Plus,
  Minus,
  ArrowLeftRight,
  Star,
  ChevronDown,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { Button } from '../components/ui/Button'
import { fetchAppSettings } from '../lib/admin'
import { subscribePublicTrips } from '../lib/trips'
import { fetchTopTestimonials } from '../lib/ratings'
import { fetchFaqItems } from '../lib/pages'
import type { Trip } from '../types/trip'
import { useTranslation } from 'react-i18next'
import { changeLanguage } from '../lib/i18n'
import { useCountry } from '../hooks/useCountry'
import { CountrySelector } from '../components/CountrySelector'
import { Globe } from 'lucide-react'

const FEATURES = [
  { icon: UserRound, title: 'سائقات للسيدات', desc: 'رحلات آمنة ومريحة بقيادة سيدات' },
  { icon: Users2, title: 'رحلات مشتركة', desc: 'شارك الرحلة وقلل تكلفة السفر' },
  { icon: Navigation2, title: 'تتبّع مباشر', desc: 'تابع رحلتك لحظة بلحظة حتى الوصول' },
  { icon: Wallet, title: 'دفع آمن', desc: 'طرق دفع متعددة محلية وآمنة' },
  { icon: Headphones, title: 'دعم على مدار الساعة', desc: 'فريق دعم متاح لمساعدتك في أي وقت' },
]

const VEHICLE_TYPES = [
  { icon: CarFront, title: 'سيارة خاصة', desc: 'راحة وخصوصية' },
  { icon: Truck, title: 'ميكروباص', desc: 'رحلات جماعية صغيرة' },
  { icon: Bus, title: 'أتوبيس', desc: 'رحلات مريحة وآمنة' },
  { icon: UserRound, title: 'سائقة للسيدات', desc: 'أمان وخصوصية تامة' },
]

const STAT_ICONS = [
  { label: 'سائق معتمد', icon: UserRound, key: 'drivers' as const },
  { label: 'رحلة مكتملة', icon: CarFront, key: 'trips' as const },
  { label: 'مستخدم سعيد', icon: Users2, key: 'users' as const },
  { label: 'محافظة', icon: MapPinned, key: 'cities' as const },
]

const NAV_LINKS = [
  { label: 'الرئيسية', href: '#home' },
  { label: 'كيف تعمل', href: '/how-it-works' },
  { label: 'الرحلات', href: '#trips' },
  { label: 'للسائقين', href: '#driver-cta' },
  { label: 'تواصل معنا', href: '/page/contact' },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const [country, setCountry] = useCountry()
  const [seats, setSeats] = useState(1)
  const [tripTab, setTripTab] = useState<'رحلة واحدة' | 'رحلة ذهاب وعودة' | 'رحلات متعددة'>('رحلة واحدة')

  const [swapAnimating, setSwapAnimating] = useState(false)
  const [trips, setTrips] = useState<Trip[]>([])
  const [tripsLoading, setTripsLoading] = useState(true)

  useEffect(() => {
    setTripsLoading(true)
    return subscribePublicTrips(country, (data) => {
      setTrips(data)
      setTripsLoading(false)
    })
  }, [country])


  function swapLocations() {
    setSwapAnimating(true)
    setTimeout(() => setSwapAnimating(false), 300)
    // الحقول لسه شكلية في صفحة الهبوط (المستخدم لازم يسجّل دخول قبل
    // ما يقدر يبحث فعليًا) - الزرار هنا بصري بس دلوقتي، هيشتغل حقيقي
    // لما نضيف حقول اختيار فعلية بدل placeholders
  }
  const [heroImageUrl, setHeroImageUrl] = useState(`${import.meta.env.BASE_URL}hero-clean.png`)
  const [heroTitle, setHeroTitle] = useState('سافر بسهولة..\nواحجز مكانك في ثواني')
  const [heroSubtitle, setHeroSubtitle] = useState('رحلات آمنة ومريحة بين محافظات مصر')
  const [stats, setStats] = useState({ drivers: '+500', trips: '+50K', users: '+100K', cities: '+27' })
  const [testimonials, setTestimonials] = useState<{ id: string; stars: number; comment: string }[]>([])
  const [faqItems, setFaqItems] = useState<{ question: string; answer: string }[]>([])
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  useEffect(() => {
    fetchTopTestimonials().then(setTestimonials)
    fetchFaqItems().then((items) => setFaqItems(items.slice(0, 4)))
  }, [])
  const [socials, setSocials] = useState({
    whatsapp: '',
    facebook: '',
    instagram: '',
    tiktok: '',
    youtube: '',
    phone: '',
    email: '',
    address: 'القاهرة - مصر',
  })

  useEffect(() => {
    fetchAppSettings()
      .then((s) => {
        if (s.heroImageUrl) setHeroImageUrl(s.heroImageUrl)
        if (s.heroTitle) setHeroTitle(s.heroTitle)
        if (s.heroSubtitle) setHeroSubtitle(s.heroSubtitle)
        setStats({ drivers: s.statDrivers, trips: s.statTrips, users: s.statUsers, cities: s.statCities })
        setSocials({
          whatsapp: s.whatsappNumber,
          facebook: s.facebookUrl,
          instagram: s.instagramUrl,
          tiktok: s.tiktokUrl,
          youtube: s.youtubeUrl,
          phone: s.contactPhone,
          email: s.contactEmail,
          address: s.contactAddress || 'القاهرة - مصر',
        })
      })
      .catch(() => {
        // لو فشل، بتفضل القيم الافتراضية زي ما هي
      })
  }, [])

  return (
    <div className="min-h-screen bg-tertiary text-white">
      {/* ---- Navbar ---- */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-tertiary/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <img src={`${import.meta.env.BASE_URL}logo.jpeg`} alt="مسافر" className="h-11 w-11 rounded-xl object-cover" />
            <div className="hidden sm:block">
              <p className="text-lg font-bold leading-tight">MOSAFER</p>
              <p className="-mt-1 text-xs text-white/60">مسافر</p>
            </div>
          </div>

          <nav className="hidden items-center gap-6 text-sm text-white/80 lg:flex">
            {NAV_LINKS.map((link, i) => {
              const isRoute = link.href.startsWith('/')
              const className =
                i === 0
                  ? 'relative pb-1 font-semibold text-white after:absolute after:bottom-0 after:right-0 after:h-0.5 after:w-full after:rounded-full after:bg-gradient-to-l after:from-primary after:to-secondary'
                  : 'hover:text-white transition-colors'

              // روابط "#section" لازم تنزل للقسم بجافاسكريبت مباشرة، مش
              // بـ href عادي، لأن علامة # بقت متحجزة لنظام التنقّل
              // (Hash Router) بعد ما حوّلنا ليه عشان مشكلة الـ 404
              function handleClick() {
                if (isRoute) {
                  navigate(link.href)
                  return
                }
                const id = link.href.replace('#', '')
                document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
              }

              return (
                <button key={link.label} onClick={handleClick} className={className}>
                  {link.label}
                </button>
              )
            })}
          </nav>

          <div className="flex items-center gap-2">
            <CountrySelector value={country} onChange={setCountry} variant="dark" />
            <button
              onClick={() => changeLanguage(i18n.language === 'ar' ? 'en' : 'ar')}
              className="flex items-center gap-1 rounded-full border border-white/20 px-3 py-1.5 text-sm font-semibold text-white/80 hover:text-white"
              aria-label="تغيير اللغة"
            >
              <Globe size={14} />
              {i18n.language === 'ar' ? 'EN' : 'عربي'}
            </button>
            <button
              onClick={() => navigate('/login')}
              className="rounded-xl border-2 border-white/30 px-4 py-2 text-sm font-semibold"
            >
              {t('nav.login')}
            </button>
            <button
              onClick={() => navigate('/role-selection')}
              className="rounded-xl bg-gradient-to-l from-primary to-secondary px-4 py-2 text-sm font-semibold shadow-lg shadow-primary/30"
            >
              {t('nav.signup')}
            </button>
          </div>
        </div>
      </header>

      {/* ---- Hero ---- */}
      <section id="home" className="relative scroll-mt-20 min-h-[560px] overflow-hidden bg-tertiary sm:min-h-[640px]">
        {/* الصورة النضيفة - ممتدة كخلفية كاملة بارتفاع كافي عشان تبان كاملة */}
        <img
          src={heroImageUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: 'center 30%' }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-tertiary/70 via-tertiary/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-tertiary via-transparent to-transparent" />

        <div className="relative flex min-h-[420px] flex-col justify-center px-5 pt-14 sm:min-h-[480px] sm:px-10 sm:pt-20 lg:px-16">
          <div className="max-w-xl mr-auto">
            <h1 className="mb-4 whitespace-pre-line text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-6xl">
              {i18n.language === 'ar' ? heroTitle : `${t('hero.titleLine1')}\n${t('hero.titleLine2')}`}
            </h1>
            <p className="mb-6 text-lg text-white/85">{i18n.language === 'ar' ? heroSubtitle : t('hero.subtitle')}</p>

            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
              <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-white/90">
                <Tag size={15} className="text-secondary" /> أسعار عادلة
              </span>
              <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-white/90">
                <Zap size={15} className="text-secondary" /> سريع
              </span>
              <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-white/90">
                <ShieldCheck size={15} className="text-secondary" /> آمن
              </span>
            </div>

            {/* حمل التطبيق - اتشال بناءً على طلب صاحب المشروع */}
          </div>
        </div>

        {/* ---- شريط البحث - رفيع ومدمج، مسحوب لأعلى شوية عشان يبان
        ملزّق تحت حافة الصورة مباشرة زي المرجع، مش صندوق كبير فاضي ---- */}
        <div className="relative z-10 mx-auto mt-4 max-w-6xl px-4 pb-10 sm:mt-6">
          <div className="rounded-2xl border border-white/10 bg-card p-3 text-text-primary shadow-lg sm:p-4">
            {/* تابات نوع الرحلة - "رحلة واحدة" هي الوحيدة المدعومة فعليًا
            في النظام حاليًا، فالتابين التانيين معطّلين بوضوح "قريبًا" */}
            <div className="mb-3 flex flex-wrap gap-2">
              {(['رحلة واحدة', 'رحلة ذهاب وعودة', 'رحلات متعددة'] as const).map((tab) => {
                const isComingSoon = tab !== 'رحلة واحدة'
                return (
                  <button
                    key={tab}
                    onClick={() => !isComingSoon && setTripTab(tab)}
                    disabled={isComingSoon}
                    className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition ${
                      tripTab === tab
                        ? 'bg-gradient-to-l from-primary to-secondary text-white'
                        : isComingSoon
                          ? 'cursor-not-allowed text-text-secondary/40'
                          : 'text-text-secondary'
                    }`}
                  >
                    {tab}
                    {isComingSoon && <span className="text-[9px]">(قريبًا)</span>}
                  </button>
                )
              })}
            </div>

            <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
              <div className="order-last lg:order-first lg:w-44">
                <Button
                  onClick={() => navigate('/login')}
                  icon={<Search size={16} />}
                  className="!bg-gradient-to-l !from-primary !to-secondary !py-3 !shadow-md"
                >
                  ابحث عن رحلة
                </Button>
              </div>

              <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-[1fr_auto_1fr_1fr_1fr]">
                <div className="rounded-xl border border-border bg-tertiary px-3 py-2.5 transition hover:border-primary">
                  <p className="mb-0.5 flex items-center gap-1 text-[11px] font-semibold text-text-secondary">
                    <MapPin size={11} className="text-primary" /> من
                  </p>
                  <p className="text-sm text-text-secondary">{t('landing.selectOrigin')}</p>
                </div>

                <button
                  onClick={swapLocations}
                  className={`mx-auto hidden h-9 w-9 items-center justify-center rounded-full border border-border bg-tertiary text-primary shadow-sm transition-transform duration-300 hover:border-primary lg:flex ${swapAnimating ? 'rotate-180' : ''}`}
                  aria-label={t('search.swap')}
                >
                  <ArrowLeftRight size={16} />
                </button>

                <div className="rounded-xl border border-border bg-tertiary px-3 py-2.5 transition hover:border-primary">
                  <p className="mb-0.5 flex items-center gap-1 text-[11px] font-semibold text-text-secondary">
                    <MapPin size={11} className="text-primary" /> إلى
                  </p>
                  <p className="text-sm text-text-secondary">{t('landing.selectDestination')}</p>
                </div>

                <div className="rounded-xl border border-border bg-tertiary px-3 py-2.5 transition hover:border-primary">
                  <p className="mb-0.5 flex items-center gap-1 text-[11px] font-semibold text-text-secondary">
                    <Calendar size={11} className="text-primary" /> تاريخ الرحلة
                  </p>
                  <p className="text-sm text-text-secondary">{t('landing.selectDate')}</p>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-border bg-tertiary px-2 py-2">
                  <button
                    onClick={() => setSeats((s) => Math.max(1, s - 1))}
                    className="flex h-6 w-6 items-center justify-center rounded-full border border-border text-text-secondary"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="text-sm font-semibold">{seats} راكب</span>
                  <button
                    onClick={() => setSeats((s) => Math.min(8, s + 1))}
                    className="flex h-6 w-6 items-center justify-center rounded-full border border-border text-text-secondary"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---- Why Mosafer: 3 خطوات بسيطة ---- */}
      <section className="border-t border-white/10 bg-tertiary py-14">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-8 text-center text-2xl font-bold sm:text-3xl">{t('landing.howMosaferHelps')}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { icon: MapPin, title: 'اختار رحلتك', desc: 'اختر المحافظة والوجهة والموعد المناسب' },
              { icon: CarFront, title: 'احجز مكانك', desc: 'اختار الرحلة والمقعد المناسب لك' },
              { icon: ShieldCheck, title: 'سافر بأمان', desc: 'تواصل مع السائق وتابع تفاصيل رحلتك' },
            ].map((step, i) => (
              <div key={step.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-primary">
                  <step.icon size={22} />
                </div>
                <p className="mb-1 text-xs font-semibold text-primary">{i + 1}</p>
                <p className="mb-1 font-semibold">{step.title}</p>
                <p className="text-sm text-white/60">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- الرحلات المتاحة دلوقتي - بيانات حقيقية بس، من غير أي بيانات وهمية ---- */}
      <section id="trips" className="scroll-mt-20 border-t border-white/10 bg-card py-14 text-text-primary">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-8 text-2xl font-bold sm:text-3xl">{t('landing.availableTripsNow')}</h2>

          {tripsLoading && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-40 animate-pulse rounded-2xl bg-bg" />
              ))}
            </div>
          )}

          {!tripsLoading && trips.length === 0 && (
            <div className="rounded-2xl border border-border bg-bg py-12 text-center">
              <p className="mb-1 font-semibold text-text-primary">{t('landing.noTripsNow')}</p>
              <p className="text-sm text-text-secondary">{t('landing.checkBackSoon')}</p>
            </div>
          )}

          {!tripsLoading && trips.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {trips.map((trip) => (
                <button
                  key={trip.id}
                  onClick={() => navigate('/login')}
                  className="rounded-2xl border border-border bg-bg p-5 text-right transition hover:-translate-y-0.5 hover:border-primary/40"
                >
                  <p className="mb-2 font-bold text-text-primary">
                    {trip.originCity} ← {trip.destinationCity}
                  </p>
                  <p className="mb-3 text-sm text-text-secondary">
                    {new Intl.DateTimeFormat('ar-EG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(
                      trip.departureTime,
                    )}
                  </p>
                  <div className="mb-3 flex flex-wrap gap-3 text-xs text-text-secondary">
                    <span>💺 {trip.availableSeats} مقاعد متاحة</span>
                    <span>💰 {trip.pricePerSeat.toFixed(0)} ج.م</span>
                  </div>
                  <span className="text-sm font-semibold text-primary">{t('landing.viewTrip')}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ---- Driver CTA ---- */}
      <section id="driver-cta" className="scroll-mt-20 border-t border-white/10 bg-gradient-to-l from-primary to-secondary py-14">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <h2 className="mb-2 text-2xl font-bold sm:text-3xl">{t('landing.driverCtaTitle')}</h2>
          <p className="mx-auto mb-6 max-w-md text-white/85">
            شارك رحلتك وساعد مسافرين تانيين وقلّل تكلفة مشوارك
          </p>
          <button
            onClick={() => navigate('/role-selection')}
            className="rounded-xl bg-white px-8 py-3.5 font-bold text-primary shadow-md transition hover:brightness-95"
          >
            أضف رحلة
          </button>
        </div>
      </section>

      <section id="features" className="scroll-mt-20 border-t border-white/10 bg-tertiary py-14">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center transition duration-300 [transform-style:preserve-3d] hover:[transform:perspective(600px)_translateY(-4px)_rotateX(4deg)] hover:border-white/20"
              >
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary">
                  <f.icon size={24} strokeWidth={2} />
                </div>
                <p className="mb-1 font-semibold">{f.title}</p>
                <p className="text-xs leading-relaxed text-white/60">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Vehicle Types / Services ---- */}
      <section id="services" className="scroll-mt-20 border-t border-white/10 bg-card py-16 text-text-primary">
        <div className="mx-auto max-w-6xl px-4">
          <p className="mb-1 text-sm font-bold text-primary">{t('landing.ourServices')}</p>
          <h2 className="mb-2 text-2xl font-bold sm:text-3xl">{t('landing.chooseVehicle')}</h2>
          <p className="mb-8 max-w-lg text-text-secondary">
            نوفر لك جميع وسائل النقل لتناسب احتياجاتك ومميزانيتك
          </p>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {VEHICLE_TYPES.map((v) => (
              <div
                key={v.title}
                className="group overflow-hidden rounded-2xl border border-border bg-bg text-center shadow-sm transition duration-300 [transform-style:preserve-3d] hover:[transform:perspective(600px)_translateY(-4px)_rotateX(4deg)] hover:shadow-lg"
              >
                <div className="flex h-24 items-center justify-center bg-gradient-to-br from-primary to-secondary">
                  <v.icon size={36} className="text-white transition group-hover:scale-110" strokeWidth={1.6} />
                </div>
                <div className="p-4">
                  <p className="font-semibold text-text-primary">{v.title}</p>
                  <p className="text-xs text-text-secondary">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Stats ---- */}
      <section className="border-t border-white/10 bg-card py-12">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-4 sm:grid-cols-4">
          {STAT_ICONS.map((s) => (
            <div key={s.label} className="flex flex-col items-center rounded-2xl border border-border bg-bg p-5 text-center">
              <s.icon size={22} className="mb-2 text-primary" />
              <p className="text-2xl font-bold text-text-primary">{stats[s.key]}</p>
              <p className="text-sm text-text-secondary">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---- آراء حقيقية من مستخدمين فعليين (تقييمات 4+ نجوم بتعليق) ---- */}
      {testimonials.length > 0 && (
        <section className="border-t border-white/10 bg-card py-14 text-text-primary">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="mb-8 text-center text-2xl font-bold sm:text-3xl">{t('landing.testimonials')}</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((t) => (
                <div
                  key={t.id}
                  className="rounded-2xl border border-border bg-bg p-5 transition duration-300 [transform-style:preserve-3d] hover:[transform:perspective(600px)_rotateX(3deg)_rotateY(-3deg)]"
                >
                  <div className="mb-2 flex gap-0.5 text-warning">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={14} fill={i < t.stars ? 'currentColor' : 'none'} />
                    ))}
                  </div>
                  <p className="text-sm text-text-secondary">"{t.comment}"</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---- أسئلة شائعة مختصرة ---- */}
      {faqItems.length > 0 && (
        <section className="border-t border-white/10 bg-tertiary py-14">
          <div className="mx-auto max-w-2xl px-4">
            <h2 className="mb-8 text-center text-2xl font-bold sm:text-3xl">{t('landing.faq')}</h2>
            <div className="flex flex-col gap-2">
              {faqItems.map((item, i) => (
                <div key={item.question} className="rounded-xl border border-white/10 bg-white/[0.03]">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="flex w-full items-center justify-between p-4 text-right font-semibold"
                  >
                    {item.question}
                    <ChevronDown size={18} className={`transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                  </button>
                  {openFaq === i && <p className="border-t border-white/10 p-4 text-sm text-white/70">{item.answer}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---- Footer ---- */}
      <footer className="border-t border-white/10 bg-tertiary py-12 text-white/70">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <img src={`${import.meta.env.BASE_URL}logo.jpeg`} alt="مسافر" className="h-9 w-9 rounded-lg object-cover" />
              <span className="font-bold text-white">مسافر</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {socials.whatsapp && (
                <a
                  href={`https://wa.me/${socials.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 transition hover:border-primary"
                >
                  <MessageCircle size={16} />
                </a>
              )}
              {[
                { url: socials.facebook, label: 'فيسبوك' },
                { url: socials.instagram, label: 'إنستجرام' },
                { url: socials.tiktok, label: 'تيك توك' },
                { url: socials.youtube, label: 'يوتيوب' },
              ]
                .filter((s) => s.url)
                .map((s) => (
                  <a
                    key={s.label}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 transition hover:border-primary"
                  >
                    <ExternalLink size={16} />
                  </a>
                ))}
            </div>
          </div>

          <div>
            <p className="mb-3 font-semibold text-white">{t('landing.quickLinks')}</p>
            <ul className="space-y-2 text-sm">
              <li>{t('landing.home')}</li>
              <li>{t('landing.aboutUs')}</li>
              <li>{t('landing.services')}</li>
            </ul>
          </div>

          <div>
            <p className="mb-3 font-semibold text-white">{t('landing.ourServices')}</p>
            <ul className="space-y-2 text-sm">
              <li>{t('landing.privateCar')}</li>
              <li>{t('landing.microbus')}</li>
              <li>{t('landing.bus')}</li>
              <li>{t('landing.womenDriver')}</li>
            </ul>
          </div>

          <div>
            <p className="mb-3 font-semibold text-white">{t('landing.contactUs')}</p>
            <ul className="space-y-2 text-sm">
              {socials.phone && (
                <li className="flex items-center gap-2">
                  <Phone size={14} /> <span dir="ltr">{socials.phone}</span>
                </li>
              )}
              {socials.email && (
                <li className="flex items-center gap-2">
                  <Mail size={14} /> {socials.email}
                </li>
              )}
              <li className="flex items-center gap-2">
                <MapPinned size={14} /> {socials.address}
              </li>
            </ul>
          </div>
        </div>

        <div className="mx-auto mt-8 max-w-6xl border-t border-white/10 px-4 pt-6 text-center text-xs text-white/50">
          جميع الحقوق محفوظة © {new Date().getFullYear()} مسافر
        </div>
      </footer>
    </div>
  )
}
