import { collection, addDoc, Timestamp } from 'firebase/firestore'
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
