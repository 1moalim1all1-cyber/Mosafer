import {
  collection,
  collectionGroup,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  getCountFromServer,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  setDoc,
  runTransaction,
  limit,
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
  heroImageUrl: string
  heroTitle: string
  heroSubtitle: string
  logoImageUrl: string
  googlePlayUrl: string
  appStoreUrl: string
  emergencyTitle: string
  emergencySubtitle: string
  emergencyLogoUrl: string
  emergencyActionUrl: string
  statDrivers: string
  statTrips: string
  statUsers: string
  statCities: string
  facebookUrl: string
  instagramUrl: string
  tiktokUrl: string
  youtubeUrl: string
  contactPhone: string
  contactEmail: string
  contactAddress: string
  partner1Name: string
  partner1LogoUrl: string
  partner1Url: string
  partner2Name: string
  partner2LogoUrl: string
  partner2Url: string
  partner3Name: string
  partner3LogoUrl: string
  partner3Url: string
  partner4Name: string
  partner4LogoUrl: string
  partner4Url: string
  partner5Name: string
  partner5LogoUrl: string
  partner5Url: string
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
    heroImageUrl: data.heroImageUrl ?? '',
    heroTitle: data.heroTitle ?? 'رحلتك...\nتبدأ من هنا',
    heroSubtitle: data.heroSubtitle ?? 'احجز رحلتك بين جميع المحافظات بأمان وسهولة وبأفضل الأسعار',
    logoImageUrl: data.logoImageUrl ?? '',
    googlePlayUrl: data.googlePlayUrl ?? '',
    appStoreUrl: data.appStoreUrl ?? '',
    emergencyTitle: data.emergencyTitle ?? 'الإنقاذ السريع',
    emergencySubtitle: data.emergencySubtitle ?? 'اطلب سيارة إنقاذ من مكانك',
    emergencyLogoUrl: data.emergencyLogoUrl ?? '',
    emergencyActionUrl: data.emergencyActionUrl ?? '',
    statDrivers: data.statDrivers ?? '+500',
    statTrips: data.statTrips ?? '+50K',
    statUsers: data.statUsers ?? '+100K',
    statCities: data.statCities ?? '+27',
    facebookUrl: data.facebookUrl ?? '',
    instagramUrl: data.instagramUrl ?? '',
    tiktokUrl: data.tiktokUrl ?? '',
    youtubeUrl: data.youtubeUrl ?? '',
    contactPhone: data.contactPhone ?? '',
    contactEmail: data.contactEmail ?? '',
    contactAddress: data.contactAddress ?? 'القاهرة - مصر',
    partner1Name: data.partner1Name ?? 'Mobil 1',
    partner1LogoUrl: data.partner1LogoUrl ?? '',
    partner1Url: data.partner1Url ?? '',
    partner2Name: data.partner2Name ?? 'Michelin',
    partner2LogoUrl: data.partner2LogoUrl ?? '',
    partner2Url: data.partner2Url ?? '',
    partner3Name: data.partner3Name ?? 'Castrol',
    partner3LogoUrl: data.partner3LogoUrl ?? '',
    partner3Url: data.partner3Url ?? '',
    partner4Name: data.partner4Name ?? 'Shell Helix',
    partner4LogoUrl: data.partner4LogoUrl ?? '',
    partner4Url: data.partner4Url ?? '',
    partner5Name: data.partner5Name ?? 'NGK',
    partner5LogoUrl: data.partner5LogoUrl ?? '',
    partner5Url: data.partner5Url ?? '',
  }
}

export async function updateAppSettings(settings: AppSettings) {
  await setDoc(doc(db, 'appSettings', 'general'), settings, { merge: true })
}

// ---- إدارة المستخدمين ----
export interface ManagedUser {
  uid: string
  fullName: string
  phone: string
  role: 'passenger' | 'driver' | 'admin'
  status: 'active' | 'suspended' | 'banned'
  totalTrips: number
  avgRating: number
  createdAt: Date
}

export function subscribeAllUsers(callback: (users: ManagedUser[]) => void) {
  const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'))
  return onSnapshot(q, (snap) => {
    callback(
      snap.docs.map((d) => {
        const data = d.data()
        const created = data.createdAt as { toDate?: () => Date }
        return {
          uid: d.id,
          fullName: data.fullName ?? '',
          phone: data.phone ?? '',
          role: data.role ?? 'passenger',
          status: data.status ?? 'active',
          totalTrips: data.totalTrips ?? 0,
          avgRating: data.avgRating ?? 0,
          createdAt: created?.toDate ? created.toDate() : new Date(),
        }
      }),
    )
  })
}

export async function setUserStatus(uid: string, status: 'active' | 'suspended' | 'banned') {
  await updateDoc(doc(db, 'users', uid), { status })
}

// ---- إدارة الرحلات ----
export interface ManagedTrip {
  id: string
  driverId: string
  originCity: string
  destinationCity: string
  departureTime: Date
  status: string
  totalSeats: number
  availableSeats: number
  pricePerSeat: number
}

export function subscribeAllTrips(callback: (trips: ManagedTrip[]) => void, count = 100) {
  const q = query(collection(db, 'trips'), orderBy('departureTime', 'desc'), limit(count))
  return onSnapshot(q, (snap) => {
    callback(
      snap.docs.map((d) => {
        const data = d.data()
        const dep = data.departureTime as { toDate?: () => Date }
        return {
          id: d.id,
          driverId: data.driverId ?? '',
          originCity: data.originCity ?? '',
          destinationCity: data.destinationCity ?? '',
          departureTime: dep?.toDate ? dep.toDate() : new Date(),
          status: data.status ?? 'pending',
          totalSeats: data.totalSeats ?? 0,
          availableSeats: data.availableSeats ?? 0,
          pricePerSeat: data.pricePerSeat ?? 0,
        }
      }),
    )
  })
}

/** حذف رحلة نهائيًا - الأدمن بس اللي يقدر يعمل كده لأي رحلة (السائق بيقدر يحذف بس رحلته هو) */
export async function deleteTrip(tripId: string) {
  await deleteDoc(doc(db, 'trips', tripId))
}

export interface SupportReport {
  id: string
  reporterId: string
  message: string
  status: 'pending' | 'resolved' | 'closed'
  createdAt: Date
}

export function subscribeSupportReports(callback: (items: SupportReport[]) => void) {
  const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'), limit(200))
  return onSnapshot(q, (snap) => {
    callback(
      snap.docs.map((d) => {
        const data = d.data()
        const created = data.createdAt as { toDate?: () => Date }
        return {
          id: d.id,
          reporterId: data.reporterId ?? '',
          message: data.message ?? '',
          status: data.status ?? 'pending',
          createdAt: created?.toDate ? created.toDate() : new Date(),
        }
      }),
    )
  })
}

export async function setReportStatus(reportId: string, status: SupportReport['status']) {
  await updateDoc(doc(db, 'reports', reportId), { status })
}
