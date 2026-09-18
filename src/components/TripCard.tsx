import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Trip } from '../types/trip'
import type { AppUser } from '../types/user'
import type { DriverProfile } from '../types/booking'
import { fetchUserProfile, fetchDriverProfile } from '../lib/users'
import { Card } from './ui/Card'
import { Button } from './ui/Button'
import { Armchair, CarFront, Palette, Tag, Users, Gauge } from 'lucide-react'
import { useAuth } from '../contexts/useAuth'

export function TripCard({ trip }: { trip: Trip }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [driver, setDriver] = useState<AppUser | null>(null)
  const [driverProfile, setDriverProfile] = useState<DriverProfile | null>(null)

  useEffect(() => {
    fetchUserProfile(trip.driverId).then(setDriver)
    fetchDriverProfile(trip.driverId).then(setDriverProfile)
  }, [trip.driverId])

  const timeFormat = new Intl.DateTimeFormat('ar-EG', { hour: '2-digit', minute: '2-digit' })
  const arrival = trip.estimatedArrivalTime ?? new Date(trip.departureTime.getTime() + trip.estimatedDurationMinutes * 60000)
  const bookedSeats = Math.max(0, trip.totalSeats - trip.availableSeats)
  const capacityPercent = trip.totalSeats > 0 ? (bookedSeats / trip.totalSeats) * 100 : 0
  const isOwnTrip = user?.uid === trip.driverId

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

      <div className="mb-4 rounded-2xl border border-border bg-bg/45 p-3">
        <div className="mb-2 flex items-center justify-between gap-3">
          <span className="flex items-center gap-2 font-bold text-text-primary"><Armchair size={18} className="text-primary" /> متبقي {trip.availableSeats} من {trip.totalSeats}</span>
          <span className="text-xs font-semibold text-text-secondary">تم حجز {bookedSeats}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-border/60" aria-label={`تم حجز ${bookedSeats} من ${trip.totalSeats}`}>
          <div className="h-full rounded-full bg-gradient-to-l from-primary to-secondary transition-all duration-500" style={{ width: `${capacityPercent}%` }} />
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-3 text-sm text-text-secondary">
        <span className="flex items-center gap-1.5"><CarFront size={15} className="text-primary" /> {trip.carType}</span>
        {driverProfile?.vehicle && (
          <>
            <span className="flex items-center gap-1.5"><Palette size={15} className="text-primary" /> {driverProfile.vehicle.color}</span>
            <span className="flex items-center gap-1.5"><Tag size={15} className="text-primary" /> {driverProfile.vehicle.make} {driverProfile.vehicle.model}</span>
          </>
        )}
      </div>

      <Button onClick={(event) => { event.stopPropagation(); navigate(isOwnTrip ? `/driver/trip/${trip.id}/bookings` : `/trip/${trip.id}`) }} icon={isOwnTrip ? <Gauge size={18} /> : <Users size={18} />}>
        {isOwnTrip ? 'إدارة الرحلة والحجوزات' : trip.availableSeats > 0 ? 'احجز مكانك' : 'اكتملت المقاعد'}
      </Button>
    </Card>
  )
}
