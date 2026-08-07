import { useState } from 'react'
import { AlertTriangle, Phone, Send } from 'lucide-react'

/**
 * زرار طوارئ حقيقي - مش شكلي. بيديك خيارين فوريين: اتصال مباشر بالطوارئ
 * (الشرطة المصرية 122)، أو مشاركة موقعك الحالي الفعلي (GPS حقيقي) مع
 * حد موثوق فيه عبر واتساب في ثانية واحدة.
 */
export function EmergencyButton() {
  const [open, setOpen] = useState(false)
  const [locating, setLocating] = useState(false)

  function shareLocation() {
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        const mapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`
        const message = `محتاج مساعدة دلوقتي! موقعي الحالي: ${mapsLink}`
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank')
        setLocating(false)
        setOpen(false)
      },
      () => {
        alert('مقدرش أحدد موقعك، تأكد إنك سامح للمتصفح بالوصول للموقع')
        setLocating(false)
      },
    )
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-danger text-white shadow-lg shadow-danger/40 transition-transform hover:scale-105 active:scale-95"
        aria-label="طوارئ"
      >
        <AlertTriangle size={26} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center" onClick={() => setOpen(false)}>
          <div
            className="w-full max-w-sm rounded-t-3xl bg-card p-6 sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 text-center">
              <AlertTriangle className="mx-auto mb-2 text-danger" size={36} />
              <h3 className="text-lg font-bold text-text-primary">تحتاج مساعدة؟</h3>
            </div>

            <a
              href="tel:122"
              className="mb-3 flex items-center justify-center gap-2 rounded-xl bg-danger py-3.5 font-semibold text-white"
            >
              <Phone size={18} /> اتصل بالطوارئ (122)
            </a>

            <button
              onClick={shareLocation}
              disabled={locating}
              className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-primary py-3.5 font-semibold text-primary disabled:opacity-50"
            >
              <Send size={18} /> {locating ? 'بيحدد موقعك...' : 'ابعت موقعك لحد موثوق فيه'}
            </button>

            <button onClick={() => setOpen(false)} className="w-full py-2 text-sm text-text-secondary">
              إلغاء
            </button>
          </div>
        </div>
      )}
    </>
  )
}
