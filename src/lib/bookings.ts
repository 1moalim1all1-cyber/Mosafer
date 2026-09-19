import { collection, doc, query, where, orderBy, onSnapshot, updateDoc, Timestamp } from 'firebase/firestore'
import { db, auth } from './firebase'
import type { Booking } from '../types/booking'

function mapBookingDoc(id: string, data: Record<string, unknown>): Booking {
  const created = data.createdAt as { toDate?: () => Date }
  const passengerLiveUpdatedAt = data.passengerLiveUpdatedAt as { toDate?: () => Date } | null
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
    passengerLiveLat: (data.passengerLiveLat as number) ?? null,
    passengerLiveLng: (data.passengerLiveLng as number) ?? null,
    passengerLiveUpdatedAt: passengerLiveUpdatedAt?.toDate ? passengerLiveUpdatedAt.toDate() : null,
    startPin: null,
    pinVerified: Boolean(data.pinVerified),
    createdAt: created?.toDate ? created.toDate() : new Date(),
  }
}

export async function updatePassengerLiveLocation(bookingId: string, lat: number, lng: number) {
  await updateDoc(doc(db, 'bookings', bookingId), {
    passengerLiveLat: lat,
    passengerLiveLng: lng,
    passengerLiveUpdatedAt: Timestamp.now(),
  })
}

export async function stopPassengerLiveLocation(bookingId: string) {
  await updateDoc(doc(db, 'bookings', bookingId), {
    passengerLiveLat: null,
    passengerLiveLng: null,
    passengerLiveUpdatedAt: null,
  })
}

export function subscribeBooking(bookingId: string, callback: (booking: Booking | null) => void) {
  let booking: Booking | null = null
  let pin: string | null = null
  let stopPin: (() => void) | undefined
  const emit = () => callback(booking ? { ...booking, startPin: pin } : null)
  const stopBooking = onSnapshot(doc(db, 'bookings', bookingId), snap => {
    booking = snap.exists() ? mapBookingDoc(snap.id, snap.data()) : null
    if (booking?.passengerId === auth.currentUser?.uid && booking?.status === 'confirmed' && !booking.pinVerified) {
      if (!stopPin) stopPin = onSnapshot(doc(db, 'bookingPins', bookingId), secret => {
        pin = secret.data()?.pin ?? null; emit()
      }, () => { pin = null; emit() })
    } else { stopPin?.(); stopPin = undefined; pin = null }
    emit()
  }, () => { booking = null; stopPin?.(); emit() })
  return () => { stopBooking(); stopPin?.() }

}

export function subscribePassengerBookings(passengerId: string, callback: (bookings: Booking[]) => void) {
  const q = query(collection(db, 'bookings'), where('passengerId', '==', passengerId), orderBy('createdAt', 'desc'))
  let rows: Booking[] = []
  const pins = new Map<string, string>()
  const listeners = new Map<string, () => void>()
  const emit = () => callback(rows.map(row => ({ ...row, startPin: pins.get(row.id) ?? null })))
  const stopBookings = onSnapshot(q, snap => {
    rows = snap.docs.map(d => mapBookingDoc(d.id, d.data()))
    const wanted = new Set(rows.filter(b => b.status === 'confirmed' && !b.pinVerified).map(b => b.id))
    for (const [key, stop] of listeners) if (!wanted.has(key)) { stop(); listeners.delete(key); pins.delete(key) }
    for (const key of wanted) if (!listeners.has(key)) {
      listeners.set(key, onSnapshot(doc(db, 'bookingPins', key), secret => {
        if (secret.exists()) pins.set(key, secret.data().pin); else pins.delete(key)
        emit()
      }, () => { pins.delete(key); emit() }))
    }
    emit()
  })
  return () => { stopBookings(); listeners.forEach(stop => stop()) }
}
