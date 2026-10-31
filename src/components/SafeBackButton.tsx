import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

/**
 * In-app back control: never sends users to an external page or outside the app.
 * A direct deep-link always falls back to the authenticated home screen.
 */
export function SafeBackButton() {
  const location = useLocation()
  const navigate = useNavigate()
  const history = useRef<string[]>([])
  const current = location.pathname + location.search + location.hash

  useEffect(() => {
    const stack = history.current
    if (stack[stack.length - 1] === current) return
    const previousIndex = stack.lastIndexOf(current)
    if (previousIndex !== -1) {
      stack.splice(previousIndex + 1)
    } else {
      stack.push(current)
    }
    if (stack.length > 40) stack.splice(0, stack.length - 40)
  }, [current])

  if (location.pathname === '/') return null

  function backInsideApp() {
    const stack = history.current
    const target = stack.length > 1 ? stack[stack.length - 2] : '/'
    navigate(target, { replace: true })
  }

  return (
    <button type="button" onClick={backInsideApp}
      aria-label="رجوع للصفحة السابقة"
      className="fixed left-3 top-20 z-50 inline-flex items-center gap-1 rounded-xl border border-white/20 bg-[#071038]/95 px-3 py-2 text-sm font-semibold text-white shadow-lg backdrop-blur-md transition hover:bg-[#152052] lg:top-5">
      <ArrowRight size={17} aria-hidden="true" />
      رجوع
    </button>
  )
}
