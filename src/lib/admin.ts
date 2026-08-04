import {
  collection,
  collectionGroup,
  doc,
  query,
  where,
  onSnapshot,
  getCountFromServer,
  addDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore'
import { httpsCallable, FunctionsError } from 'firebase/functions'
import { db, functions } from './firebase'

export interface PendingDriver {
  uid: string
  vehicleMake?: string
  vehicleModel?: string
  nationalIdImageUrl?: string
  licenseImageUrl?: string
  vehicleLicenseImageUrl?: string
  vehicleImageUrl?: string
  selfieVerificationUrl?: string
}

export function subscribePendingDrivers(callback: (drivers: PendingDriver[]) => void) {
  const q = query(collection(db, 'drivers'), where('verificationStatus', '==', 'pending'))
  return onSnapshot(q, (snap) => {
    callback(
      snap.docs.map((d) => {
        const data = d.data()
        return {
          uid: d.id,
          vehicleMake: data.vehicle?.make,
          vehicleModel: data.vehicle?.model,
          nationalIdImageUrl: data.nationalIdImageUrl,
          licenseImageUrl: data.licenseImageUrl,
          vehicleLicenseImageUrl: data.vehicleLicenseImageUrl,
          vehicleImageUrl: data.vehicleImageUrl,
          selfieVerificationUrl: data.selfieVerificationUrl,
        }
      }),
    )
  })
}

export async function approveDriver(driverId: string) {
  try {
    const callable = httpsCallable(functions, 'approveDriver')
    await callable({ driverId })
  } catch (err) {
    if (err instanceof FunctionsError) throw new Error(err.message)
    throw new Error('حصل خطأ، حاول تاني')
  }
}

export async function rejectDriver(driverId: string, reason: string) {
  try {
    const callable = httpsCallable(functions, 'rejectDriver')
    await callable({ driverId, reason })
  } catch (err) {
    if (err instanceof FunctionsError) throw new Error(err.message)
    throw new Error('حصل خطأ، حاول تاني')
  }
}

export async function fetchDashboardStats() {
  const [activeTrips, pendingDrivers, totalUsers] = await Promise.all([
    getCountFromServer(query(collection(db, 'trips'), where('status', '==', 'active'))),
    getCountFromServer(query(collection(db, 'drivers'), where('verificationStatus', '==', 'pending'))),
    getCountFromServer(collection(db, 'users')),
  ])
  return {
    activeTrips: activeTrips.data().count,
    pendingDrivers: pendingDrivers.data().count,
    totalUsers: totalUsers.data().count,
  }
}

// ---- المحافظات ----
export function subscribeGovernorates(callback: (items: { id: string; name: string; isActive: boolean }[]) => void) {
  return onSnapshot(collection(db, 'governorates'), (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, name: d.data().name ?? '', isActive: d.data().isActive ?? true })))
  })
}

export async function addGovernorate(name: string) {
  await addDoc(collection(db, 'governorates'), { name, isActive: true })
}

export async function toggleGovernorateActive(id: string, isActive: boolean) {
  await updateDoc(doc(db, 'governorates', id), { isActive })
}

export async function deleteGovernorate(id: string) {
  await deleteDoc(doc(db, 'governorates', id))
}

// ---- الكوبونات ----
export interface CouponRow {
  id: string
  code: string
  discountType: 'percentage' | 'fixed'
  value: number
  maxUses: number
  usedCount: number
  isActive: boolean
}

export function subscribeCoupons(callback: (items: CouponRow[]) => void) {
  return onSnapshot(collection(db, 'coupons'), (snap) => {
    callback(
      snap.docs.map((d) => {
        const data = d.data()
        return {
          id: d.id,
          code: data.code ?? '',
          discountType: data.discountType ?? 'percentage',
          value: data.value ?? 0,
          maxUses: data.maxUses ?? 0,
          usedCount: data.usedCount ?? 0,
          isActive: data.isActive ?? true,
        }
      }),
    )
  })
}

export async function addCoupon(coupon: Omit<CouponRow, 'id' | 'usedCount'>) {
  await addDoc(collection(db, 'coupons'), { ...coupon, code: coupon.code.toUpperCase(), usedCount: 0 })
}

export async function toggleCouponActive(id: string, isActive: boolean) {
  await updateDoc(doc(db, 'coupons', id), { isActive })
}

export async function deleteCoupon(id: string) {
  await deleteDoc(doc(db, 'coupons', id))
}

// ---- طلبات المحفظة ----
export interface WalletRequestRow {
  userId: string
  txId: string
  type: 'deposit' | 'withdraw'
  amount: number
  createdAt: Date
}

export function subscribePendingWalletRequests(callback: (items: WalletRequestRow[]) => void) {
  const q = query(collectionGroup(db, 'walletTransactions'), where('status', '==', 'pending'))
  return onSnapshot(q, (snap) => {
    callback(
      snap.docs.map((d) => {
        const data = d.data()
        const created = data.createdAt as { toDate?: () => Date }
        return {
          userId: d.ref.parent.parent!.id,
          txId: d.id,
          type: data.type,
          amount: data.amount ?? 0,
          createdAt: created?.toDate ? created.toDate() : new Date(),
        }
      }),
    )
  })
}

export async function resolveWalletRequest(userId: string, txId: string, approve: boolean) {
  try {
    const callable = httpsCallable(functions, 'resolveWalletRequest')
    await callable({ userId, txId, approve })
  } catch (err) {
    if (err instanceof FunctionsError) throw new Error(err.message)
    throw new Error('حصل خطأ، حاول تاني')
  }
}
