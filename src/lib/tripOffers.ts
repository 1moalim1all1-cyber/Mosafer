import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { callServer } from './server'
import { db, auth } from './firebase'
import type { TripOffer } from '../types/tripOffer'

function mapDoc(id: string, data: Record<string, unknown>): TripOffer {
  const created = data.createdAt as { toDate?: () => Date }
  return {
    id,
    requestId: data.requestId as string,
    passengerId: data.passengerId as string,
    driverId: data.driverId as string,
    driverName: data.driverName as string,
    departureTime: data.departureTime as string,
    pricePerSeat: data.pricePerSeat as number,
    seatsOffered: data.seatsOffered as number,
    pickupPoint: (data.pickupPoint as string) ?? undefined,
    message: (data.message as string) ?? undefined,
    status: (data.status as TripOffer['status']) ?? 'pending',
    createdAt: created?.toDate ? created.toDate() : new Date(),
    tripId: data.tripId as string | undefined,
    bookingId: data.bookingId as string | undefined,
  }
}

/** بيبعت عرض حقيقي منظّم (مش بس إشعار نصّي) + إشعار للراكب إنه وصله عرض جديد */
export async function sendTripOffer(input: {
  requestId: string
  passengerId: string
  driverName: string
  departureTime: string
  pricePerSeat: number
  seatsOffered: number
  pickupPoint?: string
  message?: string
}): Promise<string> {
  const result = await callServer<{ offerId: string }>('sendTripOffer', input)
  return result.offerId
}

/** كل العروض اللي وصلت لطلب معيّن (بيستخدمها الراكب) */
export function subscribeOffersForRequest(requestId: string, callback: (offers: TripOffer[]) => void) {
  const q = query(collection(db, 'tripOffers'), where('requestId', '==', requestId), where('passengerId', '==', auth.currentUser?.uid ?? ''))
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => mapDoc(d.id, d.data())).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()))
  })
}

export async function respondToTripOffer(offer: TripOffer, accept: boolean) {
  return callServer<{ bookingId: string | null; tripId: string | null }>('respondToTripOffer', { offerId: offer.id, accept })
}

/** عروض السائق ونتيجة رد الراكب بتظهر له فورًا. */
export function subscribeDriverOffers(driverId: string, callback: (offers: TripOffer[]) => void) {
  return onSnapshot(query(collection(db, 'tripOffers'), where('driverId', '==', driverId)), (snap) => {
    callback(snap.docs.map((d) => mapDoc(d.id, d.data())).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()))
  })
}
