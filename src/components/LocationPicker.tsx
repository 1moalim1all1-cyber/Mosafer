import { useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import { Button } from './ui/Button'

// إصلاح مشكلة شهيرة: Vite بيكسر مسارات أيقونات Leaflet الافتراضية،
// فبنحددها يدويًا من CDN عام
const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

const EGYPT_CENTER: [number, number] = [30.0444, 31.2357]

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

function LocateButton({ onLocate }: { onLocate: (lat: number, lng: number) => void }) {
  const map = useMap()
  const [loading, setLoading] = useState(false)

  function handleClick() {
    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        onLocate(latitude, longitude)
        map.setView([latitude, longitude], 15)
        setLoading(false)
      },
      () => setLoading(false),
    )
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="absolute right-3 top-3 z-[1000] flex h-10 w-10 items-center justify-center rounded-full bg-card text-lg shadow-md"
    >
      {loading ? '⏳' : '📍'}
    </button>
  )
}

interface LocationPickerProps {
  title: string
  initialLat?: number
  initialLng?: number
  onConfirm: (lat: number, lng: number) => void
  onClose: () => void
}

export function LocationPicker({ title, initialLat, initialLng, onConfirm, onClose }: LocationPickerProps) {
  const [point, setPoint] = useState<[number, number]>([initialLat || EGYPT_CENTER[0], initialLng || EGYPT_CENTER[1]])

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-card">
      <header className="flex items-center gap-3 border-b border-border px-4 py-4">
        <button onClick={onClose} className="text-xl">
          ✕
        </button>
        <h1 className="text-lg font-bold text-text-primary">{title}</h1>
      </header>

      <div className="relative flex-1">
        <MapContainer center={point} zoom={12} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          <ClickHandler onPick={(lat, lng) => setPoint([lat, lng])} />
          <LocateButton onLocate={(lat, lng) => setPoint([lat, lng])} />
          <Marker position={point} icon={markerIcon} />
        </MapContainer>
      </div>

      <div className="border-t border-border p-4">
        <p className="mb-3 text-center text-sm text-text-secondary">
          دوس في أي مكان على الخريطة لتحديد النقطة بالظبط
        </p>
        <Button onClick={() => onConfirm(point[0], point[1])}>تأكيد الموقع</Button>
      </div>
    </div>
  )
}
