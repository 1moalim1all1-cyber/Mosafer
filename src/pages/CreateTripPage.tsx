import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { createTrip } from '../lib/driverActions'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

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

  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [price, setPrice] = useState('')
  const [seats, setSeats] = useState('3')
  const [duration, setDuration] = useState('60')
  const [isReturnEmptyTrip, setIsReturnEmptyTrip] = useState(false)
  const [isWomenOnly, setIsWomenOnly] = useState(false)

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!origin || !destination) {
      setError('اختار نقطة الانطلاق والوصول')
      return
    }
    if (origin === destination) {
      setError('نقطة الانطلاق والوصول لازم يكونوا مختلفين')
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
        originLat: 0,
        originLng: 0,
        destinationCity: destination,
        destinationGovernorate: destination,
        destinationLat: 0,
        destinationLng: 0,
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

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-text-primary">من</label>
          <select
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            className="w-full rounded-xl border-2 border-border bg-white px-4 py-3 focus:border-primary focus:outline-none"
          >
            <option value="">اختار المحافظة</option>
            {GOVERNORATES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-text-primary">إلى</label>
          <select
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="w-full rounded-xl border-2 border-border bg-white px-4 py-3 focus:border-primary focus:outline-none"
          >
            <option value="">اختار المحافظة</option>
            {GOVERNORATES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input label="التاريخ" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
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

        <Button type="submit" loading={loading}>
          نشر الرحلة
        </Button>
      </form>
    </div>
  )
}
