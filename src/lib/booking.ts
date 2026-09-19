import { callServer } from './server'
import type { PaymentMethod } from '../types/booking'

export async function createBooking(params: {
  tripId: string; seatsBooked: number; paymentMethod: PaymentMethod; couponCode?: string
  pickupLat?: number; pickupLng?: number
}): Promise<string> {
  const result = await callServer<{ bookingId: string }>('createBooking', params)
  return result.bookingId
}

export async function cancelBooking(bookingId: string): Promise<void> {
  await callServer('cancelBooking', { bookingId })
}
