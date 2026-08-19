import { useEffect, useRef, useState, type ReactNode } from 'react'

/**
 * بيلف أي قسم ويخليه يظهر بحركة ناعمة (تلاشي + انزلاق لأعلى بسيط) أول
 * ما المستخدم يوصله بالاسكرول - بدون أي مكتبة خارجية، بس Intersection
 * Observer (مدعومة في كل المتصفحات الحديثة).
 */
export function FadeInSection({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'} ${className}`}
    >
      {children}
    </div>
  )
}
