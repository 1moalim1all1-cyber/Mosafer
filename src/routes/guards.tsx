import { Navigate } from 'react-router-dom'
import { useState, type FormEvent, type ReactNode } from 'react'
import { useAuth } from '../contexts/useAuth'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { firebaseUser, user, loading, recoverMissingProfile } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <span className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!firebaseUser) return <Navigate to="/login" replace />

  if (!user) return <MissingProfileRecovery onRecover={recoverMissingProfile} />

  // حساب موقوف أو محظور من الإدارة - بيترفض من استخدام التطبيق فعليًا،
  // مش بس بيبان في لوحة الإدارة بدون تأثير حقيقي
  if (user && user.status !== 'active') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-bg px-6 text-center">
        <div className="text-4xl">🚫</div>
        <h1 className="text-xl font-bold text-text-primary">حسابك {user.status === 'banned' ? 'محظور' : 'موقوف مؤقتًا'}</h1>
        <p className="text-text-secondary">تواصل مع الدعم لمعرفة السبب أو لاستعادة حسابك</p>
      </div>
    )
  }

  return <>{children}</>
}

function MissingProfileRecovery({ onRecover }: { onRecover: (input: { fullName: string; gender: 'male' | 'female' }) => Promise<void> }) {
  const [fullName, setFullName] = useState('')
  const [gender, setGender] = useState<'male' | 'female'>('male')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function submit(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      await onRecover({ fullName, gender })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'تعذر استكمال الحساب')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <form onSubmit={submit} className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-xl">
        <h1 className="mb-2 text-xl font-bold text-text-primary">استكمال بيانات الحساب</h1>
        <p className="mb-5 text-sm text-text-secondary">الحساب موجود لكن بياناته الأساسية ناقصة. كمّلها مرة واحدة عشان تقدر تستخدم مسافر.</p>
        <label className="mb-1 block text-sm font-semibold text-text-primary">الاسم بالكامل</label>
        <input value={fullName} onChange={(event) => setFullName(event.target.value)} className="mb-4 w-full rounded-xl border-2 border-border bg-bg px-4 py-3 focus:border-primary focus:outline-none" />
        <p className="mb-2 text-sm font-semibold text-text-primary">النوع</p>
        <div className="mb-5 grid grid-cols-2 gap-2">
          <button type="button" onClick={() => setGender('male')} className={`rounded-xl border-2 py-3 font-semibold ${gender === 'male' ? 'border-primary bg-primary-light text-primary' : 'border-border text-text-secondary'}`}>ذكر</button>
          <button type="button" onClick={() => setGender('female')} className={`rounded-xl border-2 py-3 font-semibold ${gender === 'female' ? 'border-primary bg-primary-light text-primary' : 'border-border text-text-secondary'}`}>أنثى</button>
        </div>
        {error && <p className="mb-3 text-sm text-danger">{error}</p>}
        <button type="submit" disabled={saving || fullName.trim().length < 2} className="w-full rounded-xl bg-primary py-3 font-bold text-white disabled:opacity-50">{saving ? 'جاري الحفظ...' : 'حفظ وفتح الحساب'}</button>
      </form>
    </div>
  )
}

export function GuestOnlyRoute({ children }: { children: ReactNode }) {
  const { firebaseUser, loading } = useAuth()
  if (loading) return null
  if (firebaseUser) return <Navigate to="/" replace />
  return <>{children}</>
}

/** الجذر "/" - زائر مش مسجّل دخول يشوف صفحة الهبوط، ومسجّل الدخول يشوف الرئيسية مباشرة */
export function RootRoute({ authed, guest }: { authed: ReactNode; guest: ReactNode }) {
  const { firebaseUser, loading } = useAuth()
  if (loading) return null
  return <>{firebaseUser ? authed : guest}</>
}
