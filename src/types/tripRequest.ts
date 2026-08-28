export type TripRequestStatus = 'active' | 'matched' | 'expired' | 'cancelled'

export interface TripRequest {
  id: string
  passengerId: string
  country: string
  originCity: string
  destinationCity: string
  travelDate: string // YYYY-MM-DD
  preferredTime?: string // HH:mm، اختياري
  seatsNeeded: number
  notes?: string
  status: TripRequestStatus
  createdAt: Date
}
