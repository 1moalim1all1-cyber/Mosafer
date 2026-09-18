import { collection, doc, addDoc, updateDoc, query, where, onSnapshot, Timestamp } from 'firebase/firestore'
import { db, auth } from './firebase'
import type { TripRequest } from '../types/tripRequest'

function mapDoc(id: string, data: Record<string, unknown>): TripRequest {
  const created = data.createdAt as { toDate?: () => Date }
  return {
    id,
    passengerId: data.passengerId as string,
    country: data.country as string,
    originCity: data.originCity as string,
    originLat: (data.originLat as number) ?? null,
    originLng: (data.originLng as number) ?? null,
    destinationCity: data.destinationCity as string,
    destinationLat: (data.destinationLat as number) ?? null,
    destinationLng: (data.destinationLng as number) ?? null,
    travelDate: data.travelDate as string,
    preferredTime: (data.preferredTime as string) ?? undefined,
    seatsNeeded: (data.seatsNeeded as number) ?? 1,
    notes: (data.notes as string) ?? undefined,
    status: (data.status as TripRequest['status']) ?? 'active',
    createdAt: created?.toDate ? created.toDate() : new Date(),
  }
}

/** الطلب يختفي من العرض العام بعد وقته، أو بنهاية يوم السفر لو الوقت اختياري. */
export function isTripRequestCurrent(request: Pick<TripRequest, 'travelDate' | 'preferredTime' | 'status'>, now = new Date()) {
  if (request.status !== 'active') return false
  const endTime = request.preferredTime || '23:59:59'
  const expiresAt = new Date(`${request.travelDate}T${endTime}`)
  // الوقت هنا "مفضّل" مش موعد إغلاق صارم؛ نخلي الطلب ظاهر ساعتين
  // بعده عشان السائقين يلحقوا يردوا، بدل ما يختفي مع أول تحديث للصفحة.
  if (request.preferredTime) expiresAt.setHours(expiresAt.getHours() + 2)
  return !Number.isNaN(expiresAt.getTime()) && expiresAt.getTime() >= now.getTime()
}

export async function createTripRequest(input: {
  country: string
  originCity: string
  originLat?: number
  originLng?: number
  destinationCity: string
  destinationLat?: number
  destinationLng?: number
  travelDate: string
  preferredTime?: string
  seatsNeeded: number
  notes?: string
}): Promise<string> {
  const uid = auth.currentUser?.uid
  if (!uid) throw new Error('لازم تسجّل دخول الأول')

  const requestedTime = new Date(`${input.travelDate}T${input.preferredTime || '23:59:59'}`)
  if (Number.isNaN(requestedTime.getTime()) || requestedTime.getTime() <= Date.now()) {
    throw new Error('اختار تاريخ ووقت لسه مجاش')
  }

  // Firestore بيرفض أي خاصية قيمتها undefined. حقول الموقع والوقت
  // والملاحظات اختيارية، فنبني المستند بالقيم الموجودة فقط.
  const cleanInput = Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined),
  )

  const docRef = await addDoc(collection(db, 'tripRequests'), {
    passengerId: uid,
    ...cleanInput,
    status: 'active',
    createdAt: Timestamp.now(),
  })
  return docRef.id
}

/** فيد طلبات الرحلات النشطة - للسائقين يدوّروا على طلبات في اتجاههم */
export function subscribeActiveTripRequests(country: string, callback: (requests: TripRequest[]) => void, count = 30) {
  // الترتيب بـ createdAt مع country + status كان محتاج Composite Index
  // منشور يدويًا في Firebase. بنجيب البيانات بفلتر بسيط ونرتبها محليًا
  // عشان الطلب ما يظهرش من الكاش ثم يختفي بعد Refresh لو الفهرس ناقص.
  const q = query(
    collection(db, 'tripRequests'),
    where('status', '==', 'active'),
  )
  let latestRequests: TripRequest[] = []
  const emitCurrentRequests = () => callback(
    latestRequests
      .filter((request) => request.country === country && isTripRequestCurrent(request))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, count),
  )
  const unsubscribe = onSnapshot(q, (snap) => {
    latestRequests = snap.docs.map((d) => mapDoc(d.id, d.data()))
    emitCurrentRequests()
  }, (error) => {
    console.error('Failed to load active trip requests', error)
    callback([])
  })
  const expiryTimer = window.setInterval(emitCurrentRequests, 30_000)

  return () => {
    window.clearInterval(expiryTimer)
    unsubscribe()
  }
}

/** طلبات الرحلات بتاعة راكب معيّن (لشاشة "طلباتي") */
export function subscribeMyTripRequests(passengerId: string, callback: (requests: TripRequest[]) => void) {
  const q = query(collection(db, 'tripRequests'), where('passengerId', '==', passengerId))
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => {
      const request = mapDoc(d.id, d.data())
      return request.status === 'active' && !isTripRequestCurrent(request)
        ? { ...request, status: 'expired' as const }
        : request
    }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()))
  }, (error) => {
    console.error('Failed to load passenger trip requests', error)
    callback([])
  })
}

export async function cancelTripRequest(requestId: string) {
  await updateDoc(doc(db, 'tripRequests', requestId), { status: 'cancelled' })
}
