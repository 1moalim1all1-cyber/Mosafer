import { collection, doc, addDoc, updateDoc, query, where, orderBy, onSnapshot, Timestamp, getDoc } from 'firebase/firestore'
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
  const uid = auth.currentUser?.uid
  if (!uid) throw new Error('لازم تسجّل دخول الأول')

  const docRef = await addDoc(collection(db, 'tripOffers'), {
    ...input,
    driverId: uid,
    status: 'pending',
    createdAt: Timestamp.now(),
  })

  await addDoc(collection(db, 'users', input.passengerId, 'notifications'), {
    type: 'tripOffer',
    title: 'وصلك عرض رحلة جديد!',
    body: `${input.driverName} بعتلك عرض بسعر ${input.pricePerSeat} ج.م للمقعد. شوف التفاصيل.`,
    relatedId: input.requestId,
    isRead: false,
    createdAt: Timestamp.now(),
  })

  return docRef.id
}

/** كل العروض اللي وصلت لطلب معيّن (بيستخدمها الراكب) */
export function subscribeOffersForRequest(requestId: string, callback: (offers: TripOffer[]) => void) {
  const q = query(collection(db, 'tripOffers'), where('requestId', '==', requestId), orderBy('createdAt', 'desc'))
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => mapDoc(d.id, d.data())))
  })
}

export async function respondToTripOffer(offer: TripOffer, accept: boolean) {
  await updateDoc(doc(db, 'tripOffers', offer.id), { status: accept ? 'accepted' : 'rejected' })

  if (accept) {
    // لو اتقبل، نقفل الطلب نفسه بحالة "اتلاقت رحلة"
    await updateDoc(doc(db, 'tripRequests', offer.requestId), { status: 'matched' })
  }

  const requestSnap = await getDoc(doc(db, 'tripRequests', offer.requestId))
  const requestData = requestSnap.data()

  await addDoc(collection(db, 'users', offer.driverId, 'notifications'), {
    type: 'tripOfferResponse',
    title: accept ? 'الراكب وافق على عرضك! 🎉' : 'الراكب اعتذر عن عرضك',
    body: accept
      ? `تقدر تكلّم الراكب دلوقتي وتتفقوا على تفاصيل الرحلة (${requestData?.originCity} → ${requestData?.destinationCity})`
      : `الراكب مش متاح للعرض ده، جرّب رحلات تانية في مجتمع الرحلات`,
    relatedId: offer.requestId,
    isRead: false,
    createdAt: Timestamp.now(),
  })
}
