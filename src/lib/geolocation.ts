export interface AppPosition {
  lat: number
  lng: number
  accuracy: number
  heading: number | null
  speed: number | null
  timestamp: number
}

export const LIVE_LOCATION_MAX_AGE_MS = 90_000

export function isValidCoordinate(lat: number, lng: number): boolean {
  return Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
}

export function mapGeolocationError(error: GeolocationPositionError): string {
  if (error.code === error.PERMISSION_DENIED) return 'إذن الموقع مقفول. فعّل الموقع الدقيق من إعدادات التطبيق وحاول تاني'
  if (error.code === error.POSITION_UNAVAILABLE) return 'مش قادرين نحدد موقعك. افتح GPS واتحرك لمكان مفتوح'
  if (error.code === error.TIMEOUT) return 'تحديد الموقع أخد وقت طويل. تأكد إن GPS شغال وحاول تاني'
  return 'حصل خطأ أثناء تحديد الموقع. حاول تاني'
}

export function normalizePosition(position: GeolocationPosition): AppPosition | null {
  const { latitude, longitude, accuracy, heading, speed } = position.coords
  if (!isValidCoordinate(latitude, longitude)) return null
  return {
    lat: latitude,
    lng: longitude,
    accuracy: Number.isFinite(accuracy) ? Math.round(accuracy) : 0,
    heading: heading != null && Number.isFinite(heading) ? heading : null,
    speed: speed != null && Number.isFinite(speed) ? speed : null,
    timestamp: position.timestamp,
  }
}

export function isLiveLocationFresh(updatedAt?: Date | null, now = Date.now()): boolean {
  return Boolean(updatedAt && now - updatedAt.getTime() < LIVE_LOCATION_MAX_AGE_MS)
}

export function locationAccuracyLabel(accuracy: number): string {
  if (accuracy <= 25) return `دقة ممتازة ±${accuracy} متر`
  if (accuracy <= 75) return `دقة جيدة ±${accuracy} متر`
  return `الدقة ضعيفة ±${accuracy} متر`
}

export const highAccuracyPositionOptions: PositionOptions = {
  enableHighAccuracy: true,
  maximumAge: 3_000,
  timeout: 20_000,
}
