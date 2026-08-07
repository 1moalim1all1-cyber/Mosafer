import { useNavigate } from 'react-router-dom'
import { ShieldCheck, Tag, Zap, Users2, UserRound, CarFront, Bus, Truck } from 'lucide-react'
import { Button } from '../components/ui/Button'

const FEATURES = [
  { icon: ShieldCheck, title: 'رحلات آمنة', desc: 'متابعة الرحلة لحظة بلحظة وضمان كامل لسلامتك' },
  { icon: Tag, title: 'أسعار عادلة', desc: 'قارن بين الأسعار واختار الأنسب لك' },
  { icon: Zap, title: 'حجز سريع وسهل', desc: 'احجز رحلتك في ثوانٍ وبضغطة واحدة' },
  { icon: Users2, title: 'رحلات مشتركة', desc: 'وفّر أكتر مع الرحلات المشتركة' },
  { icon: UserRound, title: 'رحلات للسيدات', desc: 'إمكانية اختيار سائقة سيدة فقط' },
]

const VEHICLE_TYPES = [
  { icon: CarFront, title: 'سيارة خاصة', desc: 'راحة وخصوصية' },
  { icon: Truck, title: 'ميكروباص', desc: 'رحلات جماعية صغيرة' },
  { icon: Bus, title: 'أتوبيس', desc: 'رحلات مريحة وآمنة' },
  { icon: UserRound, title: 'سائقة للسيدات', desc: 'أمان وخصوصية تامة' },
]

const STATS = [
  { value: '+500', label: 'سائق معتمد' },
  { value: '+50K', label: 'رحلة مكتملة' },
  { value: '+100K', label: 'مستخدم سعيد' },
  { value: '+27', label: 'محافظة' },
]

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-tertiary text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-tertiary/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <img src="/Mosafer/logo.jpeg" alt="مسافر" className="h-10 w-10 rounded-xl object-cover" />
            <span className="text-lg font-bold">مسافر</span>
          </div>
          <nav className="hidden items-center gap-6 text-sm text-white/80 md:flex">
            <a href="#home" className="text-white">الرئيسية</a>
            <a href="#about">عن مسافر</a>
            <a href="#how">كيفية العمل</a>
            <a href="#services">الخدمات</a>
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
              className="rounded-xl bg-gradient-to-l from-primary to-secondary px-4 py-2 text-sm font-semibold"
            >
              إنشاء حساب
            </button>
          </div>
        </div>
      </header>

      <section id="home" className="relative overflow-hidden">
        <img src="/Mosafer/hero-2.jpeg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-t from-tertiary via-tertiary/70 to-tertiary/30" />

        <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-16">
          <h1 className="mb-4 text-4xl font-bold leading-tight sm:text-5xl">
            رحلتك...
            <br />
            تبدأ من هنا
          </h1>
          <p className="mb-8 max-w-md text-lg text-white/80">
            احجز رحلتك بين جميع المحافظات بأمان وسهولة وبأفضل الأسعار
          </p>

          <div className="rounded-3xl bg-white p-5 shadow-2xl sm:p-6">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-semibold text-text-primary">من</label>
                <div className="rounded-xl border-2 border-border px-4 py-3 text-text-secondary">اختار مكان الانطلاق</div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-text-primary">إلى</label>
                <div className="rounded-xl border-2 border-border px-4 py-3 text-text-secondary">اختار الوجهة</div>
              </div>
            </div>
            <div className="mt-4">
              <Button onClick={() => navigate('/login')}>ابحث عن رحلة</Button>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-tertiary py-14">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-4 sm:grid-cols-3 md:grid-cols-5">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary">
                <f.icon size={22} />
              </div>
              <p className="mb-1 font-semibold">{f.title}</p>
              <p className="text-xs text-white/60">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="services" className="border-t border-white/10 bg-white py-16 text-text-primary">
        <div className="mx-auto max-w-6xl px-4">
          <p className="mb-1 text-sm font-semibold text-primary">خدماتنا</p>
          <h2 className="mb-8 text-2xl font-bold">اختر وسيلة السفر المناسبة لك</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {VEHICLE_TYPES.map((v) => (
              <div key={v.title} className="rounded-2xl border border-border bg-bg p-5 text-center">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary-light text-primary">
                  <v.icon size={26} />
                </div>
                <p className="font-semibold">{v.title}</p>
                <p className="text-xs text-text-secondary">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-gradient-to-l from-primary to-secondary py-12">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 text-center sm:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-bold">{s.value}</p>
              <p className="text-sm text-white/80">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-white/10 bg-tertiary py-10 text-white/70">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm">
          <div className="mb-4 flex items-center justify-center gap-2">
            <img src="/Mosafer/logo.jpeg" alt="مسافر" className="h-8 w-8 rounded-lg object-cover" />
            <span className="font-bold text-white">مسافر</span>
          </div>
          <p>جميع الحقوق محفوظة © {new Date().getFullYear()} مسافر</p>
        </div>
      </footer>
    </div>
  )
}
