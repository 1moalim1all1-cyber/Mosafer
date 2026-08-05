export type BookingStatus = 'pending' | 'confirmed' | 'rejected' | 'cancelled' | 'completed'
export type PaymentMethod = 'cash' | 'card' | 'wallet'
export type PaymentStatus = 'pending' | 'paid' | 'refunded'

export interface Booking {
  id: string
  tripId: string
  passengerId: string
  driverId: string
  seatsBooked: number
  status: BookingStatus
  totalPrice: number
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  pickupLat?: number | null
  pickupLng?: number | null
  createdAt: Date
}

export interface DriverVehicle {
  make: string
  model: string
  year: number
  color: string
  plateNumber: string
  carType: string
  seats: number
}

export interface DriverProfile {
  uid: string
  verificationStatus: 'notSubmitted' | 'pending' | 'approved' | 'rejected'
  vehicle?: DriverVehicle | null
}
