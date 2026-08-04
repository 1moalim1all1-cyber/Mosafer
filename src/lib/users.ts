import { doc, getDoc } from 'firebase/firestore'
import { db } from './firebase'
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
