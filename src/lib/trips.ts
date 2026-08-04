import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  onSnapshot,
  Timestamp,
  type DocumentData,
} from 'firebase/firestore'
import { db } from './firebase'
import type { Trip, TripSearchParams } from '../types/trip'

function mapTripDoc(id: string, data: DocumentData): Trip {
  return {
    id,
    driverId: data.driverId ?? '',
    status: data.status ?? 'pending',
    originCity: data.originCity ?? '',
    originGovernorate: data.originGovernorate ?? '',
    originLat: data.originLat ?? 0,
    originLng: data.originLng ?? 0,
    destinationCity: data.destinationCity ?? '',
    destinationGovernorate: data.destinationGovernorate ?? '',
    destinationLat: data.destinationLat ?? 0,
    destinationLng: data.destinationLng ?? 0,
    departureTime: data.departureTime instanceof Timestamp ? data.departureTime.toDate() : new Date(),
    estimatedArrivalTime:
      data.estimatedArrivalTime instanceof Timestamp ? data.estimatedArrivalTime.toDate() : null,
    estimatedDurationMinutes: data.estimatedDurationMinutes ?? 0,
    pricePerSeat: data.pricePerSeat ?? 0,
    totalSeats: data.totalSeats ?? 0,
    availableSeats: data.availableSeats ?? 0,
    isReturnEmptyTrip: Boolean(data.isReturnEmptyTrip),
    isWomenOnly: Boolean(data.isWomenOnly),
    carType: data.carType ?? '',
    driverLiveLat: data.driverLiveLat ?? null,
    driverLiveLng: data.driverLiveLng ?? null,
    driverLiveUpdatedAt:
      data.driverLiveUpdatedAt instanceof Timestamp ? data.driverLiveUpdatedAt.toDate() : null,
  }
}

/**
 * البحث عن رحلات - نفس منطق نسخة Flutter بالظبط: فلترة "سيدات فقط" بتتفرض
 * هنا على مستوى الاستعلام نفسه حسب جنس المستخدم، مش مجرد إخفاء في الواجهة،
 * وده بيتوافق مع نفس القاعدة المفروضة في firestore.rules.
 */
export async function searchTrips(params: TripSearchParams, requesterGender: 'male' | 'female'): Promise<Trip[]> {
  const startOfDay = new Date(params.date.getFullYear(), params.date.getMonth(), params.date.getDate())
  const endOfDay = new Date(startOfDay)
  endOfDay.setDate(endOfDay.getDate() + 1)

  const constraints = [
    where('status', '==', 'active'),
    where('originCity', '==', params.originCity),
    where('destinationCity', '==', params.destinationCity),
    where('departureTime', '>=', Timestamp.fromDate(startOfDay)),
    where('departureTime', '<', Timestamp.fromDate(endOfDay)),
  ]

  if (requesterGender === 'male') {
    constraints.push(where('isWomenOnly', '==', false))
  } else if (params.womenOnlyFilter) {
    constraints.push(where('isWomenOnly', '==', true))
  }

  if (params.returnEmptyOnly) {
    constraints.push(where('isReturnEmptyTrip', '==', true))
  }

  const q = query(collection(db, 'trips'), ...constraints, orderBy('departureTime'))
  const snap = await getDocs(q)

  return snap.docs
    .map((d) => mapTripDoc(d.id, d.data()))
    .filter((trip) => trip.availableSeats >= params.seatsNeeded)
}

/** متابعة رحلة معيّنة لحظيًا - بيتحدّث تلقائيًا مع أي تغيير (عدد المقاعد، موقع السائق الحي) */
export function subscribeToTrip(tripId: string, callback: (trip: Trip | null) => void) {
  return onSnapshot(doc(db, 'trips', tripId), (snap) => {
    callback(snap.exists() ? mapTripDoc(snap.id, snap.data()) : null)
  })
}
