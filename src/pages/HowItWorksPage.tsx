import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Search, CalendarCheck, Car, MapPinned } from 'lucide-react'

function getPassengerSteps(t: (key: string) => string) {
  return [
    { icon: Search, title: t('howItWorks.p1Title'), desc: t('howItWorks.p1Desc') },
    { icon: CalendarCheck, title: t('howItWorks.p2Title'), desc: t('howItWorks.p2Desc') },
    { icon: MapPinned, title: t('howItWorks.p3Title'), desc: t('howItWorks.p3Desc') },
    { icon: Car, title: t('howItWorks.p4Title'), desc: t('howItWorks.p4Desc') },
  ]
}

function getDriverSteps(t: (key: string) => string) {
  return [
    { icon: Car, title: t('howItWorks.d1Title'), desc: t('howItWorks.d1Desc') },
    { icon: MapPinned, title: t('howItWorks.d2Title'), desc: t('howItWorks.d2Desc') },
    { icon: CalendarCheck, title: t('howItWorks.d3Title'), desc: t('howItWorks.d3Desc') },
    { icon: Search, title: t('howItWorks.d4Title'), desc: t('howItWorks.d4Desc') },
  ]
}

export default function HowItWorksPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-bg">
      <header className="flex items-center gap-3 border-b border-border bg-card px-4 py-4">
        <button onClick={() => navigate(-1)} className="text-xl">
          ←
        </button>
        <h1 className="text-lg font-bold text-text-primary">{t('howItWorks.title')}</h1>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6">
        <h2 className="mb-4 text-lg font-bold text-text-primary">{t('howItWorks.asPassenger')}</h2>
        <div className="mb-8 flex flex-col gap-3">
          {getPassengerSteps(t).map((step, i) => (
            <div key={step.title} className="flex items-start gap-4 rounded-2xl border border-border bg-card p-4">
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

        <h2 className="mb-4 text-lg font-bold text-text-primary">{t('howItWorks.asDriver')}</h2>
        <div className="flex flex-col gap-3">
          {getDriverSteps(t).map((step, i) => (
            <div key={step.title} className="flex items-start gap-4 rounded-2xl border border-border bg-card p-4">
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
