import { collection, addDoc, query, where, limit, getDocs, Timestamp } from 'firebase/firestore'
import { db } from './firebase'

export type RatingDirection = 'passengerToDriver' | 'driverToPassenger'

export async function hasRated(bookingId: string, fromUserId: string): Promise<boolean> {
  const q = query(
    collection(db, 'ratings'),
    where('bookingId', '==', bookingId),
    where('fromUserId', '==', fromUserId),
    limit(1),
  )
  const snap = await getDocs(q)
  return !snap.empty
}

export async function submitRating(params: {
  tripId: string
  bookingId: string
  fromUserId: string
  toUserId: string
  direction: RatingDirection
  stars: number
  comment?: string
}) {
  await addDoc(collection(db, 'ratings'), {
    ...params,
    isReported: false,
    createdAt: Timestamp.now(),
  })
}
