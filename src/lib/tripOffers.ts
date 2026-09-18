import { collection, doc, addDoc, query, where, onSnapshot, Timestamp, getDoc, runTransaction } from 'firebase/firestore'
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
  const requestSnap = await getDoc(doc(db, 'tripRequests', input.requestId))
  if (!requestSnap.exists() || requestSnap.data().status !== 'active' || requestSnap.data().passengerId !== input.passengerId) {
    throw new Error('الطلب لم يعد متاحًا')
  }

  const docRef = await addDoc(collection(db, 'tripOffers'), {
    ...Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined)),
    driverId: uid,
    status: 'pending',
    createdAt: Timestamp.now(),
  })

  await addDoc(collection(db, 'users', input.passengerId, 'notifications'), {
    userId: input.passengerId,
    actorId: uid,
    type: 'tripOffer',
    title: 'وصلك عرض رحلة جديد!',
    body: `${input.driverName} بعتلك عرض بسعر ${input.pricePerSeat} ج.م للمقعد. شوف التفاصيل.`,
    relatedId: input.requestId,
    isRead: false,
    createdAt: Timestamp.now(),
  }).catch(() => undefined)

  return docRef.id
}

/** كل العروض اللي وصلت لطلب معيّن (بيستخدمها الراكب) */
export function subscribeOffersForRequest(requestId: string, callback: (offers: TripOffer[]) => void) {
  const q = query(collection(db, 'tripOffers'), where('requestId', '==', requestId))
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => mapDoc(d.id, d.data())).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()))
  })
}

export async function respondToTripOffer(offer: TripOffer, accept: boolean) {
  const uid = auth.currentUser?.uid
  if (!uid || uid !== offer.passengerId) throw new Error('الطلب ده مش بتاعك')
  let route = ''
  await runTransaction(db, async (tx) => {
    const offerRef = doc(db, 'tripOffers', offer.id)
    const requestRef = doc(db, 'tripRequests', offer.requestId)
    const offerSnap = await tx.get(offerRef)
    const requestSnap = await tx.get(requestRef)
    if (!offerSnap.exists() || !requestSnap.exists()) throw new Error('الطلب أو العرض لم يعد موجودًا')
    if (offerSnap.data().passengerId !== uid || requestSnap.data().passengerId !== uid || offerSnap.data().requestId !== offer.requestId) throw new Error('لا يمكنك الرد على هذا العرض')
    if (offerSnap.data().status !== 'pending' || requestSnap.data().status !== 'active') throw new Error('تم الرد على الطلب بالفعل')
    route = `${requestSnap.data().originCity} → ${requestSnap.data().destinationCity}`
    tx.update(offerRef, { status: accept ? 'accepted' : 'rejected' })
    if (accept) tx.update(requestRef, { status: 'matched' })
  })

  await addDoc(collection(db, 'users', offer.driverId, 'notifications'), {
    userId: offer.driverId,
    actorId: uid,
    type: 'tripOfferResponse',
    title: accept ? 'الراكب وافق على عرضك! 🎉' : 'الراكب اعتذر عن عرضك',
    body: accept
      ? `تقدر تكلّم الراكب دلوقتي وتتفقوا على تفاصيل الرحلة (${route})`
      : `الراكب مش متاح للعرض ده، جرّب رحلات تانية في مجتمع الرحلات`,
    relatedId: offer.requestId,
    isRead: false,
    createdAt: Timestamp.now(),
  }).catch(() => undefined)
}

/** عروض السائق ونتيجة رد الراكب بتظهر له فورًا. */
export function subscribeDriverOffers(driverId: string, callback: (offers: TripOffer[]) => void) {
  return onSnapshot(query(collection(db, 'tripOffers'), where('driverId', '==', driverId)), (snap) => {
    callback(snap.docs.map((d) => mapDoc(d.id, d.data())).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()))
  })
}
