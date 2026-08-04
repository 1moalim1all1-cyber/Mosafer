import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../contexts/AuthContext'

/** حماية مسارات السائق - راكب عادي مستحيل يفتحها حتى بالرابط المباشر */
export function DriverRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user || (user.role !== 'driver' && user.role !== 'admin')) {
    return <Navigate to="/" replace />
  }
  return <>{children}</>
}

/** حماية مسارات لوحة الإدارة - غير الأدمن يترفض فورًا */
export function AdminRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />
  }
  return <>{children}</>
}
