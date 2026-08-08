import { useContext } from 'react'
import { AuthContext } from './authContextInstance'

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth لازم يتنادى جوه AuthProvider')
  return ctx
}
