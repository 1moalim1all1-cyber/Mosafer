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
    country: (data.country as string) ?? 'egypt',
  }
}

export function subscribeDriverTrips(driverId: string, callback: (trips: Trip[]) => void) {
  const q = query(collection(db, 'trips'), where('driverId', '==', driverId), orderBy('departureTime', 'desc'))
  return onSnapshot(q, (snap) => {
    const trips = snap.docs.map((d) => mapTripDoc(d.id, d.data()))

    // مفيش سيرفر خلفي شغال 24 ساعة يقفل الرحلات القديمة لوحده (محتاج
    // خطة Blaze)، فبنعمل تحديث "كسول" بدل كده: أول ما السائق يفتح
    // لوحته، أي رحلة فات ميعادها بأكتر من 3 ساعات ولسه "نشطة" أو
    // "مكتملة المقاعد" بنقفلها تلقائيًا هنا
    const threeHoursAgo = Date.now() - 3 * 60 * 60 * 1000
    trips.forEach((trip) => {
      if ((trip.status === 'active' || trip.status === 'full') && trip.departureTime.getTime() < threeHoursAgo) {
        updateTripStatus(trip.id, 'expired').catch(() => {
          // لو فشل التحديث، منمنعش عرض الرحلات على أي حال
        })
      }
    })

    callback(trips)
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

      const driverRef = doc(db, 'users', uid)
      const driverWalletRef = doc(db, 'wallets', uid)
      await tx.get(driverRef)
      const driverWalletSnap = await tx.get(driverWalletRef)

      const isReturnEmpty = Boolean(trip.isReturnEmptyTrip)
      const commissionPercent = isReturnEmpty
        ? (settings.commissionReturnEmptyPercent ?? 5)
        : (settings.commissionStandardPercent ?? 10)

      let paidEarnings = 0
      for (const bookingDoc of bookingsSnap.docs) {
        const booking = bookingDoc.data()
        if (booking.paymentStatus === 'paid') {
          const commission = (booking.totalPrice as number) * (commissionPercent / 100)
          paidEarnings += (booking.totalPrice as number) - commission
        }
      }

      tx.update(tripRef, { status: 'completed' })
      tx.set(doc(db, 'stats', 'public'), { completedTripsCount: increment(1) }, { merge: true })
      tx.update(driverRef, { totalTrips: increment(1) })

      for (const bookingDoc of bookingsSnap.docs) {
        tx.update(bookingDoc.ref, { status: 'completed' })
      }

      if (paidEarnings > 0) {
        const currentBalance = (driverWalletSnap.data()?.balance ?? 0) as number
        const newBalance = currentBalance + paidEarnings
        tx.update(driverWalletRef, { balance: newBalance })
        tx.set(doc(collection(driverWalletRef, 'walletTransactions')), {
          type: 'payment',
          amount: paidEarnings,
          balanceAfter: newBalance,
          relatedTripId: tripId,
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

/** قبول أو رفض حجز - لو رفض، بيرجّع المقاعد لتاني وبيسترد الفلوس لو كانت مدفوعة */
export async function respondToBooking(bookingId: string, accept: boolean) {
  const bookingRef = doc(db, 'bookings', bookingId)

  try {
    await runTransaction(db, async (tx) => {
      const bookingSnap = await tx.get(bookingRef)
      if (!bookingSnap.exists()) throw new Error('الحجز ده مش موجود')
      const booking = bookingSnap.data()
      if (booking.status !== 'pending') throw new Error('الحجز ده اترد عليه بالفعل')

      const tripRef = doc(db, 'trips', booking.tripId)
      const tripSnap = await tx.get(tripRef)

      if (accept) {
        tx.update(bookingRef, { status: 'confirmed' })
        return
      }

      if (tripSnap.exists()) {
        const trip = tripSnap.data()
        tx.update(tripRef, {
          availableSeats: (trip.availableSeats as number) + (booking.seatsBooked as number),
          status: 'active',
        })
      }

      const bookingUpdate: Record<string, string> = { status: 'rejected' }
      if (booking.paymentStatus === 'paid' && booking.paymentMethod === 'wallet') {
        bookingUpdate.paymentStatus = 'refund_pending'
      }
      tx.update(bookingRef, bookingUpdate)
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
    pickupLat: (data.pickupLat as number) ?? null,
    pickupLng: (data.pickupLng as number) ?? null,
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
