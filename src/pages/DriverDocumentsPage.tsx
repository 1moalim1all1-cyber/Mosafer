import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { submitDriverDocuments } from '../lib/driverActions'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

function FileField({
  label,
  file,
  onChange,
}: {
  label: string
  file: File | null
  onChange: (f: File) => void
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-border bg-card p-4 hover:border-primary">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-light text-xl">
        {file ? '✅' : '📷'}
      </div>
      <div className="flex-1">
        <p className="font-semibold text-text-primary">{label}</p>
        <p className="text-sm text-text-secondary">{file ? file.name : 'اضغط لاختيار صورة'}</p>
      </div>
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && onChange(e.target.files[0])}
      />
    </label>
  )
}

export default function DriverDocumentsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [nationalId, setNationalId] = useState<File | null>(null)
  const [license, setLicense] = useState<File | null>(null)
  const [vehicleLicense, setVehicleLicense] = useState<File | null>(null)
  const [vehicleImage, setVehicleImage] = useState<File | null>(null)
  const [selfie, setSelfie] = useState<File | null>(null)

  const [make, setMake] = useState('')
  const [model, setModel] = useState('')
  const [year, setYear] = useState('')
  const [color, setColor] = useState('')
  const [plateNumber, setPlateNumber] = useState('')
  const [seats, setSeats] = useState('4')

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!nationalId || !license || !vehicleLicense || !vehicleImage || !selfie) {
      setError('من فضلك ارفع كل المستندات الخمسة')
      return
    }
    if (!make || !model || !plateNumber || !year) {
      setError('من فضلك أكمل بيانات السيارة كاملة')
      return
    }
    if (!user) return

    setLoading(true)
    setError(null)
    try {
      await submitDriverDocuments({
        uid: user.uid,
        nationalId,
        license,
        vehicleLicense,
        vehicleImage,
        selfie,
        vehicle: {
          make,
          model,
          year: Number(year),
          color,
          plateNumber,
          carType: 'اقتصادية',
          seats: Number(seats),
        },
      })
      navigate('/driver/pending-approval')
    } catch {
      setError('حصل خطأ أثناء رفع المستندات، تأكد من اتصال الإنترنت وحاول تاني')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold text-text-primary">اعتماد السائق</h1>
      <p className="mb-6 text-text-secondary">
        المستندات دي بتتراجع من فريق مسافر قبل ما تقدر تنشر أي رحلة، وده أساسي لأمان الركاب.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <FileField label="بطاقة الرقم القومي" file={nationalId} onChange={setNationalId} />
        <FileField label="رخصة القيادة" file={license} onChange={setLicense} />
        <FileField label="رخصة السيارة" file={vehicleLicense} onChange={setVehicleLicense} />
        <FileField label="صورة السيارة" file={vehicleImage} onChange={setVehicleImage} />
        <FileField label="صورة شخصية للتحقق" file={selfie} onChange={setSelfie} />

        <h2 className="mt-4 text-lg font-bold text-text-primary">بيانات السيارة</h2>
        <Input label="الماركة (مثال: Hyundai)" value={make} onChange={(e) => setMake(e.target.value)} />
        <Input label="الموديل (مثال: Elantra)" value={model} onChange={(e) => setModel(e.target.value)} />
        <Input label="سنة الصنع" type="number" value={year} onChange={(e) => setYear(e.target.value)} />
        <Input label="اللون" value={color} onChange={(e) => setColor(e.target.value)} />
        <Input label="رقم اللوحة" value={plateNumber} onChange={(e) => setPlateNumber(e.target.value)} />
        <Input label="عدد المقاعد المتاحة للركاب" type="number" value={seats} onChange={(e) => setSeats(e.target.value)} />

        {error && <p className="text-sm text-danger">{error}</p>}

        <Button type="submit" loading={loading}>
          إرسال للمراجعة
        </Button>
      </form>
    </div>
  )
}
