import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function RoleSelectionPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="mb-2 text-center text-2xl font-bold text-text-primary">{t('roleSelection.title')}</h1>
      <p className="mb-8 text-center text-text-secondary">{t('roleSelection.subtitle')}</p>

      <div className="flex flex-col gap-4">
        <button
          onClick={() => navigate('/register?role=passenger')}
          className="flex items-center gap-4 rounded-2xl border-2 border-border bg-card p-5 text-right transition hover:border-primary hover:bg-primary-light"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-light text-2xl">
            🧑
          </div>
          <div className="flex-1">
            <p className="text-lg font-bold text-text-primary">{t('auth.passenger')}</p>
            <p className="text-sm text-text-secondary">{t('roleSelection.passengerDesc')}</p>
          </div>
          <span className="text-text-secondary">‹</span>
        </button>

        <button
          onClick={() => navigate('/register?role=driver')}
          className="flex items-center gap-4 rounded-2xl border-2 border-border bg-card p-5 text-right transition hover:border-primary hover:bg-primary-light"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-light text-2xl">
            🚘
          </div>
          <div className="flex-1">
            <p className="text-lg font-bold text-text-primary">{t('auth.driver')}</p>
            <p className="text-sm text-text-secondary">{t('roleSelection.driverDesc')}</p>
          </div>
          <span className="text-text-secondary">‹</span>
        </button>
      </div>
    </div>
  )
}
