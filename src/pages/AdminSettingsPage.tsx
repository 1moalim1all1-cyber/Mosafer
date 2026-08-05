import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchAppSettings, updateAppSettings, type AppSettings } from '../lib/admin'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

export default function AdminSettingsPage() {
  const navigate = useNavigate()
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetchAppSettings().then(setSettings)
  }, [])

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
      <header className="flex items-center gap-3 border-b border-border bg-white px-4 py-4">
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

        {saved && <p className="mb-4 text-sm font-semibold text-success">✅ تم الحفظ</p>}

        <Button onClick={handleSave} loading={saving}>
          حفظ الإعدادات
        </Button>
      </main>
    </div>
  )
}
