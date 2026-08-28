import { useContext } from 'react'
import { AuthContext } from './authContextInstance'
import type { AuthContextValue } from './AuthContext'

/**
 * استخدم useAuth() للحصول على بيانات المستخدم والدوال المتعلقة بالتسجيل
 * لازم تكون داخل AuthProvider - يعني في App.tsx
 */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error(
      'useAuth لازم يتنادى جوه AuthProvider - تأكد إن التطبيق ملفوف بـ <AuthProvider>'
    )
  }
  return ctx
}

/**
 * Safe version - ترجع null لو مفيش AuthProvider
 * استخدمه لو مش متأكد إنك في AuthProvider
 */
export function useAuthSafe(): AuthContextValue | null {
  return useContext(AuthContext)
}
