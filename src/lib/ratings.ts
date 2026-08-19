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

/**
 * آراء حقيقية للعرض في صفحة الهبوط - تقييمات 4 نجوم فأكتر ومعاها
 * تعليق فعلي بس (مش أي تقييم عشوائي)، عشان القسم يبقى ذو معنى ومفيدش
 * أي بيانات مزيّفة.
 */
export async function fetchTopTestimonials(count = 6) {
  const q = query(collection(db, 'ratings'), where('stars', '>=', 4), limit(count * 3))
  const snap = await getDocs(q)
  return snap.docs
    .map((d) => {
      const data = d.data()
      return {
        id: d.id,
        stars: data.stars as number,
        comment: (data.comment as string) ?? '',
        toUserId: data.toUserId as string,
      }
    })
    .filter((r) => r.comment.trim().length > 0)
    .slice(0, count)
}
