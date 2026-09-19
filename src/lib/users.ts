import { callServer } from './server'
import { doc, updateDoc } from 'firebase/firestore'
import { db, auth } from './firebase'
import type { AppUser } from '../types/user'
import type { DriverProfile } from '../types/booking'

export async function fetchUserProfile(uid: string, bookingId?: string): Promise<AppUser | null> {
  const result = await callServer<{ profile: Partial<AppUser> | null }>('getUserProfile', { userId: uid, ...(bookingId ? { bookingId } : {}) })
  if (!result.profile) return null
  return { gender: 'male', status: 'active', language: 'ar', favoriteTrips: [], referralCode: '',
    referredByUid: null, isEmailVerified: false, createdAt: new Date(), ...result.profile } as AppUser
}

export async function fetchDriverProfile(uid: string): Promise<DriverProfile | null> {
  const result = await callServer<{ driver: DriverProfile | null }>('getUserProfile', { userId: uid })
  return result.driver
}

export async function updateMyProfile(input: { fullName: string; profileImageUrl?: string | null }) {
  const uid = auth.currentUser?.uid
  if (!uid) throw new Error('لازم تسجّل دخول الأول')
  const fullName = input.fullName.trim()
  if (fullName.length < 2) throw new Error('اكتب اسم صحيح')
  await updateDoc(doc(db, 'users', uid), {
    fullName,
    ...(input.profileImageUrl !== undefined ? { profileImageUrl: input.profileImageUrl } : {}),
  })
}
