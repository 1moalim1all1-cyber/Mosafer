import {
  doc,
  setDoc,
  addDoc,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  getDoc,
} from 'firebase/firestore'
import { db } from './firebase'
import { callServer } from './server'
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
      rejectionReason: null,
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

export async function markTripCompleted(tripId: string) {
  await callServer('changeTripStatus', { tripId, status: 'completed' })
}

export async function respondToBooking(bookingId: string, accept: boolean) {
  await callServer('respondToBooking', { bookingId, accept })
}

export async function fetchDriverDocStatus(uid: string) {
  const snap = await getDoc(doc(db, 'drivers', uid))
  return snap.exists() ? snap.data() : null
}

export async function updateTripStatus(tripId: string, status: Trip['status']) {
  await callServer('changeTripStatus', { tripId, status })
}

function mapBookingDoc(id: string, data: Record<string, unknown>) {
  const created = data.createdAt as { toDate?: () => Date }
  const passengerLiveUpdatedAt = data.passengerLiveUpdatedAt as { toDate?: () => Date } | null
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
    passengerLiveLat: (data.passengerLiveLat as number) ?? null,
    passengerLiveLng: (data.passengerLiveLng as number) ?? null,
    passengerLiveUpdatedAt: passengerLiveUpdatedAt?.toDate ? passengerLiveUpdatedAt.toDate() : null,
    createdAt: created?.toDate ? created.toDate() : new Date(),
  }
}

/** السائق بيدخل الكود اللي الراكب قاله عشان يتأكد من هويته وقت الاستلام */
export async function verifyPassengerPin(bookingId: string, enteredPin: string): Promise<boolean> {
  const result = await callServer<{ verified: boolean }>('verifyPassengerPin', { bookingId, pin: enteredPin })
  return result.verified
}

export function subscribeTripBookings(tripId: string, callback: (bookings: ReturnType<typeof mapBookingDoc>[]) => void) {
  const q = query(collection(db, 'bookings'), where('tripId', '==', tripId), orderBy('createdAt', 'desc'))
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => mapBookingDoc(d.id, d.data())))
  })
}
