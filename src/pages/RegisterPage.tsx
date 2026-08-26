import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useAuth } from '../contexts/useAuth'
import { syntheticEmailFromPhone } from '../lib/phoneAuth'
import type { Gender, UserRole } from '../types/user'

export default function RegisterPage() {
  const { t } = useTranslation()
  const { register } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const role = (searchParams.get('role') as UserRole) ?? 'passenger'

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [gender, setGender] = useState<Gender>('male')
  const [referralCode, setReferralCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (fullName.trim().length < 3) {
      setError('أدخل اسم صحيح')
      return
    }
    if (phone.trim().length < 8) {
      setError('من فضلك أدخل رقم هاتف صحيح')
      return
    }
    if (password.length < 6) {
      setError('كلمة المرور 6 حروف على الأقل')
      return
    }

    setLoading(true)
    setError(null)
    try {
      await register({
        fullName,
        phone,
        password,
        role,
        gender,
        referralCode: referralCode || undefined,
        email: syntheticEmailFromPhone(phone),
      })
      navigate(role === 'driver' ? '/driver/documents' : '/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حصل خطأ، حاول تاني')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative mx-auto max-w-md px-4 py-10">
      <button
        onClick={() => navigate('/')}
        className="mb-4 flex items-center gap-1 text-sm font-semibold text-text-secondary hover:text-primary"
        aria-label={t('common.backToHome')}
      >
        → {t('common.backToHome')}
      </button>
      <h1 className="mb-6 text-center text-2xl font-bold text-text-primary">
        {role === 'driver' ? t('auth.createDriverAccount') : t('auth.createPassengerAccount')}
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input label={t('auth.fullName')} value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" />
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
          autoComplete="new-password"
        />

        <div>
          <p className="mb-1.5 text-sm font-semibold text-text-primary">{t('auth.gender')}</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setGender('male')}
              className={`rounded-xl border-2 py-3 font-semibold transition ${
                gender === 'male' ? 'border-primary bg-primary-light text-primary' : 'border-border text-text-secondary'
              }`}
            >
              {t('auth.male')}
            </button>
            <button
              type="button"
              onClick={() => setGender('female')}
              className={`rounded-xl border-2 py-3 font-semibold transition ${
                gender === 'female' ? 'border-primary bg-primary-light text-primary' : 'border-border text-text-secondary'
              }`}
            >
              {t('auth.female')}
            </button>
          </div>
        </div>

        <Input
          label={t('auth.referralOptional')}
          placeholder={t('auth.referralPlaceholder')}
          value={referralCode}
          onChange={(e) => setReferralCode(e.target.value)}
        />

        {error && <p className="text-sm text-danger">{error}</p>}

        <Button type="submit" loading={loading}>
          {t('auth.createAccountButton')}
        </Button>

        <p className="text-center text-sm text-text-secondary">
          {t('auth.termsAgree')}{' '}
          <Link to="/page/terms" className="font-semibold text-primary">
            {t('auth.terms')}
          </Link>{' '}
          {t('auth.and')}{' '}
          <Link to="/page/privacy" className="font-semibold text-primary">
            {t('auth.privacy')}
          </Link>
        </p>

        <Link to="/login" className="text-center text-sm font-semibold text-primary">
          {t('auth.haveAccount')}
        </Link>
      </form>
    </div>
  )
}
