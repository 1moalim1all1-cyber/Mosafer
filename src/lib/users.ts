import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db, auth } from './firebase'
import type { AppUser } from '../types/user'
import type { DriverProfile } from '../types/booking'

export async function fetchUserProfile(uid: string): Promise<AppUser | null> {
  const snap = await getDoc(doc(db, 'users', uid))
  if (!snap.exists()) return null
  const data = snap.data()
  return {
    uid,
    role: data.role ?? 'passenger',
    fullName: data.fullName ?? '',
    phone: data.phone ?? '',
    email: data.email ?? '',
    gender: data.gender ?? 'male',
    profileImageUrl: data.profileImageUrl ?? null,
    isPhoneVerified: Boolean(data.isPhoneVerified),
    isEmailVerified: Boolean(data.isEmailVerified),
    trustScore: data.trustScore ?? 0,
    totalTrips: data.totalTrips ?? 0,
    avgRating: data.avgRating ?? 0,
    status: data.status ?? 'active',
    language: data.language ?? 'ar',
    favoriteTrips: data.favoriteTrips ?? [],
    referralCode: data.referralCode ?? '',
    referredByUid: data.referredByUid ?? null,
    createdAt: new Date(),
  }
}

export async function fetchDriverProfile(uid: string): Promise<DriverProfile | null> {
  const snap = await getDoc(doc(db, 'drivers', uid))
  if (!snap.exists()) return null
  const data = snap.data()
  return {
    uid,
    verificationStatus: data.verificationStatus ?? 'notSubmitted',
    vehicle: data.vehicle ?? null,
  }
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
