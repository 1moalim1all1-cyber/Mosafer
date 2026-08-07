import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../contexts/AuthContext'
import { subscribeFavorites } from '../lib/favorites'
import type { Trip } from '../types/trip'
import { TripCard } from '../components/TripCard'

export default function FavoritesPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [favoriteIds, setFavoriteIds] = useState<string[]>([])
  const [trips, setTrips] = useState<Trip[]>([])

  useEffect(() => {
    if (!user) return
    return subscribeFavorites(user.uid, setFavoriteIds)
  }, [user])

  useEffect(() => {
    const unsubscribes = favoriteIds.map((id) =>
      onSnapshot(doc(db, 'trips', id), (snap) => {
        if (!snap.exists()) return
        const data = snap.data()
        setTrips((prev) => {
          const dep = data.departureTime as { toDate?: () => Date }
          const trip: Trip = {
            id: snap.id,
            driverId: data.driverId,
            status: data.status,
            originCity: data.originCity,
            originGovernorate: data.originGovernorate,
            originLat: data.originLat ?? 0,
            originLng: data.originLng ?? 0,
            destinationCity: data.destinationCity,
            destinationGovernorate: data.destinationGovernorate,
            destinationLat: data.destinationLat ?? 0,
            destinationLng: data.destinationLng ?? 0,
            departureTime: dep?.toDate ? dep.toDate() : new Date(),
            estimatedDurationMinutes: data.estimatedDurationMinutes ?? 0,
            pricePerSeat: data.pricePerSeat ?? 0,
            totalSeats: data.totalSeats ?? 0,
            availableSeats: data.availableSeats ?? 0,
            isReturnEmptyTrip: Boolean(data.isReturnEmptyTrip),
            isWomenOnly: Boolean(data.isWomenOnly),
            carType: data.carType ?? '',
          }
          const others = prev.filter((t) => t.id !== trip.id)
          return [...others, trip]
        })
      }),
    )
    return () => unsubscribes.forEach((u) => u())
  }, [favoriteIds])

  return (
    <div className="min-h-screen bg-bg">
      <header className="flex items-center gap-3 border-b border-border bg-card px-4 py-4">
        <button onClick={() => navigate(-1)} className="text-xl">
          ←
        </button>
        <h1 className="text-lg font-bold text-text-primary">المفضلة</h1>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6">
        {favoriteIds.length === 0 && <p className="py-12 text-center text-text-secondary">لسه مضفتش أي رحلة للمفضلة</p>}
        {trips.map((trip) => (
          <TripCard key={trip.id} trip={trip} />
        ))}
      </main>
    </div>
  )
}
