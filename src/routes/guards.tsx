import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../contexts/AuthContext'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { firebaseUser, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <span className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!firebaseUser) return <Navigate to="/login" replace />
  return <>{children}</>
}

export function GuestOnlyRoute({ children }: { children: ReactNode }) {
  const { firebaseUser, loading } = useAuth()
  if (loading) return null
  if (firebaseUser) return <Navigate to="/" replace />
  return <>{children}</>
}
