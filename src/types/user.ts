export type UserRole = 'passenger' | 'driver' | 'admin'
export type Gender = 'male' | 'female'
export type AccountStatus = 'active' | 'suspended' | 'banned'

export interface AppUser {
  uid: string
  role: UserRole
  fullName: string
  phone: string
  email: string
  gender: Gender
  profileImageUrl?: string | null
  isPhoneVerified: boolean
  isEmailVerified: boolean
  trustScore: number
  totalTrips: number
  avgRating: number
  status: AccountStatus
  language: string
  favoriteTrips: string[]
  referralCode: string
  referredByUid?: string | null
  createdAt: Date
}
