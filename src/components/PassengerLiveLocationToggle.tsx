import { useEffect, useRef, useState } from 'react'
import { stopPassengerLiveLocation, updatePassengerLiveLocation } from '../lib/bookings'

export function PassengerLiveLocationToggle({ bookingId }: { bookingId: string }) {
  const [isSharing, setIsSharing] = useState(false)
  const [error, setError] = useState('')
  const watchIdRef = useRef<number | null>(null)
  const lastWriteRef = useRef(0)

  async function stopSharing() {
    if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current)
    watchIdRef.current = null
    setIsSharing(false)
    await stopPassengerLiveLocation(bookingId).catch(() => undefined)
  }

  function startSharing() {
    if (!navigator.geolocation) {
      setError('جهازك لا يدعم تحديد الموقع')
      return
    }
    setError('')
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const now = Date.now()
        if (now - lastWriteRef.current < 5000) return
        lastWriteRef.current = now
        updatePassengerLiveLocation(bookingId, position.coords.latitude, position.coords.longitude).catch(() => {
          setError('تعذر تحديث موقعك. تأكد من الإنترنت وحاول مرة أخرى')
        })
      },
      () => {
        setError('اسمح للموقع باستخدام GPS علشان السائق يقدر يوصلك')
        setIsSharing(false)
      },
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 15000 },
    )
    setIsSharing(true)
  }

  useEffect(() => () => {
    if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current)
  }, [])

  return (
    <div className="mb-3 rounded-xl border border-border bg-card p-3">
      <div className="flex items-center justify-between gap-3">
        <div><p className="text-sm font-bold text-text-primary">مشاركة موقعي مع السائق</p><p className="text-xs text-text-secondary">يظهر للسائق أثناء الرحلة المؤكدة فقط</p></div>
        <button type="button" onClick={isSharing ? stopSharing : startSharing} className={`rounded-full px-4 py-2 text-xs font-bold text-white ${isSharing ? 'bg-danger' : 'bg-success'}`}>{isSharing ? 'إيقاف' : 'تشغيل'}</button>
      </div>
      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
    </div>
  )
}
