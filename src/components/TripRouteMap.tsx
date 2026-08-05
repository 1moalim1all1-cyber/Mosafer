import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet'
import L from 'leaflet'
import type { Trip } from '../types/trip'

const originIcon = new L.DivIcon({
  html: '<div style="background:#22C55E;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>',
  className: '',
  iconSize: [16, 16],
})

const destinationIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

const driverIcon = new L.DivIcon({
  html: '<div style="background:#1E40AF;width:36px;height:36px;border-radius:50%;border:3px solid white;box-shadow:0 2px 10px rgba(30,64,175,0.5);display:flex;align-items:center;justify-content:center;font-size:18px">🚗</div>',
  className: '',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
})

/** بنعتبر الموقع "حي" لو اتحدّث خلال آخر 60 ثانية، زي نسخة Flutter بالظبط */
function isLiveLocationFresh(updatedAt?: Date | null): boolean {
  if (!updatedAt) return false
  return (Date.now() - updatedAt.getTime()) / 1000 < 60
}

export function TripRouteMap({ trip }: { trip: Trip }) {
  const origin: [number, number] = [trip.originLat, trip.originLng]
  const destination: [number, number] = [trip.destinationLat, trip.destinationLng]
  const center: [number, number] = [(trip.originLat + trip.destinationLat) / 2, (trip.originLng + trip.destinationLng) / 2]

  const hasLiveDriver = isLiveLocationFresh(trip.driverLiveUpdatedAt) && trip.driverLiveLat && trip.driverLiveLng
  const driverPoint: [number, number] | null = hasLiveDriver ? [trip.driverLiveLat!, trip.driverLiveLng!] : null

  return (
    <div>
      {hasLiveDriver && (
        <div className="mb-2 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-success" />
          <span className="text-sm font-semibold text-success">السائق بيشارك موقعه الحي دلوقتي</span>
        </div>
      )}
      <div className="overflow-hidden rounded-2xl border border-border" style={{ height: 220 }}>
        <MapContainer center={driverPoint ?? center} zoom={hasLiveDriver ? 12 : 7} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          {(trip.originLat !== 0 || trip.originLng !== 0) && (
            <>
              <Polyline positions={[origin, destination]} color="#1E40AF" weight={3} />
              <Marker position={origin} icon={originIcon} />
              <Marker position={destination} icon={destinationIcon} />
            </>
          )}
          {driverPoint && <Marker position={driverPoint} icon={driverIcon} />}
        </MapContainer>
      </div>
    </div>
  )
}
