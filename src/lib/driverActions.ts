import {
  doc,
  setDoc,
  addDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  getDoc,
  getDocs,
  increment,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore'
import { db, auth } from './firebase'
import { uploadImageToCloudinary } from './cloudinary'
import type { Trip } from '../types/trip'
import type { DriverVehicle } from '../types/booking'

export async function submitDriverDocuments(params: {
  uid: string
  nationalId: File
  license: File
  vehicleLicense: File
  vehicleImage: File
  selfie: File
  vehicle: DriverVehicle
}) {
  const [nationalIdUrl, licenseUrl, vehicleLicenseUrl, vehicleImageUrl, selfieUrl] = await Promise.all([
    uploadImageToCloudinary(params.nationalId, 'mosafer/drivers/national_id'),
    uploadImageToCloudinary(params.license, 'mosafer/drivers/license'),
    uploadImageToCloudinary(params.vehicleLicense, 'mosafer/drivers/license'),
    uploadImageToCloudinary(params.vehicleImage, 'mosafer/drivers/vehicle'),
    uploadImageToCloudinary(params.selfie, 'mosafer/users/profile'),
  ])

  await setDoc(
    doc(db, 'drivers', params.uid),
    {
      verificationStatus: 'pending',
      nationalIdImageUrl: nationalIdUrl,
      licenseImageUrl: licenseUrl,
      vehicleLicenseImageUrl: vehicleLicenseUrl,
      vehicleImageUrl: vehicleImageUrl,
      selfieVerificationUrl: selfieUrl,
      vehicle: params.vehicle,
    },
    { merge: true },
  )
}

export function subscribeDriverStatus(uid: string, callback: (status: string | null, reason?: string) => void) {
  return onSnapshot(doc(db, 'drivers', uid), (snap) => {
    if (!snap.exists()) {
      callback('notSubmitted')
      return
    }
    const data = snap.data()
    callback(data.verificationStatus ?? 'notSubmitted', data.rejectionReason)
  })
}

function mapTripDoc(id: string, data: Record<string, unknown>): Trip {
  const dep = data.departureTime as { toDate?: () => Date }
  return {
    id,
    driverId: data.driverId as string,
    status: data.status as Trip['status'],
    originCity: data.originCity as string,
    originGovernorate: data.originGovernorate as string,
    originLat: data.originLat as number,
    originLng: data.originLng as number,
    destinationCity: data.destinationCity as string,
    destinationGovernorate: data.destinationGovernorate as string,
    destinationLat: data.destinationLat as number,
    destinationLng: data.destinationLng as number,
    departureTime: dep?.toDate ? dep.toDate() : new Date(),
    estimatedDurationMinutes: data.estimatedDurationMinutes as number,
    pricePerSeat: data.pricePerSeat as number,
    totalSeats: data.totalSeats as number,
    availableSeats: data.availableSeats as number,
    isReturnEmptyTrip: Boolean(data.isReturnEmptyTrip),
    isWomenOnly: Boolean(data.isWomenOnly),
    carType: data.carType as string,
  }
}

export function subscribeDriverTrips(driverId: string, callback: (trips: Trip[]) => void) {
  const q = query(collection(db, 'trips'), where('driverId', '==', driverId), orderBy('departureTime', 'desc'))
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => mapTripDoc(d.id, d.data())))
  })
}

export async function createTrip(trip: Omit<Trip, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'trips'), {
    ...trip,
    createdAt: new Date(),
  })
  return docRef.id
}

/**
 * إنهاء الرحلة بالكامل من المتصفح (Firestore Transaction) - بيحوّل
 * أرباح الحجوزات المدفوعة بالمحفظة للسائق بعد خصم العمولة، ويزوّد عدد
 * الرحلات لكل من السائق والركاب المؤكدين.
 */
