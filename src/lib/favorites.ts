import { doc, updateDoc, arrayUnion, arrayRemove, onSnapshot } from 'firebase/firestore'
import { db } from './firebase'

export function subscribeFavorites(uid: string, callback: (favoriteTripIds: string[]) => void) {
  return onSnapshot(doc(db, 'users', uid), (snap) => {
    callback(snap.exists() ? (snap.data().favoriteTrips ?? []) : [])
  })
}

export async function toggleFavorite(uid: string, tripId: string, isCurrentlyFavorite: boolean) {
  await updateDoc(doc(db, 'users', uid), {
    favoriteTrips: isCurrentlyFavorite ? arrayRemove(tripId) : arrayUnion(tripId),
  })
}
