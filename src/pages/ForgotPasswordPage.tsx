import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '../components/ui/Button'
import { fetchAppSettings } from '../lib/admin'

export default function ForgotPasswordPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [contact, setContact] = useState<{ whatsappNumber: string; supportEmail: string } | null>(null)

  useEffect(() => {
    fetchAppSettings().then((s) =>
      setContact({ whatsappNumber: s.whatsappNumber, supportEmail: s.supportEmail }),
    )
  }, [])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (contact?.whatsappNumber) {
      const phone = contact.whatsappNumber.replace(/[^\d]/g, '')
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(t('auth.resetWhatsAppText'))}`, '_blank')
    } else {
      navigate('/support')
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-bg px-4">
      <button
        onClick={() => navigate('/login')}
        className="absolute right-4 top-4 text-sm font-semibold text-text-secondary hover:text-primary"
      >
        → {t('auth.loginButton')}
      </button>
      <div className="w-full max-w-md">
        <h1 className="mb-2 text-2xl font-bold text-text-primary">{t('auth.forgotPasswordTitle')}</h1>
        <p className="mb-6 text-text-secondary">{t('auth.forgotPasswordBody')}</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Button type="submit">{t('auth.contactSupportToReset')}</Button>
          <Link to="/login" className="text-center text-sm font-semibold text-primary">
            {t('auth.haveAccount')}
          </Link>
        </form>
      </div>
    </div>
  )
}
