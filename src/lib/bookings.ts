import { collection, doc, query, where, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from './firebase'
import type { Booking } from '../types/booking'

function mapBookingDoc(id: string, data: Record<string, unknown>): Booking {
  const created = data.createdAt as { toDate?: () => Date }
  return {
    id,
    tripId: data.tripId as string,
    passengerId: data.passengerId as string,
    driverId: data.driverId as string,
    seatsBooked: data.seatsBooked as number,
    status: data.status as Booking['status'],
    totalPrice: data.totalPrice as number,
    paymentMethod: data.paymentMethod as Booking['paymentMethod'],
    paymentStatus: data.paymentStatus as Booking['paymentStatus'],
    pickupLat: (data.pickupLat as number) ?? null,
    pickupLng: (data.pickupLng as number) ?? null,
    startPin: (data.startPin as string) ?? null,
    pinVerified: Boolean(data.pinVerified),
    createdAt: created?.toDate ? created.toDate() : new Date(),
  }
}

export function subscribeBooking(bookingId: string, callback: (booking: Booking | null) => void) {
  return onSnapshot(doc(db, 'bookings', bookingId), (snap) => {
    callback(snap.exists() ? mapBookingDoc(snap.id, snap.data()) : null)
  })
}

export function subscribePassengerBookings(passengerId: string, callback: (bookings: Booking[]) => void) {
  const q = query(collection(db, 'bookings'), where('passengerId', '==', passengerId), orderBy('createdAt', 'desc'))
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => mapBookingDoc(d.id, d.data())))
  })
}
