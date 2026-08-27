import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/useAuth'
import { submitDriverDocuments } from '../lib/driverActions'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

function FileField({
  label,
  file,
  onChange,
  chooseLabel,
}: {
  label: string
  file: File | null
  onChange: (f: File) => void
  chooseLabel: string
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-border bg-card p-4 hover:border-primary">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-light text-xl">
        {file ? '✅' : '📷'}
      </div>
      <div className="flex-1">
        <p className="font-semibold text-text-primary">{label}</p>
        <p className="text-sm text-text-secondary">{file ? file.name : chooseLabel}</p>
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
  const { t } = useTranslation()

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
      setError(t('driver.errorAllDocs'))
      return
    }
    if (!make || !model || !plateNumber || !year) {
      setError(t('driver.errorVehicleInfo'))
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
      setError(t('driver.errorUpload'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold text-text-primary">{t('driver.documentsTitle')}</h1>
      <p className="mb-6 text-text-secondary">{t('driver.documentsSubtitle')}</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <FileField label={t('driver.docNationalId')} file={nationalId} onChange={setNationalId} chooseLabel={t('driver.tapToChoosePhoto')} />
        <FileField label={t('driver.docLicense')} file={license} onChange={setLicense} chooseLabel={t('driver.tapToChoosePhoto')} />
        <FileField label={t('driver.docVehicleLicense')} file={vehicleLicense} onChange={setVehicleLicense} chooseLabel={t('driver.tapToChoosePhoto')} />
        <FileField label={t('driver.docVehicleImage')} file={vehicleImage} onChange={setVehicleImage} chooseLabel={t('driver.tapToChoosePhoto')} />
        <FileField label={t('driver.docSelfie')} file={selfie} onChange={setSelfie} chooseLabel={t('driver.tapToChoosePhoto')} />

        <h2 className="mt-4 text-lg font-bold text-text-primary">{t('driver.vehicleInfo')}</h2>
        <Input label={t('driver.make')} value={make} onChange={(e) => setMake(e.target.value)} />
        <Input label={t('driver.model')} value={model} onChange={(e) => setModel(e.target.value)} />
        <Input label={t('driver.year')} type="number" value={year} onChange={(e) => setYear(e.target.value)} />
        <Input label={t('driver.color')} value={color} onChange={(e) => setColor(e.target.value)} />
        <Input label={t('driver.plateNumber')} value={plateNumber} onChange={(e) => setPlateNumber(e.target.value)} />
        <Input label={t('driver.availableSeats')} type="number" value={seats} onChange={(e) => setSeats(e.target.value)} />

        {error && <p className="text-sm text-danger">{error}</p>}

        <Button type="submit" loading={loading}>
          {t('driver.submitForReview')}
        </Button>
      </form>
    </div>
  )
}
