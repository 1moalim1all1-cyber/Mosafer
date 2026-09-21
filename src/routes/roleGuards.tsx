import { Navigate } from 'react-router-dom'
import { useEffect, useState, type ReactNode } from 'react'
import { useAuth } from '../contexts/useAuth'
import { subscribeDriverStatus } from '../lib/driverActions'

/** حماية مسارات السائق - راكب عادي مستحيل يفتحها حتى بالرابط المباشر */
export function DriverRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const [driverStatus, setDriverStatus] = useState<string | null>(null)

  useEffect(() => {
    if (!user || user.role === 'admin') return
    return subscribeDriverStatus(user.uid, setDriverStatus)
  }, [user])

  if (loading || (user && user.role !== 'admin' && driverStatus === null)) return <div className="flex min-h-screen items-center justify-center"><span className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
  if (!user) return <Navigate to="/" replace />
  if (user.role !== 'admin' && driverStatus !== 'approved') {
    return <Navigate to={driverStatus === 'pending' || driverStatus === 'rejected' ? '/driver/pending-approval' : '/driver/documents'} replace />
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
