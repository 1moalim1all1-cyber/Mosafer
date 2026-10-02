import { Capacitor, registerPlugin } from '@capacitor/core'
import type {
  BackgroundGeolocationPlugin,
  CallbackError,
  Location as NativeLocation,
} from '@capacitor-community/background-geolocation'
import { highAccuracyPositionOptions, mapGeolocationError, normalizePosition, type AppPosition } from './geolocation'

const BackgroundGeolocation = registerPlugin<BackgroundGeolocationPlugin>('BackgroundGeolocation')
const persistentNativeWatchers = new Map<string, Promise<LocationWatcherHandle>>()

export interface LocationWatcherHandle {
  stop: () => Promise<void>
  native: boolean
}

function nativeErrorMessage(error: CallbackError): string {
  if (error.code === 'NOT_AUTHORIZED') return 'إذن الموقع مقفول. افتح إعدادات التطبيق واسمح بالموقع دائمًا'
  return error.message || 'تعذر تشغيل GPS في الخلفية'
}

function normalizeNativeLocation(location: NativeLocation): AppPosition | null {
  if (!Number.isFinite(location.latitude) || !Number.isFinite(location.longitude)) return null
  if (location.latitude < -90 || location.latitude > 90 || location.longitude < -180 || location.longitude > 180) return null
  return {
    lat: location.latitude,
    lng: location.longitude,
    accuracy: Math.round(location.accuracy || 0),
    heading: location.bearing,
    speed: location.speed,
    timestamp: location.time ?? Date.now(),
  }
}

export async function startLocationWatcher(
  sessionKey: string,
  role: 'driver' | 'passenger',
  onLocation: (position: AppPosition) => void,
  onError: (message: string, openSettings?: () => Promise<void>) => void,
): Promise<LocationWatcherHandle> {
  if (Capacitor.isNativePlatform()) {
    const existing = persistentNativeWatchers.get(sessionKey)
    if (existing) return existing
    const watcherPromise = BackgroundGeolocation.addWatcher(
      {
        backgroundTitle: 'مسافر — الرحلة جارية',
        backgroundMessage: role === 'driver'
          ? 'يتم مشاركة موقع السائق مع الركاب أثناء الرحلة'
          : 'يتم مشاركة موقع الراكب مع السائق أثناء الرحلة',
        requestPermissions: true,
        stale: false,
        distanceFilter: 10,
      },
      (location, error) => {
        if (error) {
          onError(nativeErrorMessage(error), error.code === 'NOT_AUTHORIZED' ? () => BackgroundGeolocation.openSettings() : undefined)
          return
        }
        if (!location) return
        const normalized = normalizeNativeLocation(location)
        if (normalized) onLocation(normalized)
      },
    ).then((id) => ({
      native: true,
      stop: async () => {
        persistentNativeWatchers.delete(sessionKey)
        await BackgroundGeolocation.removeWatcher({ id })
      },
    }))
    persistentNativeWatchers.set(sessionKey, watcherPromise)
    watcherPromise.catch(() => persistentNativeWatchers.delete(sessionKey))
    return watcherPromise
  }

  if (!navigator.geolocation) throw new Error('جهازك مش بيدعم تحديد الموقع')
  const id = navigator.geolocation.watchPosition(
    (position) => {
      const normalized = normalizePosition(position)
      if (normalized) onLocation(normalized)
    },
    (error) => onError(mapGeolocationError(error)),
    highAccuracyPositionOptions,
  )
  return {
    native: false,
    stop: async () => navigator.geolocation.clearWatch(id),
  }
}

export async function stopPersistentLocationWatcher(sessionKey: string): Promise<void> {
  const watcher = persistentNativeWatchers.get(sessionKey)
  if (!watcher) return
  await (await watcher).stop()
}
