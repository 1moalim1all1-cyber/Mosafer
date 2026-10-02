import { useCallback, useEffect, useRef, useState } from 'react'
import { updateTripLiveLocation, stopTripLiveLocation, recordLocationHistoryPoint } from '../lib/trips'
import { locationAccuracyLabel } from '../lib/geolocation'
import { startLocationWatcher, type LocationWatcherHandle } from '../lib/locationWatcher'

export function LiveLocationToggle({ tripId }: { tripId: string }) {
  const [isSharing, setIsSharing] = useState(false)
  const watcherRef = useRef<LocationWatcherHandle | null>(null)
  const lastHistoryWriteRef = useRef<number>(0)
  const lastLocationWriteRef = useRef<number>(0)
  const [error, setError] = useState('')
  const [accuracy, setAccuracy] = useState<number | null>(null)
  const [openSettings, setOpenSettings] = useState<(() => Promise<void>) | null>(null)
  const sharingKey = `mosafer:driver-location:${tripId}`

  const startSharing = useCallback(async () => {
    if (watcherRef.current !== null) return
    setError('')
    setOpenSettings(null)
    try {
      let watcherFailed = false
      const watcher = await startLocationWatcher(sharingKey, 'driver', (position) => {
        setAccuracy(position.accuracy)
        const now = Date.now()
        if (now - lastLocationWriteRef.current < 5000) return
        lastLocationWriteRef.current = now
        updateTripLiveLocation(tripId, position.lat, position.lng).then(() => {
          setError('')
        }).catch(() => {
          setError('تعذر تحديث الموقع. تأكد من الإنترنت وحاول مرة أخرى')
        })

        // نسجّل نقطة في مسار الرحلة الكامل كل 20 ثانية بس (مش كل
        // تحديث GPS)، عشان نرسم خط الرحلة كلها بعدين من غير ما
        // نستهلك حد الكتابة المجاني في Firebase بسرعة
        if (now - lastHistoryWriteRef.current > 20_000) {
          lastHistoryWriteRef.current = now
          recordLocationHistoryPoint(tripId, position.lat, position.lng).catch(() => undefined)
        }
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
  }, [sharingKey, tripId])

  const stopSharing = useCallback(async () => {
    const watcher = watcherRef.current
    watcherRef.current = null
    if (watcher) await watcher.stop().catch(() => undefined)
    sessionStorage.removeItem(sharingKey)
    setIsSharing(false)
    setAccuracy(null)
    await stopTripLiveLocation(tripId).catch(() => setError('تعذر إيقاف مشاركة الموقع على الخادم. حاول تاني'))
  }, [sharingKey, tripId])

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
    <div
      className={`mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border p-4 ${
        isSharing ? 'border-success/40 bg-success/5' : 'border-border bg-bg'
      }`}
    >
      <div className="flex min-w-0 items-center gap-2">
        <span>{isSharing ? '📍' : '🔕'}</span>
        <div>
          <p className={`text-sm ${isSharing ? 'font-semibold text-success' : 'text-text-secondary'}`}>
            {isSharing ? 'موقعك بيتشارك مع الراكب دلوقتي' : 'شارك موقعك الحي مع الراكب أثناء الرحلة'}
          </p>
          {isSharing && accuracy != null && <p className="text-xs text-text-secondary">{locationAccuracyLabel(accuracy)}</p>}
        </div>
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
      {error && <p className="w-full text-xs text-danger">{error}</p>}
      {openSettings && <button type="button" onClick={() => void openSettings()} className="w-full text-right text-xs font-bold text-primary">فتح إعدادات الموقع</button>}
    </div>
  )
}
