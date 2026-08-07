import { CarFront } from 'lucide-react'

/**
 * أيقونة سيارة "شبه-3D" - دوران خفيف + طفو + ظل بيتحرك معاها، من غير
 * أي صور خارجية أو مكتبات 3D تقيلة. بتستخدم CSS Transform بمنظور
 * (Perspective) حقيقي مش مجرد أنيميشن مسطّح.
 */
export function Animated3DCar({ size = 140 }: { size?: number }) {
  return (
    <div className="flex flex-col items-center" style={{ perspective: 800 }}>
      <div
        className="animate-car-float"
        style={{
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          className="flex items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary shadow-2xl"
          style={{ width: size, height: size }}
        >
          <CarFront size={size * 0.5} color="white" strokeWidth={1.5} />
        </div>
      </div>
      <div className="animate-shadow-pulse mt-3 h-3 w-20 rounded-full bg-black/20 blur-sm" />
    </div>
  )
}
