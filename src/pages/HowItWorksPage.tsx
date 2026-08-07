import { useNavigate } from 'react-router-dom'
import { Search, CalendarCheck, Car, MapPinned } from 'lucide-react'

const PASSENGER_STEPS = [
  { icon: Search, title: 'دوّر على رحلتك', desc: 'اختار من فين لفين وعدد المقاعد اللي محتاجها' },
  { icon: CalendarCheck, title: 'احجز مقعدك', desc: 'ادفع نقدي أو من المحفظة، وحجزك هيبقى بانتظار موافقة السائق' },
  { icon: MapPinned, title: 'تابع السائق لحظيًا', desc: 'اتفرج على موقع السائق وهو جاي ليك على الخريطة' },
  { icon: Car, title: 'اتقابلوا وسافر', desc: 'قيّم رحلتك بعد ما توصل عشان تساعد ركاب تانيين' },
]

const DRIVER_STEPS = [
  { icon: Car, title: 'اعتمد حسابك', desc: 'ارفع مستنداتك وبيانات سيارتك مرة واحدة بس' },
  { icon: MapPinned, title: 'انشر رحلتك', desc: 'حدد من فين لفين، السعر، وعدد المقاعد الفاضية' },
  { icon: CalendarCheck, title: 'اقبل الحجوزات', desc: 'راجع طلبات الركاب واقبل اللي يناسبك' },
  { icon: Search, title: 'خد أرباحك', desc: 'بعد ما تخلّص الرحلة، فلوسك بتتحول لمحفظتك على طول' },
]

export default function HowItWorksPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-bg">
      <header className="flex items-center gap-3 border-b border-border bg-white px-4 py-4">
        <button onClick={() => navigate(-1)} className="text-xl">
          ←
        </button>
        <h1 className="text-lg font-bold text-text-primary">إزاي يشتغل مسافر؟</h1>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6">
        <h2 className="mb-4 text-lg font-bold text-text-primary">لو راكب</h2>
        <div className="mb-8 flex flex-col gap-3">
          {PASSENGER_STEPS.map((step, i) => (
            <div key={step.title} className="flex items-start gap-4 rounded-2xl border border-border bg-white p-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary">
                <step.icon size={22} />
              </div>
              <div>
                <p className="font-semibold text-text-primary">
                  {i + 1}. {step.title}
                </p>
                <p className="text-sm text-text-secondary">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <h2 className="mb-4 text-lg font-bold text-text-primary">لو سائق</h2>
        <div className="flex flex-col gap-3">
          {DRIVER_STEPS.map((step, i) => (
            <div key={step.title} className="flex items-start gap-4 rounded-2xl border border-border bg-white p-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-warning/10 text-warning">
                <step.icon size={22} />
              </div>
              <div>
                <p className="font-semibold text-text-primary">
                  {i + 1}. {step.title}
                </p>
                <p className="text-sm text-text-secondary">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
