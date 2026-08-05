import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useAuth } from '../contexts/AuthContext'
import { syntheticEmailFromPhone } from '../lib/phoneAuth'
import type { Gender, UserRole } from '../types/user'

export default function RegisterPage() {
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
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="mb-6 text-center text-2xl font-bold text-text-primary">
        {role === 'driver' ? 'إنشاء حساب سائق' : 'إنشاء حساب راكب'}
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input label="الاسم بالكامل" value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" />
        <Input
          label="رقم الهاتف"
          type="tel"
          placeholder="01xxxxxxxxx"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          dir="ltr"
          autoComplete="tel"
        />
        <Input
          label="كلمة المرور"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
        />

        <div>
          <p className="mb-1.5 text-sm font-semibold text-text-primary">النوع</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setGender('male')}
              className={`rounded-xl border-2 py-3 font-semibold transition ${
                gender === 'male' ? 'border-primary bg-primary-light text-primary' : 'border-border text-text-secondary'
              }`}
            >
              ذكر
            </button>
            <button
              type="button"
              onClick={() => setGender('female')}
              className={`rounded-xl border-2 py-3 font-semibold transition ${
                gender === 'female' ? 'border-primary bg-primary-light text-primary' : 'border-border text-text-secondary'
              }`}
            >
              أنثى
            </button>
          </div>
        </div>

        <Input
          label="كود دعوة (اختياري)"
          placeholder="لو صاحبك بعتلك كود، اكتبه هنا"
          value={referralCode}
          onChange={(e) => setReferralCode(e.target.value)}
        />

        {error && <p className="text-sm text-danger">{error}</p>}

        <Button type="submit" loading={loading}>
          إنشاء الحساب
        </Button>

        <p className="text-center text-sm text-text-secondary">
          بالتسجيل إنت موافق على{' '}
          <Link to="/page/terms" className="font-semibold text-primary">
            الشروط والأحكام
          </Link>{' '}
          و{' '}
          <Link to="/page/privacy" className="font-semibold text-primary">
            سياسة الخصوصية
          </Link>
        </p>

        <Link to="/login" className="text-center text-sm font-semibold text-primary">
          عندك حساب بالفعل؟ سجّل الدخول
        </Link>
      </form>
    </div>
  )
}
