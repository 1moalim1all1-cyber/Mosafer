import { useRef, useState } from 'react'
import { updateTripLiveLocation, stopTripLiveLocation } from '../lib/trips'

export function LiveLocationToggle({ tripId }: { tripId: string }) {
  const [isSharing, setIsSharing] = useState(false)
  const watchIdRef = useRef<number | null>(null)

  function startSharing() {
    if (!navigator.geolocation) {
      alert('متصفحك مش بيدعم تحديد الموقع')
      return
    }
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        updateTripLiveLocation(tripId, pos.coords.latitude, pos.coords.longitude)
      },
      () => {
        alert('محتاجين صلاحية الموقع عشان تشارك موقعك مع الراكب')
        setIsSharing(false)
      },
      { enableHighAccuracy: true },
    )
    watchIdRef.current = id
    setIsSharing(true)
  }

  function stopSharing() {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    stopTripLiveLocation(tripId)
    setIsSharing(false)
  }

  return (
    <div
      className={`mb-4 flex items-center justify-between rounded-xl border p-4 ${
        isSharing ? 'border-success/40 bg-success/5' : 'border-border bg-bg'
      }`}
    >
      <div className="flex items-center gap-2">
        <span>{isSharing ? '📍' : '🔕'}</span>
        <span className={`text-sm ${isSharing ? 'font-semibold text-success' : 'text-text-secondary'}`}>
          {isSharing ? 'موقعك بيتشارك مع الراكب دلوقتي' : 'شارك موقعك الحي مع الراكب أثناء الرحلة'}
        </span>
      </div>
      <button
        onClick={isSharing ? stopSharing : startSharing}
        className={`relative h-7 w-12 rounded-full transition ${isSharing ? 'bg-success' : 'bg-disabled'}`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-card shadow transition ${
            isSharing ? 'right-1' : 'right-6'
          }`}
        />
      </button>
    </div>
  )
}
