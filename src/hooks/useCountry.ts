import { useState } from 'react'
import { DEFAULT_COUNTRY, type CountryCode } from '../lib/countries'

export function useCountry() {
  const [country, setCountry] = useState<CountryCode>(() => {
    const saved = localStorage.getItem('mosafer_country')
    return saved === 'egypt' || saved === 'saudi' ? saved : DEFAULT_COUNTRY
  })

  function changeCountry(code: CountryCode) {
    setCountry(code)
    localStorage.setItem('mosafer_country', code)
  }

  return [country, changeCountry] as const
}
