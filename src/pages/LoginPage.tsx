import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useAuth } from '../contexts/useAuth'
import { syntheticEmailFromPhone } from '../lib/phoneAuth'

export default function LoginPage() {
  const { t } = useTranslation()
  const { login } = useAuth()
  const navigate = useNavigate()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (phone.trim().length < 8) {
      setError('من فضلك أدخل رقم هاتف صحيح')
      return
    }
    setLoading(true)
    setError(null)
    try {
      await login(syntheticEmailFromPhone(phone), password)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حصل خطأ، حاول تاني')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <img
            src={`${import.meta.env.BASE_URL}logo.jpeg`}
            alt="مسافر"
            className="mb-4 h-28 w-28 rounded-2xl object-cover shadow-lg shadow-primary/30"
          />
          <h1 className="text-2xl font-bold text-text-primary">{t('auth.welcomeBack')}</h1>
          <p className="mt-1 text-text-secondary">{t('auth.loginSubtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label={t('auth.phone')}
            type="tel"
            placeholder="01xxxxxxxxx"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            dir="ltr"
            autoComplete="tel"
          />
          <Input
            label={t('auth.password')}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />

          <Link to="/forgot-password" className="text-sm font-semibold text-primary hover:text-primary-hover">
            {t('auth.forgotPassword')}
          </Link>

          {error && <p className="text-sm text-danger">{error}</p>}

          <Button type="submit" loading={loading}>
            {t('auth.loginButton')}
          </Button>

          <Link
            to="/role-selection"
            className="text-center text-sm font-semibold text-primary hover:text-primary-hover"
          >
            {t('auth.noAccount')}
          </Link>
        </form>
      </div>
    </div>
  )
}
