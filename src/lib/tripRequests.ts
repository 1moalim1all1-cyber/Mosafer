import { collection, doc, addDoc, updateDoc, query, where, orderBy, limit, onSnapshot, Timestamp } from 'firebase/firestore'
import { db, auth } from './firebase'
import type { TripRequest } from '../types/tripRequest'

function mapDoc(id: string, data: Record<string, unknown>): TripRequest {
  const created = data.createdAt as { toDate?: () => Date }
  return {
    id,
    passengerId: data.passengerId as string,
    country: data.country as string,
    originCity: data.originCity as string,
    destinationCity: data.destinationCity as string,
    travelDate: data.travelDate as string,
    preferredTime: (data.preferredTime as string) ?? undefined,
    seatsNeeded: (data.seatsNeeded as number) ?? 1,
    notes: (data.notes as string) ?? undefined,
    status: (data.status as TripRequest['status']) ?? 'active',
    createdAt: created?.toDate ? created.toDate() : new Date(),
  }
}

export async function createTripRequest(input: {
  country: string
  originCity: string
  destinationCity: string
  travelDate: string
  preferredTime?: string
  seatsNeeded: number
  notes?: string
}): Promise<string> {
  const uid = auth.currentUser?.uid
  if (!uid) throw new Error('لازم تسجّل دخول الأول')

  const docRef = await addDoc(collection(db, 'tripRequests'), {
    passengerId: uid,
    ...input,
    status: 'active',
    createdAt: Timestamp.now(),
  })
  return docRef.id
}

/** فيد طلبات الرحلات النشطة - للسائقين يدوّروا على طلبات في اتجاههم */
export function subscribeActiveTripRequests(country: string, callback: (requests: TripRequest[]) => void, count = 30) {
  const q = query(
    collection(db, 'tripRequests'),
    where('country', '==', country),
    where('status', '==', 'active'),
    orderBy('createdAt', 'desc'),
    limit(count),
  )
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => mapDoc(d.id, d.data())))
  })
}

/** طلبات الرحلات بتاعة راكب معيّن (لشاشة "طلباتي") */
export function subscribeMyTripRequests(passengerId: string, callback: (requests: TripRequest[]) => void) {
  const q = query(collection(db, 'tripRequests'), where('passengerId', '==', passengerId), orderBy('createdAt', 'desc'))
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => mapDoc(d.id, d.data())))
  })
}

export async function cancelTripRequest(requestId: string) {
  await updateDoc(doc(db, 'tripRequests', requestId), { status: 'cancelled' })
}
