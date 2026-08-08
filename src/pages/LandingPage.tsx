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
  Share2,
  MessageCircle,
  Phone,
  Mail,
  MapPinned,
  Plus,
  Minus,
  ArrowLeftRight,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { Button } from '../components/ui/Button'
import { fetchAppSettings } from '../lib/admin'

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
  { label: 'عن مسافر', href: '/page/about' },
  { label: 'الخدمات', href: '#services' },
  { label: 'رحلات مشتركة', href: '#features' },
  { label: 'الأسعار', href: '#services' },
  { label: 'تواصل معنا', href: '/page/contact' },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const [seats, setSeats] = useState(1)
  const [tripTab, setTripTab] = useState<'رحلة واحدة' | 'رحلة ذهاب وعودة' | 'رحلات متعددة'>('رحلة واحدة')

  function swapLocations() {
    // الحقول لسه شكلية في صفحة الهبوط (المستخدم لازم يسجّل دخول قبل
    // ما يقدر يبحث فعليًا) - الزرار هنا بصري بس دلوقتي، هيشتغل حقيقي
    // لما نضيف حقول اختيار فعلية بدل placeholders
  }
  const [heroImageUrl, setHeroImageUrl] = useState('/Mosafer/hero-clean.png')
  const [heroTitle, setHeroTitle] = useState('رحلتك...\nتبدأ من هنا')
  const [heroSubtitle, setHeroSubtitle] = useState('احجز رحلتك بين جميع المحافظات بأمان وسهولة وبأفضل الأسعار')
  const [stats, setStats] = useState({ drivers: '+500', trips: '+50K', users: '+100K', cities: '+27' })

  useEffect(() => {
    fetchAppSettings()
      .then((s) => {
        if (s.heroImageUrl) setHeroImageUrl(s.heroImageUrl)
        if (s.heroTitle) setHeroTitle(s.heroTitle)
        if (s.heroSubtitle) setHeroSubtitle(s.heroSubtitle)
        setStats({ drivers: s.statDrivers, trips: s.statTrips, users: s.statUsers, cities: s.statCities })
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
            <img src="/Mosafer/logo.jpeg" alt="مسافر" className="h-10 w-10 rounded-xl object-cover" />
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
              return isRoute ? (
                <button key={link.label} onClick={() => navigate(link.href)} className={className}>
                  {link.label}
                </button>
              ) : (
                <a key={link.label} href={link.href} className={className}>
                  {link.label}
                </a>
              )
            })}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/login')}
              className="rounded-xl border-2 border-white/30 px-4 py-2 text-sm font-semibold"
            >
              تسجيل الدخول
            </button>
            <button
              onClick={() => navigate('/role-selection')}
              className="rounded-xl bg-gradient-to-l from-primary to-secondary px-4 py-2 text-sm font-semibold shadow-lg shadow-primary/30"
            >
              إنشاء حساب
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
            <h1 className="mb-4 whitespace-pre-line text-4xl font-bold leading-tight sm:text-5xl">{heroTitle}</h1>
            <p className="mb-6 text-lg text-white/85">{heroSubtitle}</p>

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
          <div className="rounded-2xl bg-card p-3 text-text-primary shadow-2xl shadow-primary/20 ring-1 ring-primary/25 sm:p-4">
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
                  className="!bg-gradient-to-l !from-primary !to-secondary !py-3 !shadow-lg !shadow-primary/40 hover:!brightness-110"
                >
                  ابحث عن رحلة
                </Button>
              </div>

              <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-[1fr_auto_1fr_1fr_1fr]">
                <div className="rounded-xl border border-border bg-tertiary px-3 py-2.5 transition hover:border-primary">
                  <p className="mb-0.5 flex items-center gap-1 text-[11px] font-semibold text-text-secondary">
                    <MapPin size={11} className="text-primary" /> من
                  </p>
                  <p className="text-sm text-text-secondary">اختار مكان الانطلاق</p>
                </div>

                <button
                  onClick={swapLocations}
                  className="mx-auto hidden h-9 w-9 items-center justify-center rounded-full border border-border bg-tertiary text-primary shadow-md shadow-primary/20 transition hover:border-primary lg:flex"
                  aria-label="بدّل بين نقطة الانطلاق والوجهة"
                >
                  <ArrowLeftRight size={16} />
                </button>

                <div className="rounded-xl border border-border bg-tertiary px-3 py-2.5 transition hover:border-primary">
                  <p className="mb-0.5 flex items-center gap-1 text-[11px] font-semibold text-text-secondary">
                    <MapPin size={11} className="text-primary" /> إلى
                  </p>
                  <p className="text-sm text-text-secondary">اختار الوجهة</p>
                </div>

                <div className="rounded-xl border border-border bg-tertiary px-3 py-2.5 transition hover:border-primary">
                  <p className="mb-0.5 flex items-center gap-1 text-[11px] font-semibold text-text-secondary">
                    <Calendar size={11} className="text-primary" /> تاريخ الرحلة
                  </p>
                  <p className="text-sm text-text-secondary">اختار التاريخ</p>
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
      <section id="features" className="scroll-mt-20 border-t border-white/10 bg-tertiary py-14">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl border border-white/10 bg-card/40 p-5 text-center transition hover:-translate-y-1 hover:border-primary/40"
              >
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-primary to-secondary shadow-lg shadow-primary/40 ring-2 ring-white/10 transition group-hover:shadow-primary/60">
                  <f.icon size={28} strokeWidth={2.4} className="drop-shadow-md" />
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
          <p className="mb-1 text-sm font-bold text-primary">خدماتنا</p>
          <h2 className="mb-2 text-2xl font-bold sm:text-3xl">اختر وسيلة السفر المناسبة لك</h2>
          <p className="mb-8 max-w-lg text-text-secondary">
            نوفر لك جميع وسائل النقل لتناسب احتياجاتك ومميزانيتك
          </p>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {VEHICLE_TYPES.map((v) => (
              <div
                key={v.title}
                className="rounded-2xl border border-border bg-bg p-6 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary-light text-primary">
                  <v.icon size={26} />
                </div>
                <p className="font-semibold text-text-primary">{v.title}</p>
                <p className="text-xs text-text-secondary">{v.desc}</p>
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

      {/* ---- Footer ---- */}
      <footer className="border-t border-white/10 bg-tertiary py-12 text-white/70">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <img src="/Mosafer/logo.jpeg" alt="مسافر" className="h-9 w-9 rounded-lg object-cover" />
              <span className="font-bold text-white">مسافر</span>
            </div>
            <div className="flex gap-3">
              <MessageCircle size={18} />
              <Share2 size={18} />
            </div>
          </div>

          <div>
            <p className="mb-3 font-semibold text-white">روابط سريعة</p>
            <ul className="space-y-2 text-sm">
              <li>الرئيسية</li>
              <li>عن مسافر</li>
              <li>الخدمات</li>
            </ul>
          </div>

          <div>
            <p className="mb-3 font-semibold text-white">خدماتنا</p>
            <ul className="space-y-2 text-sm">
              <li>سيارة خاصة</li>
              <li>ميكروباص</li>
              <li>أتوبيس</li>
              <li>سائقة للسيدات</li>
            </ul>
          </div>

          <div>
            <p className="mb-3 font-semibold text-white">تواصل معنا</p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Phone size={14} /> <span dir="ltr">+20 123 456 7890</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={14} /> info@mosafer.app
              </li>
              <li className="flex items-center gap-2">
                <MapPinned size={14} /> القاهرة - مصر
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
