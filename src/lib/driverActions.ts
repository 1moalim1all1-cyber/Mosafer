import { doc, setDoc, addDoc, updateDoc, collection, query, where, orderBy, onSnapshot, getDoc } from 'firebase/firestore'
import { httpsCallable, FunctionsError } from 'firebase/functions'
import { db, functions } from './firebase'
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

export async function markTripCompleted(tripId: string) {
  try {
    const callable = httpsCallable(functions, 'markTripCompleted')
    await callable({ tripId })
  } catch (err) {
    if (err instanceof FunctionsError) throw new Error(err.message)
    throw new Error('حصل خطأ، حاول تاني')
  }
}

export async function respondToBooking(bookingId: string, accept: boolean) {
  try {
    const callable = httpsCallable(functions, 'respondToBooking')
    await callable({ bookingId, accept })
  } catch (err) {
    if (err instanceof FunctionsError) throw new Error(err.message)
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
    createdAt: created?.toDate ? created.toDate() : new Date(),
  }
}

export function subscribeTripBookings(tripId: string, callback: (bookings: ReturnType<typeof mapBookingDoc>[]) => void) {
  const q = query(collection(db, 'bookings'), where('tripId', '==', tripId), orderBy('createdAt', 'desc'))
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => mapBookingDoc(d.id, d.data())))
  })
}
