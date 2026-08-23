export type TripStatus = 'pending' | 'active' | 'full' | 'completed' | 'cancelled' | 'expired'

export interface Trip {
  id: string
  driverId: string
  status: TripStatus
  country: string
  originCity: string
  originGovernorate: string
  originLat: number
  originLng: number
  destinationCity: string
  destinationGovernorate: string
  destinationLat: number
  destinationLng: number
  departureTime: Date
  estimatedArrivalTime?: Date | null
  estimatedDurationMinutes: number
  pricePerSeat: number
  totalSeats: number
  availableSeats: number
  isReturnEmptyTrip: boolean
  isWomenOnly: boolean
  carType: string
  driverLiveLat?: number | null
  driverLiveLng?: number | null
  driverLiveUpdatedAt?: Date | null
}

export interface TripSearchParams {
  country: string
  originCity: string
  destinationCity: string
  date: Date
  seatsNeeded: number
  returnEmptyOnly: boolean
  womenOnlyFilter: boolean
}