export async function markTripCompleted(tripId: string) {
  const uid = auth.currentUser?.uid
  if (!uid) throw new Error('لازم تسجّل دخول الأول')

  const tripRef = doc(db, 'trips', tripId)

  try {
    const bookingsSnap = await getDocs(
      query(collection(db, 'bookings'), where('tripId', '==', tripId), where('status', '==', 'confirmed')),
    )
    const settingsSnap = await getDoc(doc(db, 'appSettings', 'general'))
    const settings = settingsSnap.exists() ? settingsSnap.data() : {}

    await runTransaction(db, async (tx) => {
      const tripSnap = await tx.get(tripRef)
      if (!tripSnap.exists()) throw new Error('الرحلة دي مش موجودة')
      const trip = tripSnap.data()
      if (trip.driverId !== uid) throw new Error('الرحلة دي مش بتاعتك')

      tx.update(tripRef, { status: 'completed' })

      // زيادة العداد الاجتماعي العام - بيظهر في الصفحة الرئيسية لكل
      // المستخدمين ("أكتر من X رحلة اتعملت")، بيبني ثقة فورية
      tx.set(doc(db, 'stats', 'public'), { completedTripsCount: increment(1) }, { merge: true })

      const driverRef = doc(db, 'users', uid)
      tx.update(driverRef, { totalTrips: increment(1) })

      const isReturnEmpty = Boolean(trip.isReturnEmptyTrip)
      const commissionPercent = isReturnEmpty
        ? (settings.commissionReturnEmptyPercent ?? 5)
        : (settings.commissionStandardPercent ?? 10)

      for (const bookingDoc of bookingsSnap.docs) {
        const booking = bookingDoc.data()
        tx.update(bookingDoc.ref, { status: 'completed' })

        // ملحوظة: مش بنعدّل عدد رحلات الراكب هنا لأن قواعد الأمان بترفض
        // أي حساب يعدّل بيانات حساب تاني (وده صح ومقصود) - عدد رحلات
        // السائق بس هو اللي بيتحدّث، لأنه بيعدّل حسابه هو نفسه.
        if (booking.paymentStatus === 'paid') {
          const commission = (booking.totalPrice as number) * (commissionPercent / 100)
          const earnings = (booking.totalPrice as number) - commission

          const driverWalletRef = doc(db, 'wallets', uid)
          const driverWalletSnap = await tx.get(driverWalletRef)
          const currentBalance = (driverWalletSnap.data()?.balance ?? 0) as number
          const newBalance = currentBalance + earnings
          tx.update(driverWalletRef, { balance: newBalance })
          tx.set(doc(collection(driverWalletRef, 'walletTransactions')), {
            type: 'payment',
            amount: earnings,
            balanceAfter: newBalance,
            relatedBookingId: bookingDoc.id,
            status: 'completed',
            createdAt: serverTimestamp(),
          })
        }
      }
    })
  } catch (err) {
    if (err instanceof Error) throw err
    throw new Error('حصل خطأ، حاول تاني')
  }
}

/** قبول أو رفض حجز - لو رفض، بيرجّع المقاعد لتاني وبيسترد الفلوس لو كانت مدفوعة */
export async function respondToBooking(bookingId: string, accept: boolean) {
  const bookingRef = doc(db, 'bookings', bookingId)

  try {
    await runTransaction(db, async (tx) => {
      const bookingSnap = await tx.get(bookingRef)
      if (!bookingSnap.exists()) throw new Error('الحجز ده مش موجود')
      const booking = bookingSnap.data()
      if (booking.status !== 'pending') throw new Error('الحجز ده اترد عليه بالفعل')

      if (accept) {
        tx.update(bookingRef, { status: 'confirmed' })
        return
      }

      tx.update(bookingRef, { status: 'rejected' })

      const tripRef = doc(db, 'trips', booking.tripId)
      const tripSnap = await tx.get(tripRef)
      if (tripSnap.exists()) {
        const trip = tripSnap.data()
        tx.update(tripRef, {
          availableSeats: (trip.availableSeats as number) + (booking.seatsBooked as number),
          status: 'active',
        })
      }

      if (booking.paymentStatus === 'paid') {
        const walletRef = doc(db, 'wallets', booking.passengerId)
        const walletSnap = await tx.get(walletRef)
        const currentBalance = (walletSnap.data()?.balance ?? 0) as number
        const newBalance = currentBalance + (booking.totalPrice as number)
        tx.update(walletRef, { balance: newBalance })
        tx.set(doc(collection(walletRef, 'walletTransactions')), {
          type: 'refund',
          amount: booking.totalPrice,
          balanceAfter: newBalance,
          relatedBookingId: bookingId,
          status: 'completed',
          createdAt: serverTimestamp(),
        })
      }
    })
  } catch (err) {
    if (err instanceof Error) throw err
    throw new Error('حصل خطأ، حاول تاني')
  }
}

export async function fetchDriverDocStatus(uid: string) {
  const snap = await getDoc(doc(db, 'drivers', uid))
  return snap.exists() ? snap.data() : null
}

export async function updateTripStatus(tripId: string, status: Trip['status']) {
  await updateDoc(doc(db, 'trips', tripId), { status })
}

function mapBookingDoc(id: string, data: Record<string, unknown>) {
  const created = data.createdAt as { toDate?: () => Date }
  return {
    id,
    tripId: data.tripId as string,
    passengerId: data.passengerId as string,
    driverId: data.driverId as string,
    seatsBooked: data.seatsBooked as number,
    status: data.status as string,
    totalPrice: data.totalPrice as number,
    paymentMethod: data.paymentMethod as string,
    paymentStatus: data.paymentStatus as string,
    pinVerified: Boolean(data.pinVerified),
    createdAt: created?.toDate ? created.toDate() : new Date(),
  }
}

/** السائق بيدخل الكود اللي الراكب قاله عشان يتأكد من هويته وقت الاستلام */
export async function verifyPassengerPin(bookingId: string, enteredPin: string): Promise<boolean> {
  const bookingSnap = await getDoc(doc(db, 'bookings', bookingId))
  if (!bookingSnap.exists()) return false
  const correct = bookingSnap.data().startPin === enteredPin
  if (correct) {
    await updateDoc(doc(db, 'bookings', bookingId), { pinVerified: true })
  }
  return correct
}

export function subscribeTripBookings(tripId: string, callback: (bookings: ReturnType<typeof mapBookingDoc>[]) => void) {
  const q = query(collection(db, 'bookings'), where('tripId', '==', tripId), orderBy('createdAt', 'desc'))
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => mapBookingDoc(d.id, d.data())))
  })
}
