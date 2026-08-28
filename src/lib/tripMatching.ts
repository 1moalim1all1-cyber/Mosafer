import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from './firebase'
import type { Trip } from '../types/trip'

function mapTripDoc(id: string, data: Record<string, unknown>): Trip {
  const dep = data.departureTime as { toDate?: () => Date }
  return {
    id,
    driverId: data.driverId as string,
    status: data.status as Trip['status'],
    originCity: data.originCity as string,
    originGovernorate: data.originGovernorate as string,
    originLat: data.originLat as number,
    originLng: data.originLng as number,
    destinationCity: data.destinationCity as string,
    destinationGovernorate: data.destinationGovernorate as string,
    destinationLat: data.destinationLat as number,
    destinationLng: data.destinationLng as number,
    departureTime: dep?.toDate ? dep.toDate() : new Date(),
    estimatedDurationMinutes: data.estimatedDurationMinutes as number,
    pricePerSeat: data.pricePerSeat as number,
    totalSeats: data.totalSeats as number,
    availableSeats: data.availableSeats as number,
    isReturnEmptyTrip: Boolean(data.isReturnEmptyTrip),
    isWomenOnly: Boolean(data.isWomenOnly),
    carType: data.carType as string,
    country: (data.country as string) ?? 'egypt',
  }
}

export interface MatchedTrip {
  trip: Trip
  matchPercent: number
}

/**
 * نسبة مطابقة بسيطة وصادقة (مش ذكاء اصطناعي) - بتحسب حسب قواعد
 * واضحة بس: نفس المسار أساسي (70%)، +نفس التاريخ بالظبط (+20%)،
 * +الوقت قريب من المفضّل لو موجود (+10%). سقفها 100%.
 */
export async function findMatchingTrips(input: {
  country: string
  originCity: string
  destinationCity: string
  travelDate: string
  preferredTime?: string
}): Promise<MatchedTrip[]> {
  const q = query(
    collection(db, 'trips'),
    where('country', '==', input.country),
    where('status', '==', 'active'),
    where('originCity', '==', input.originCity),
    where('destinationCity', '==', input.destinationCity),
  )
  const snap = await getDocs(q)

  const results: MatchedTrip[] = snap.docs.map((d) => {
    const trip = mapTripDoc(d.id, d.data())
    let score = 70

    const tripDateStr = trip.departureTime.toISOString().split('T')[0]
    if (tripDateStr === input.travelDate) score += 20

    if (input.preferredTime) {
      const [prefH, prefM] = input.preferredTime.split(':').map(Number)
      const prefMinutes = prefH * 60 + prefM
      const tripMinutes = trip.departureTime.getHours() * 60 + trip.departureTime.getMinutes()
      const diff = Math.abs(prefMinutes - tripMinutes)
      if (diff <= 60) score += 10
      else if (diff <= 120) score += 5
    }

    return { trip, matchPercent: Math.min(100, score) }
  })

  return results.sort((a, b) => b.matchPercent - a.matchPercent)
}
