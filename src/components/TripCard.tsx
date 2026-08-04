import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Trip } from '../types/trip'
import type { AppUser } from '../types/user'
import type { DriverProfile } from '../types/booking'
import { fetchUserProfile, fetchDriverProfile } from '../lib/users'
import { Card } from './ui/Card'
import { Button } from './ui/Button'

export function TripCard({ trip }: { trip: Trip }) {
  const navigate = useNavigate()
  const [driver, setDriver] = useState<AppUser | null>(null)
  const [driverProfile, setDriverProfile] = useState<DriverProfile | null>(null)

  useEffect(() => {
    fetchUserProfile(trip.driverId).then(setDriver)
    fetchDriverProfile(trip.driverId).then(setDriverProfile)
  }, [trip.driverId])

  const timeFormat = new Intl.DateTimeFormat('ar-EG', { hour: '2-digit', minute: '2-digit' })
  const arrival = trip.estimatedArrivalTime ?? new Date(trip.departureTime.getTime() + trip.estimatedDurationMinutes * 60000)

  return (
    <Card hoverable onClick={() => navigate(`/trip/${trip.id}`)} className="mb-4">
      {(trip.isReturnEmptyTrip || trip.isWomenOnly) && (
        <div className="mb-3 flex gap-2">
          {trip.isReturnEmptyTrip && (
            <span className="rounded-full border border-success/40 bg-success/10 px-3 py-1 text-xs font-semibold text-green-700">
              ♻️ راجع فاضي
            </span>
          )}
          {trip.isWomenOnly && (
            <span className="rounded-full border border-pink-400/40 bg-pink-50 px-3 py-1 text-xs font-semibold text-pink-700">
              👩 سيدات فقط
            </span>
          )}
        </div>
      )}

      {driver && (
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-light text-primary">
            {driver.profileImageUrl ? (
              <img src={driver.profileImageUrl} alt={driver.fullName} className="h-10 w-10 rounded-full object-cover" />
            ) : (
              '🧑'
            )}
          </div>
          <div>
            <p className="font-semibold text-text-primary">{driver.fullName}</p>
            <p className="text-sm text-text-secondary">
              {driver.avgRating > 0 ? `⭐ ${driver.avgRating.toFixed(1)} · ${driver.totalTrips} رحلة` : 'سائق جديد'}
            </p>
          </div>
        </div>
      )}

      <div className="mb-3 flex items-start justify-between">
        <div>
          <p className="text-lg font-bold text-text-primary">
            {timeFormat.format(trip.departureTime)} ← {timeFormat.format(arrival)}
          </p>
          <p className="text-text-secondary">
            {trip.originCity} → {trip.destinationCity}
          </p>
          <p className="text-sm text-text-secondary">{trip.estimatedDurationMinutes} دقيقة تقريبًا</p>
        </div>
        <div className="text-left">
          <p className="text-lg font-bold text-primary">{trip.pricePerSeat.toFixed(0)} ج.م</p>
          <p className="text-sm text-text-secondary">للمقعد</p>
        </div>
      </div>

      <hr className="mb-3 border-border" />

      <div className="mb-4 flex flex-wrap gap-4 text-sm text-text-secondary">
        <span>💺 {trip.availableSeats} مقاعد متاحة</span>
        <span>🚗 {trip.carType}</span>
        {driverProfile?.vehicle && (
          <>
            <span>🎨 {driverProfile.vehicle.color}</span>
            <span>
              🏷️ {driverProfile.vehicle.make} {driverProfile.vehicle.model}
            </span>
          </>
        )}
      </div>

      <Button onClick={() => navigate(`/trip/${trip.id}`)}>احجز الآن</Button>
    </Card>
  )
}
