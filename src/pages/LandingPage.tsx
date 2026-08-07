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
  Users,
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

const STATS = [
  { value: '+500', label: 'سائق معتمد', icon: UserRound },
  { value: '+50K', label: 'رحلة مكتملة', icon: CarFront },
  { value: '+100K', label: 'مستخدم سعيد', icon: Users2 },
  { value: '+27', label: 'محافظة', icon: MapPinned },
]

const NAV_LINKS = ['الرئيسية', 'عن مسافر', 'الخدمات', 'رحلات مشتركة', 'الأسعار', 'تواصل معنا']

export default function LandingPage() {
  const navigate = useNavigate()
  const [seats, setSeats] = useState(1)
  const [tripTab, setTripTab] = useState<'رحلة واحدة' | 'رحلة ذهاب وعودة' | 'رحلات متعددة'>('رحلة واحدة')

  function swapLocations() {
    // الحقول لسه شكلية في صفحة الهبوط (المستخدم لازم يسجّل دخول قبل
    // ما يقدر يبحث فعليًا) - الزرار هنا بصري بس دلوقتي، هيشتغل حقيقي
    // لما نضيف حقول اختيار فعلية بدل placeholders
  }
  const [heroImageUrl, setHeroImageUrl] = useState('/Mosafer/hero-2.jpeg')

  useEffect(() => {
    fetchAppSettings()
      .then((s) => {
        if (s.heroImageUrl) setHeroImageUrl(s.heroImageUrl)
      })
      .catch(() => {
        // لو فشل، بتفضل الصورة الافتراضية زي ما هي
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
            {NAV_LINKS.map((link, i) => (
              <a
                key={link}
                href="#"
                className={
                  i === 0
                    ? 'relative pb-1 font-semibold text-white after:absolute after:bottom-0 after:right-0 after:h-0.5 after:w-full after:rounded-full after:bg-gradient-to-l after:from-primary after:to-secondary'
                    : 'hover:text-white'
                }
              >
                {link}
              </a>
            ))}
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
      <section className="relative overflow-hidden">
        <img src={heroImageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-tertiary via-tertiary/60 to-tertiary/20" />
        <div className="absolute inset-0 bg-gradient-to-l from-tertiary/40 via-transparent to-transparent" />

        <div className="relative mx-auto max-w-6xl px-4 pb-10 pt-14 sm:pt-20">
          <h1 className="mb-4 text-4xl font-bold leading-tight sm:text-5xl">
            رحلتك...
            <br />
            تبدأ من هنا
          </h1>
          <p className="mb-6 max-w-md text-lg text-white/85">
            احجز رحلتك بين جميع المحافظات بأمان وسهولة وبأفضل الأسعار
          </p>

          <div className="mb-8 flex flex-wrap gap-4 text-sm text-white/90">
            <span className="flex items-center gap-1.5">
              <Tag size={16} className="text-secondary" /> أسعار عادلة
            </span>
            <span className="flex items-center gap-1.5">
              <Zap size={16} className="text-secondary" /> سريع
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-secondary" /> آمن
            </span>
          </div>

          <div className="rounded-3xl bg-card p-5 text-text-primary shadow-2xl sm:p-6">
            {/* تابات نوع الرحلة */}
            <div className="mb-4 flex gap-2">
              {(['رحلة واحدة', 'رحلة ذهاب وعودة', 'رحلات متعددة'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setTripTab(tab)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    tripTab === tab
                      ? 'bg-gradient-to-l from-primary to-secondary text-white shadow-lg shadow-primary/30'
                      : 'bg-bg text-text-secondary'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_auto_1fr_1fr_1fr]">
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-text-primary">
                  <MapPin size={14} className="text-primary" /> من
                </label>
                <div className="rounded-xl border-2 border-border bg-bg px-4 py-3 text-text-secondary transition hover:border-primary/50 focus-within:border-primary">
                  اختار مكان الانطلاق
                </div>
              </div>

              <button
                onClick={swapLocations}
                className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border-2 border-border bg-bg text-primary transition hover:border-primary lg:mb-0.5"
                aria-label="بدّل بين نقطة الانطلاق والوجهة"
              >
                <ArrowLeftRight size={18} />
              </button>

              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-text-primary">
                  <MapPin size={14} className="text-primary" /> إلى
                </label>
                <div className="rounded-xl border-2 border-border bg-bg px-4 py-3 text-text-secondary transition hover:border-primary/50 focus-within:border-primary">
                  اختار الوجهة
                </div>
              </div>
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-text-primary">
                  <Calendar size={14} className="text-primary" /> تاريخ الرحلة
                </label>
                <div className="rounded-xl border-2 border-border bg-bg px-4 py-3 text-text-secondary transition hover:border-primary/50">اختار التاريخ</div>
              </div>
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-text-primary">
                  <Users size={14} className="text-primary" /> عدد الركاب
                </label>
                <div className="flex items-center justify-between rounded-xl border-2 border-border bg-bg px-3 py-2.5">
                  <button
                    onClick={() => setSeats((s) => Math.max(1, s - 1))}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-text-secondary"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="font-semibold">{seats} راكب</span>
                  <button
                    onClick={() => setSeats((s) => Math.min(8, s + 1))}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-text-secondary"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <Button onClick={() => navigate('/login')} icon={<Search size={18} />}>
                ابحث عن رحلة
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ---- Features ---- */}
      <section className="border-t border-white/10 bg-tertiary py-14">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-2xl border border-white/10 bg-card/5 p-5 text-center transition hover:bg-card/10">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/20">
                  <f.icon size={22} />
                </div>
                <p className="mb-1 font-semibold">{f.title}</p>
                <p className="text-xs leading-relaxed text-white/60">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Vehicle Types / Services ---- */}
      <section id="services" className="border-t border-white/10 bg-card py-16 text-text-primary">
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

      {/* ---- App promo: التطبيق لسه مش منشور، فالأزرار بعلامة "قريبًا"
      مش روابط وهمية بتودّي لمكان مفيش - PWA حقيقي شغال دلوقتي بديل ---- */}
      <section className="relative overflow-hidden border-t border-white/10 bg-gradient-to-br from-tertiary via-primary/20 to-secondary/20 py-16">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 md:grid-cols-2">
          <div className="mx-auto w-48 rounded-[2.5rem] border-4 border-white/10 bg-tertiary p-2 shadow-2xl sm:w-56">
            <div className="flex aspect-[9/19] flex-col items-center justify-center gap-3 rounded-[2rem] bg-gradient-to-br from-primary to-secondary p-4 text-center">
              <img src="/Mosafer/logo.jpeg" alt="مسافر" className="h-14 w-14 rounded-2xl object-cover" />
              <p className="text-sm font-bold">MOSAFER</p>
              <div className="mt-4 w-full rounded-lg bg-white/15 py-2 text-xs">تسجيل الدخول</div>
              <div className="w-full rounded-lg bg-white/90 py-2 text-xs text-primary">دخول</div>
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-2xl font-bold sm:text-3xl">حمّل تطبيق مسافر الآن</h2>
            <p className="mb-6 text-white/70">رحلاتك بين إيديك في أي وقت وأي مكان</p>

            <div className="mb-6 flex flex-wrap gap-3">
              <div className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 opacity-60">
                <span className="text-xl">▶</span>
                <div className="text-right">
                  <p className="text-[10px] text-white/60">قريبًا على</p>
                  <p className="text-sm font-semibold">Google Play</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 opacity-60">
                <span className="text-xl"></span>
                <div className="text-right">
                  <p className="text-[10px] text-white/60">قريبًا على</p>
                  <p className="text-sm font-semibold">App Store</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-primary/30 bg-primary-light p-4">
              <p className="mb-1 text-sm font-semibold text-white">✨ دلوقتي تقدر تستخدم مسافر زي تطبيق</p>
              <p className="text-xs text-white/60">
                من متصفحك، دوس على "إضافة إلى الشاشة الرئيسية" وهتلاقي أيقونة مسافر على موبايلك على طول
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---- Stats ---- */}
      <section className="border-t border-white/10 bg-card py-12">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-4 sm:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="flex flex-col items-center rounded-2xl border border-border bg-bg p-5 text-center">
              <s.icon size={22} className="mb-2 text-primary" />
              <p className="text-2xl font-bold text-text-primary">{s.value}</p>
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
