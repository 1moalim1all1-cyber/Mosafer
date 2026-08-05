import { useEffect, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * انتقال ناعم بسيط (تلاشي + انزلاق خفيف) بين كل صفحة وصفحة - بدون أي
 * مكتبة خارجية، بيشتغل بس بإعادة تشغيل حركة CSS كل ما مسار الصفحة يتغيّر.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const location = useLocation()
  const [displayLocation, setDisplayLocation] = useState(location)
  const [animationKey, setAnimationKey] = useState(0)

  useEffect(() => {
    if (location.pathname !== displayLocation.pathname) {
      setDisplayLocation(location)
      setAnimationKey((k) => k + 1)
    }
  }, [location, displayLocation])

  return (
    <div key={animationKey} className="animate-page-fade">
      {children}
    </div>
  )
}
