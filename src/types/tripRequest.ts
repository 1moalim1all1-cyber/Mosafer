export type TripRequestStatus = 'active' | 'matched' | 'expired' | 'cancelled'

export interface TripRequest {
  id: string
  passengerId: string
  country: string
  originCity: string
  originLat?: number | null
  originLng?: number | null
  destinationCity: string
  destinationLat?: number | null
  destinationLng?: number | null
  travelDate: string // YYYY-MM-DD
  preferredTime?: string // HH:mm، اختياري
  seatsNeeded: number
  notes?: string
  status: TripRequestStatus
  createdAt: Date
}
