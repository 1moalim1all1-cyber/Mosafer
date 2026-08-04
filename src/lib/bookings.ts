import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from './firebase'
import type { Booking } from '../types/booking'

export function subscribePassengerBookings(passengerId: string, callback: (bookings: Booking[]) => void) {
  const q = query(collection(db, 'bookings'), where('passengerId', '==', passengerId), orderBy('createdAt', 'desc'))
  return onSnapshot(q, (snap) => {
    callback(
      snap.docs.map((d) => {
        const data = d.data()
        const created = data.createdAt as { toDate?: () => Date }
        return {
          id: d.id,
          tripId: data.tripId,
          passengerId: data.passengerId,
          driverId: data.driverId,
          seatsBooked: data.seatsBooked,
          status: data.status,
          totalPrice: data.totalPrice,
          paymentMethod: data.paymentMethod,
          paymentStatus: data.paymentStatus,
          createdAt: created?.toDate ? created.toDate() : new Date(),
        }
      }),
    )
  })
}
