export type TripOfferStatus = 'pending' | 'accepted' | 'rejected'

export interface TripOffer {
  id: string
  requestId: string
  passengerId: string
  driverId: string
  driverName: string
  departureTime: string // HH:mm
  pricePerSeat: number
  seatsOffered: number
  pickupPoint?: string
  message?: string
  status: TripOfferStatus
  createdAt: Date
}
