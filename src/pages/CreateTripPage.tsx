import { useState, type FormEvent, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/useAuth'
import { createTrip, subscribeDriverStatus } from '../lib/driverActions'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { LocationPicker } from '../components/LocationPicker'
import { COUNTRIES, DEFAULT_COUNTRY, type CountryCode } from '../lib/countries'

export default function CreateTripPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()

  // النهارده بصيغة YYYY-MM-DD - نفس صيغة حقل input[type=date]، عشان
  // يتحط افتراضيًا لكن يفضل قابل للتغيير عادي لو السائق عايز تاريخ تاني
  const todayStr = new Date().toISOString().split('T')[0]

  const [country, setCountry] = useState<CountryCode>(DEFAULT_COUNTRY)
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [date, setDate] = useState(todayStr)
  const [time, setTime] = useState('')
  const [price, setPrice] = useState('')
  const [seats, setSeats] = useState('3')
  const [duration, setDuration] = useState('60')
  const [isReturnEmptyTrip, setIsReturnEmptyTrip] = useState(false)
  const [isWomenOnly, setIsWomenOnly] = useState(false)
  const [originPoint, setOriginPoint] = useState<{ lat: number; lng: number } | null>(null)
  const [destinationPoint, setDestinationPoint] = useState<{ lat: number; lng: number } | null>(null)
  const [pickingLocation, setPickingLocation] = useState<'origin' | 'destination' | null>(null)

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [isApproved, setIsApproved] = useState<boolean | null>(null)

  useEffect(() => {
    if (!user) return
    return subscribeDriverStatus(user.uid, (status) => setIsApproved(status === 'approved'))
  }, [user])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (isApproved === false) {
      setError('حسابك لسه مش معتمد، مينفعش تنشر رحلة دلوقتي')
      return
    }
    if (!origin || !destination) {
      setError('اختار نقطة الانطلاق والوصول')
      return
    }
    if (origin === destination) {
      setError('نقطة الانطلاق والوصول لازم يكونوا مختلفين')
      return
    }
    if (!originPoint || !destinationPoint) {
      setError('حدد نقطتي الانطلاق والوصول بالظبط من الخريطة عشان الراكب يقدر يلاقيك بسهولة')
      return
    }
    if (!date || !time) {
      setError('حدد تاريخ ووقت الانطلاق')
      return
    }
    const priceNum = Number(price)
    const seatsNum = Number(seats)
    if (!priceNum || priceNum <= 0) {
      setError('أدخل سعر صحيح للمقعد')
      return
    }
    if (!seatsNum || seatsNum <= 0) {
      setError('أدخل عدد مقاعد صحيح')
      return
    }
    if (!user) return

    setLoading(true)
    setError(null)
    try {
      await createTrip({
        driverId: user.uid,
        status: 'active',
        originCity: origin,
        originGovernorate: origin,
        originLat: originPoint.lat,
        originLng: originPoint.lng,
        destinationCity: destination,
        destinationGovernorate: destination,
        destinationLat: destinationPoint.lat,
        destinationLng: destinationPoint.lng,
        departureTime: new Date(`${date}T${time}`),
        estimatedDurationMinutes: Number(duration),
        pricePerSeat: priceNum,
        totalSeats: seatsNum,
        availableSeats: seatsNum,
        isReturnEmptyTrip,
        isWomenOnly,
        carType: 'اقتصادية',
        country,
      })
      navigate('/driver')
    } catch {
      setError(t('driver.publishError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-text-primary">{t('driver.createTripTitle')}</h1>

      {isApproved === false && (
        <div className="mb-6 rounded-xl border border-warning/40 bg-warning/10 p-4 text-center">
          <p className="mb-3 text-text-primary">
            {t('driver.pendingCreateBanner')}
          </p>
          <Button onClick={() => navigate('/driver/pending-approval')} fullWidth={false}>
            {t('driver.approvalStatusDetails')}
          </Button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-text-primary">{t('driver.country')}</label>
          <div className="flex gap-2">
            {Object.values(COUNTRIES).map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => {
                  setCountry(c.code)
                  setOrigin('')
                  setDestination('')
                }}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl border-2 py-3 font-semibold transition ${
                  country === c.code ? 'border-primary bg-primary-light text-primary' : 'border-border text-text-secondary'
                }`}
              >
                <span>{c.flag}</span> {c.nameAr}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-text-primary">{t('search.from')}</label>
          <select
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            className="w-full rounded-xl border-2 border-border bg-card px-4 py-3 focus:border-primary focus:outline-none"
          >
            <option value="">{t('search.selectGovernorate')}</option>
            {COUNTRIES[country].regions.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setPickingLocation('origin')}
            className={`mt-2 flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
              originPoint ? 'border-success/40 bg-success/5 text-success' : 'border-border text-text-secondary'
            }`}
          >
            {originPoint ? t('driver.locationPicked') : t('driver.pickLocationOnMap')}
          </button>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-text-primary">{t('search.to')}</label>
          <select
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="w-full rounded-xl border-2 border-border bg-card px-4 py-3 focus:border-primary focus:outline-none"
          >
            <option value="">{t('search.selectGovernorate')}</option>
            {COUNTRIES[country].regions.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setPickingLocation('destination')}
            className={`mt-2 flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
              destinationPoint ? 'border-success/40 bg-success/5 text-success' : 'border-border text-text-secondary'
            }`}
          >
            {destinationPoint ? t('driver.locationPicked') : t('driver.pickLocationOnMap')}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input label={t('driver.date')} type="date" value={date} min={todayStr} onChange={(e) => setDate(e.target.value)} />
          <Input label={t('driver.time')} type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </div>

        <Input
          label={t('driver.pricePerSeat', { currency: COUNTRIES[country].currencyAr })}
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <Input label={t('driver.availableSeatsCount')} type="number" value={seats} onChange={(e) => setSeats(e.target.value)} />
        <Input label={t('driver.estimatedDuration')} type="number" value={duration} onChange={(e) => setDuration(e.target.value)} />

        <label className="flex items-center justify-between rounded-xl border border-success/30 bg-success/5 p-4">
          <span className="font-semibold text-text-primary">{t('driver.returnEmptyTrip')}</span>
          <input type="checkbox" checked={isReturnEmptyTrip} onChange={(e) => setIsReturnEmptyTrip(e.target.checked)} className="h-5 w-5" />
        </label>

        {user?.gender === 'female' && (
          <label className="flex items-center justify-between rounded-xl border border-pink-300 bg-pink-50 p-4">
            <span className="font-semibold text-text-primary">{t('driver.womenOnlyTrip')}</span>
            <input type="checkbox" checked={isWomenOnly} onChange={(e) => setIsWomenOnly(e.target.checked)} className="h-5 w-5" />
          </label>
        )}

        {error && <p className="text-sm text-danger">{error}</p>}

        <Button type="submit" loading={loading} disabled={isApproved === false}>
          {t('driver.publishTrip')}
        </Button>
      </form>

      {pickingLocation && (
        <LocationPicker
          title={pickingLocation === 'origin' ? t('driver.originPointTitle') : t('driver.destinationPointTitle')}
          initialLat={pickingLocation === 'origin' ? originPoint?.lat : destinationPoint?.lat}
          initialLng={pickingLocation === 'origin' ? originPoint?.lng : destinationPoint?.lng}
          onClose={() => setPickingLocation(null)}
          onConfirm={(lat, lng) => {
            if (pickingLocation === 'origin') setOriginPoint({ lat, lng })
            else setDestinationPoint({ lat, lng })
            setPickingLocation(null)
          }}
        />
      )}
    </div>
  )
}
