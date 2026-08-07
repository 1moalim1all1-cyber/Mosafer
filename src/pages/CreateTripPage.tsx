import { useState, type FormEvent, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { createTrip, subscribeDriverStatus } from '../lib/driverActions'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { LocationPicker } from '../components/LocationPicker'

const GOVERNORATES = [
  'القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'البحر الأحمر', 'البحيرة',
  'الفيوم', 'الغربية', 'الإسماعيلية', 'المنوفية', 'المنيا', 'القليوبية',
  'الوادي الجديد', 'السويس', 'أسوان', 'أسيوط', 'بني سويف', 'بورسعيد',
  'دمياط', 'الشرقية', 'جنوب سيناء', 'كفر الشيخ', 'مطروح', 'الأقصر',
  'قنا', 'شمال سيناء', 'سوهاج',
]

export default function CreateTripPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  // النهارده بصيغة YYYY-MM-DD - نفس صيغة حقل input[type=date]، عشان
  // يتحط افتراضيًا لكن يفضل قابل للتغيير عادي لو السائق عايز تاريخ تاني
  const todayStr = new Date().toISOString().split('T')[0]

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
      })
      navigate('/driver')
    } catch {
      setError('حصل خطأ أثناء نشر الرحلة')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-text-primary">إنشاء رحلة جديدة</h1>

      {isApproved === false && (
        <div className="mb-6 rounded-xl border border-warning/40 bg-warning/10 p-4 text-center">
          <p className="mb-3 text-text-primary">
            حسابك لسه تحت المراجعة، مش هتقدر تنشر أي رحلة لحد ما فريق مسافر يعتمد مستنداتك
          </p>
          <Button onClick={() => navigate('/driver/pending-approval')} fullWidth={false}>
            تفاصيل حالة الاعتماد
          </Button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-text-primary">من</label>
          <select
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            className="w-full rounded-xl border-2 border-border bg-card px-4 py-3 focus:border-primary focus:outline-none"
          >
            <option value="">اختار المحافظة</option>
            {GOVERNORATES.map((g) => (
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
            {originPoint ? '✅ اتحدد بالظبط من الخريطة' : '🗺️ حدد الموقع بالظبط من الخريطة'}
          </button>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-text-primary">إلى</label>
          <select
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="w-full rounded-xl border-2 border-border bg-card px-4 py-3 focus:border-primary focus:outline-none"
          >
            <option value="">اختار المحافظة</option>
            {GOVERNORATES.map((g) => (
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
            {destinationPoint ? '✅ اتحدد بالظبط من الخريطة' : '🗺️ حدد الموقع بالظبط من الخريطة'}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input label="التاريخ" type="date" value={date} min={todayStr} onChange={(e) => setDate(e.target.value)} />
          <Input label="الوقت" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </div>

        <Input label="السعر للمقعد الواحد (ج.م)" type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
        <Input label="عدد المقاعد المتاحة" type="number" value={seats} onChange={(e) => setSeats(e.target.value)} />
        <Input label="المدة المتوقعة (دقيقة)" type="number" value={duration} onChange={(e) => setDuration(e.target.value)} />

        <label className="flex items-center justify-between rounded-xl border border-success/30 bg-success/5 p-4">
          <span className="font-semibold text-text-primary">♻️ راجع فاضي</span>
          <input type="checkbox" checked={isReturnEmptyTrip} onChange={(e) => setIsReturnEmptyTrip(e.target.checked)} className="h-5 w-5" />
        </label>

        {user?.gender === 'female' && (
          <label className="flex items-center justify-between rounded-xl border border-pink-300 bg-pink-50 p-4">
            <span className="font-semibold text-text-primary">👩 رحلة سيدات فقط</span>
            <input type="checkbox" checked={isWomenOnly} onChange={(e) => setIsWomenOnly(e.target.checked)} className="h-5 w-5" />
          </label>
        )}

        {error && <p className="text-sm text-danger">{error}</p>}

        <Button type="submit" loading={loading} disabled={isApproved === false}>
          نشر الرحلة
        </Button>
      </form>

      {pickingLocation && (
        <LocationPicker
          title={pickingLocation === 'origin' ? 'حدد نقطة الانطلاق بالظبط' : 'حدد نقطة الوصول بالظبط'}
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
