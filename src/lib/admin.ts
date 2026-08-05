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
  getDoc,
  setDoc,
  runTransaction,
} from 'firebase/firestore'
import { db } from './firebase'

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
  await updateDoc(doc(db, 'drivers', driverId), { verificationStatus: 'approved' })
}

export async function rejectDriver(driverId: string, reason: string) {
  await updateDoc(doc(db, 'drivers', driverId), { verificationStatus: 'rejected', rejectionReason: reason })
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
  method?: string | null
  accountNumber?: string | null
  senderNumber?: string | null
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
          method: data.method ?? null,
          accountNumber: data.accountNumber ?? null,
          senderNumber: data.senderNumber ?? null,
          createdAt: created?.toDate ? created.toDate() : new Date(),
        }
      }),
    )
  })
}

export async function resolveWalletRequest(userId: string, txId: string, approve: boolean) {
  const walletRef = doc(db, 'wallets', userId)
  const txRef = doc(db, 'wallets', userId, 'walletTransactions', txId)

  try {
    await runTransaction(db, async (tx) => {
      const txSnap = await tx.get(txRef)
      if (!txSnap.exists()) throw new Error('الطلب ده مش موجود')
      const txData = txSnap.data()
      if (txData.status !== 'pending') throw new Error('اترد على الطلب ده بالفعل')

      if (!approve) {
        tx.update(txRef, { status: 'rejected' })
        return
      }

      const walletSnap = await tx.get(walletRef)
      const currentBalance = (walletSnap.data()?.balance ?? 0) as number

      if (txData.type === 'withdraw' && currentBalance < txData.amount) {
        throw new Error('رصيد المستخدم مش كافي لإتمام السحب')
      }

      const newBalance = txData.type === 'deposit' ? currentBalance + txData.amount : currentBalance - txData.amount
      tx.update(walletRef, { balance: newBalance })
      tx.update(txRef, { status: 'completed', balanceAfter: newBalance })
    })
  } catch (err) {
    if (err instanceof Error) throw err
    throw new Error('حصل خطأ، حاول تاني')
  }
}

// ---- إعدادات النظام العامة ----
export interface AppSettings {
  commissionStandardPercent: number
  commissionReturnEmptyPercent: number
  welcomeBonusAmount: number
  referralBonusAmount: number
  whatsappNumber: string
  supportEmail: string
  depositMethodName: string
  depositPhoneNumber: string
}

export async function fetchAppSettings(): Promise<AppSettings> {
  const snap = await getDoc(doc(db, 'appSettings', 'general'))
  const data = snap.exists() ? snap.data() : {}
  return {
    commissionStandardPercent: data.commissionStandardPercent ?? 10,
    commissionReturnEmptyPercent: data.commissionReturnEmptyPercent ?? 5,
    welcomeBonusAmount: data.welcomeBonusAmount ?? 20,
    referralBonusAmount: data.referralBonusAmount ?? 15,
    whatsappNumber: data.whatsappNumber ?? '',
    supportEmail: data.supportEmail ?? '',
    depositMethodName: data.depositMethodName ?? 'فودافون كاش',
    depositPhoneNumber: data.depositPhoneNumber ?? '',
  }
}

export async function updateAppSettings(settings: AppSettings) {
  await setDoc(doc(db, 'appSettings', 'general'), settings, { merge: true })
}
