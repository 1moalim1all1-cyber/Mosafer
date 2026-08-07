import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchAppSettings, updateAppSettings, type AppSettings } from '../lib/admin'
import { uploadImageToCloudinary } from '../lib/cloudinary'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

export default function AdminSettingsPage() {
  const navigate = useNavigate()
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploadingHero, setUploadingHero] = useState(false)

  useEffect(() => {
    fetchAppSettings().then(setSettings)
  }, [])

  async function handleHeroUpload(file: File) {
    if (!settings) return
    setUploadingHero(true)
    try {
      const url = await uploadImageToCloudinary(file, 'mosafer/landing')
      setSettings({ ...settings, heroImageUrl: url })
    } catch {
      alert('فشل رفع الصورة، حاول تاني')
    } finally {
      setUploadingHero(false)
    }
  }

  async function handleSave() {
    if (!settings) return
    setSaving(true)
    setSaved(false)
    try {
      await updateAppSettings(settings)
      setSaved(true)
    } finally {
      setSaving(false)
    }
  }

  if (!settings) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg">
      <header className="flex items-center gap-3 border-b border-border bg-card px-4 py-4">
        <button onClick={() => navigate(-1)} className="text-xl">
          ←
        </button>
        <h1 className="text-lg font-bold text-text-primary">إعدادات النظام</h1>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6">
        <h2 className="mb-3 font-bold text-text-primary">العمولات</h2>
        <div className="mb-6 flex flex-col gap-3">
          <Input
            label="عمولة الرحلة العادية (%)"
            type="number"
            value={settings.commissionStandardPercent}
            onChange={(e) => setSettings({ ...settings, commissionStandardPercent: Number(e.target.value) })}
          />
          <Input
            label='عمولة "راجع فاضي" (%)'
            type="number"
            value={settings.commissionReturnEmptyPercent}
            onChange={(e) => setSettings({ ...settings, commissionReturnEmptyPercent: Number(e.target.value) })}
          />
        </div>

        <h2 className="mb-3 font-bold text-text-primary">برامج التسويق</h2>
        <div className="mb-6 flex flex-col gap-3">
          <Input
            label="رصيد ترحيبي لكل مستخدم جديد (ج.م)"
            type="number"
            value={settings.welcomeBonusAmount}
            onChange={(e) => setSettings({ ...settings, welcomeBonusAmount: Number(e.target.value) })}
          />
          <Input
            label="مكافأة دعوة صديق - لكل طرف (ج.م)"
            type="number"
            value={settings.referralBonusAmount}
            onChange={(e) => setSettings({ ...settings, referralBonusAmount: Number(e.target.value) })}
          />
        </div>

        <h2 className="mb-3 font-bold text-text-primary">الدعم الفني</h2>
        <div className="mb-6 flex flex-col gap-3">
          <Input
            label="رقم واتساب الدعم"
            value={settings.whatsappNumber}
            onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
            dir="ltr"
          />
          <Input
            label="بريد الدعم الإلكتروني"
            value={settings.supportEmail}
            onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
            dir="ltr"
          />
        </div>

        <h2 className="mb-3 font-bold text-text-primary">استقبال الإيداعات</h2>
        <p className="mb-3 text-sm text-text-secondary">
          الرقم ده هيظهر للمستخدمين لما يحبوا يودّعوا رصيد - هيحوّلوا عليه بره التطبيق (فودافون كاش/إنستاباي)
        </p>
        <div className="mb-6 flex flex-col gap-3">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-text-primary">وسيلة الاستقبال</label>
            <select
              value={settings.depositMethodName}
              onChange={(e) => setSettings({ ...settings, depositMethodName: e.target.value })}
              className="w-full rounded-xl border-2 border-border bg-card px-4 py-3 focus:border-primary focus:outline-none"
            >
              <option value="فودافون كاش">فودافون كاش</option>
              <option value="إنستاباي">إنستاباي</option>
              <option value="اتصالات كاش">اتصالات كاش</option>
              <option value="أورنج كاش">أورنج كاش</option>
              <option value="تحويل بنكي">تحويل بنكي</option>
            </select>
          </div>
          <Input
            label="الرقم أو الحساب"
            value={settings.depositPhoneNumber}
            onChange={(e) => setSettings({ ...settings, depositPhoneNumber: e.target.value })}
            dir="ltr"
          />
        </div>

        <h2 className="mb-3 font-bold text-text-primary">صورة صفحة الهبوط الرئيسية</h2>
        <p className="mb-3 text-sm text-text-secondary">
          الصورة اللي بتظهر خلفية في أول صفحة يشوفها أي زائر قبل ما يسجّل دخول
        </p>
        <div className="mb-6">
          {settings.heroImageUrl && (
            <img src={settings.heroImageUrl} alt="معاينة" className="mb-3 h-40 w-full rounded-xl object-cover" />
          )}
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-card py-4 text-text-secondary hover:border-primary">
            {uploadingHero ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            ) : (
              <span>📷 {settings.heroImageUrl ? 'تغيير الصورة' : 'رفع صورة'}</span>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploadingHero}
              onChange={(e) => e.target.files?.[0] && handleHeroUpload(e.target.files[0])}
            />
          </label>
        </div>

        {saved && <p className="mb-4 text-sm font-semibold text-success">✅ تم الحفظ</p>}

        <Button onClick={handleSave} loading={saving}>
          حفظ الإعدادات
        </Button>
      </main>
    </div>
  )
}
