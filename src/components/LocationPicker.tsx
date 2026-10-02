import { useCallback, useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import { Button } from './ui/Button'
import { highAccuracyPositionOptions, locationAccuracyLabel, mapGeolocationError, normalizePosition } from '../lib/geolocation'

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

function LocateButton({ onLocate, onError }: { onLocate: (lat: number, lng: number, accuracy: number) => void; onError: (message: string) => void }) {
  const map = useMap()
  const [loading, setLoading] = useState(false)

  function handleClick() {
    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const position = normalizePosition(pos)
        if (!position) return onError('وصلتنا إحداثيات غير صحيحة. حاول تاني')
        onLocate(position.lat, position.lng, position.accuracy)
        map.setView([position.lat, position.lng], 15)
        setLoading(false)
      },
      (error) => {
        onError(mapGeolocationError(error))
        setLoading(false)
      },
      highAccuracyPositionOptions,
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
  autoLocate?: boolean
}

function AutoLocator({ onLocate, onError }: { onLocate: (lat: number, lng: number, accuracy: number) => void; onError: (message: string) => void }) {
  const map = useMap()
  const locate = useCallback(() => {
    if (!navigator.geolocation) {
      onError('جهازك لا يدعم تحديد الموقع')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const current = normalizePosition(position)
        if (!current) return onError('وصلتنا إحداثيات غير صحيحة. حاول تاني')
        onLocate(current.lat, current.lng, current.accuracy)
        map.setView([current.lat, current.lng], 16)
      },
      (error) => onError(mapGeolocationError(error)),
      { ...highAccuracyPositionOptions, maximumAge: 0 },
    )
  }, [map, onError, onLocate])

  useEffect(() => {
    locate()
  }, [locate])

  return null
}

export function LocationPicker({ title, initialLat, initialLng, onConfirm, onClose, autoLocate = false }: LocationPickerProps) {
  const initialPoint = initialLat != null && initialLng != null ? [initialLat, initialLng] as [number, number] : null
  const [point, setPoint] = useState<[number, number] | null>(autoLocate ? null : initialPoint ?? EGYPT_CENTER)
  const [locationError, setLocationError] = useState('')
  const [accuracy, setAccuracy] = useState<number | null>(null)
  const [locateAttempt, setLocateAttempt] = useState(0)
  const handleAutoLocate = useCallback((lat: number, lng: number, currentAccuracy: number) => {
    setLocationError('')
    setAccuracy(currentAccuracy)
    setPoint([lat, lng])
  }, [])
  const handleAutoError = useCallback((message: string) => setLocationError(message), [])

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-card">
      <header className="flex items-center gap-3 border-b border-border px-4 py-4">
        <button onClick={onClose} className="text-xl">
          ✕
        </button>
        <h1 className="text-lg font-bold text-text-primary">{title}</h1>
      </header>

      <div className="relative flex-1">
        <MapContainer center={point ?? EGYPT_CENTER} zoom={point ? 15 : 6} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {!autoLocate && <ClickHandler onPick={(lat, lng) => setPoint([lat, lng])} />}
          {autoLocate ? (
            <AutoLocator
              key={locateAttempt}
              onLocate={handleAutoLocate}
              onError={handleAutoError}
            />
          ) : (
            <LocateButton onLocate={(lat, lng, currentAccuracy) => {
              setPoint([lat, lng])
              setAccuracy(currentAccuracy)
              setLocationError('')
            }} onError={setLocationError} />
          )}
          {point && <Marker position={point} icon={markerIcon} />}
        </MapContainer>
        {autoLocate && !point && !locationError && (
          <div className="pointer-events-none absolute inset-0 z-[1000] flex items-center justify-center bg-bg/60">
            <div className="rounded-2xl bg-card px-6 py-4 text-center shadow-xl">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="font-semibold text-text-primary">جاري تحديد موقعك بالـGPS…</p>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-border p-4">
        <p className="mb-3 text-center text-sm text-text-secondary">
          {autoLocate
            ? point ? `تم تحديد موقعك تلقائيًا — ${locationAccuracyLabel(accuracy ?? 0)}` : locationError || 'افتح GPS ووافق على إذن الموقع'
            : 'دوس في أي مكان على الخريطة لتحديد النقطة بالظبط'}
        </p>
        {accuracy != null && accuracy > 100 && (
          <p className="mb-3 rounded-xl bg-warning/10 p-2 text-center text-xs font-semibold text-warning">الدقة ضعيفة. استنى ثواني في مكان مفتوح واضغط زر الموقع تاني قبل التأكيد.</p>
        )}
        {autoLocate && locationError && (
          <Button variant="secondary" onClick={() => {
            setLocationError('')
            setLocateAttempt((attempt) => attempt + 1)
          }}>إعادة المحاولة بعد تشغيل GPS</Button>
        )}
        <Button disabled={!point} onClick={() => point && onConfirm(point[0], point[1])}>تأكيد الموقع</Button>
      </div>
    </div>
  )
}
