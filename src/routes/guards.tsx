import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../contexts/AuthContext'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { firebaseUser, user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <span className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!firebaseUser) return <Navigate to="/login" replace />

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
