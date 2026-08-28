import { collection, doc, addDoc, deleteDoc, query, where, getDocs, Timestamp } from 'firebase/firestore'
import { db, auth } from './firebase'

export async function saveTripAlert(input: { country: string; originCity: string; destinationCity: string }) {
  const uid = auth.currentUser?.uid
  if (!uid) throw new Error('لازم تسجّل دخول الأول')

  await addDoc(collection(db, 'tripAlerts'), {
    userId: uid,
    ...input,
    createdAt: Timestamp.now(),
  })
}

/**
 * بتتنادى تلقائي أول ما سائق ينشر رحلة جديدة (من createTrip) - بتدوّر
 * على أي تنبيهات محفوظة بنفس المسار وتبعت إشعار، وبعدين تمسح
 * التنبيه عشان منبعتش أكتر من مرة لنفس الرحلة
 */
export async function notifyMatchingTripAlerts(input: {
  country: string
  originCity: string
  destinationCity: string
  driverName: string
}) {
  const q = query(
    collection(db, 'tripAlerts'),
    where('country', '==', input.country),
    where('originCity', '==', input.originCity),
    where('destinationCity', '==', input.destinationCity),
  )
  const snap = await getDocs(q)

  await Promise.all(
    snap.docs.map(async (alertDoc) => {
      const userId = alertDoc.data().userId as string
      await addDoc(collection(db, 'users', userId, 'notifications'), {
        type: 'tripAlertMatch',
        title: 'في رحلة جديدة على المسار اللي طلبته!',
        body: `${input.driverName} نشر رحلة ${input.originCity} → ${input.destinationCity}. احجز قبل ما المقاعد تخلص.`,
        isRead: false,
        createdAt: Timestamp.now(),
      })
      await deleteDoc(doc(db, 'tripAlerts', alertDoc.id))
    }),
  )
}
