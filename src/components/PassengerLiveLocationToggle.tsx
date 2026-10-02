import { useCallback, useEffect, useRef, useState } from 'react'
import { stopPassengerLiveLocation, updatePassengerLiveLocation } from '../lib/bookings'
import { locationAccuracyLabel } from '../lib/geolocation'
import { startLocationWatcher, type LocationWatcherHandle } from '../lib/locationWatcher'

export function PassengerLiveLocationToggle({ bookingId }: { bookingId: string }) {
  const [isSharing, setIsSharing] = useState(false)
  const [error, setError] = useState('')
  const watcherRef = useRef<LocationWatcherHandle | null>(null)
  const lastWriteRef = useRef(0)
  const [accuracy, setAccuracy] = useState<number | null>(null)
  const [openSettings, setOpenSettings] = useState<(() => Promise<void>) | null>(null)
  const sharingKey = `mosafer:passenger-location:${bookingId}`

  const stopSharing = useCallback(async () => {
    const watcher = watcherRef.current
    watcherRef.current = null
    if (watcher) await watcher.stop().catch(() => undefined)
    sessionStorage.removeItem(sharingKey)
    setIsSharing(false)
    setAccuracy(null)
    await stopPassengerLiveLocation(bookingId).catch(() => undefined)
  }, [bookingId, sharingKey])

  const startSharing = useCallback(async () => {
    if (watcherRef.current !== null) return
    setError('')
    setOpenSettings(null)
    try {
      let watcherFailed = false
      const watcher = await startLocationWatcher(sharingKey, 'passenger', (current) => {
        setAccuracy(current.accuracy)
        const now = Date.now()
        if (now - lastWriteRef.current < 5000) return
        lastWriteRef.current = now
        updatePassengerLiveLocation(bookingId, current.lat, current.lng).then(() => {
          setError('')
        }).catch(() => {
          setError('تعذر تحديث موقعك. تأكد من الإنترنت وحاول مرة أخرى')
        })
      }, (message, settingsAction) => {
        watcherFailed = true
        setError(message)
        setOpenSettings(() => settingsAction ?? null)
        setIsSharing(false)
        sessionStorage.removeItem(sharingKey)
        const failedWatcher = watcherRef.current
        watcherRef.current = null
        if (failedWatcher) void failedWatcher.stop().catch(() => undefined)
      })
      if (watcherFailed) {
        await watcher.stop().catch(() => undefined)
        return
      }
      watcherRef.current = watcher
      setIsSharing(true)
      sessionStorage.setItem(sharingKey, '1')
    } catch (watchError) {
      setError(watchError instanceof Error ? watchError.message : 'تعذر تشغيل GPS')
      watcherRef.current = null
      setIsSharing(false)
    }
  }, [bookingId, sharingKey])

  useEffect(() => {
    if (sessionStorage.getItem(sharingKey) === '1') startSharing()
    const resumeSharing = () => {
      if (document.visibilityState === 'visible' && sessionStorage.getItem(sharingKey) === '1' && watcherRef.current === null) {
        startSharing()
      }
    }
    document.addEventListener('visibilitychange', resumeSharing)
    window.addEventListener('online', resumeSharing)
    return () => {
      document.removeEventListener('visibilitychange', resumeSharing)
      window.removeEventListener('online', resumeSharing)
      const watcher = watcherRef.current
      watcherRef.current = null
      if (watcher && !watcher.native) void watcher.stop().catch(() => undefined)
    }
  }, [sharingKey, startSharing])

  return (
    <div className="mb-3 rounded-xl border border-border bg-card p-3">
      <div className="flex items-center justify-between gap-3">
        <div><p className="text-sm font-bold text-text-primary">مشاركة موقعي مع السائق</p><p className="text-xs text-text-secondary">{isSharing && accuracy != null ? locationAccuracyLabel(accuracy) : 'يظهر للسائق أثناء الرحلة المؤكدة فقط'}</p></div>
        <button type="button" onClick={isSharing ? stopSharing : startSharing} className={`rounded-full px-4 py-2 text-xs font-bold text-white ${isSharing ? 'bg-danger' : 'bg-success'}`}>{isSharing ? 'إيقاف' : 'تشغيل'}</button>
      </div>
      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
      {openSettings && <button type="button" onClick={() => void openSettings()} className="mt-2 text-xs font-bold text-primary">فتح إعدادات الموقع</button>}
    </div>
  )
}
