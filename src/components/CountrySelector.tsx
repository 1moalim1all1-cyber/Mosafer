import { useState } from 'react'
import { COUNTRIES, type CountryCode } from '../lib/countries'
import { ChevronDown } from 'lucide-react'

interface CountrySelectorProps {
  value: CountryCode
  onChange: (country: CountryCode) => void
  variant?: 'light' | 'dark'
}

/** اختيار الدولة - بيظهر في الهيدر والبحث، ومحفوظ في localStorage عشان يفضل متذكر آخر اختيار */
export function CountrySelector({ value, onChange, variant = 'light' }: CountrySelectorProps) {
  const [open, setOpen] = useState(false)
  const current = COUNTRIES[value]

  function select(code: CountryCode) {
    onChange(code)
    localStorage.setItem('mosafer_country', code)
    setOpen(false)
  }

  const textColor = variant === 'dark' ? 'text-white' : 'text-text-primary'

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm font-semibold ${textColor}`}
      >
        <span>{current.flag}</span>
        <span>{current.nameAr}</span>
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-50 mt-2 w-40 overflow-hidden rounded-xl border border-border bg-card shadow-lg">
            {Object.values(COUNTRIES).map((c) => (
              <button
                key={c.code}
                onClick={() => select(c.code)}
                className={`flex w-full items-center gap-2 px-4 py-2.5 text-sm font-semibold hover:bg-primary-light ${
                  c.code === value ? 'text-primary' : 'text-text-primary'
                }`}
              >
                <span>{c.flag}</span>
                {c.nameAr}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
