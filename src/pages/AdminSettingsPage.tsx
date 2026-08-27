import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { fetchAppSettings, updateAppSettings, type AppSettings } from '../lib/admin'
import { uploadImageToCloudinary } from '../lib/cloudinary'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

export default function AdminSettingsPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
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
      alert(t('settings.uploadError'))
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
        <h1 className="text-lg font-bold text-text-primary">{t('settings.title')}</h1>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6">
        <h2 className="mb-3 font-bold text-text-primary">{t('settings.commissions')}</h2>
        <div className="mb-6 flex flex-col gap-3">
          <Input
            label={t('settings.standardCommission')}
            type="number"
            value={settings.commissionStandardPercent}
            onChange={(e) => setSettings({ ...settings, commissionStandardPercent: Number(e.target.value) })}
          />
          <Input
            label={t('settings.returnEmptyCommission')}
            type="number"
            value={settings.commissionReturnEmptyPercent}
            onChange={(e) => setSettings({ ...settings, commissionReturnEmptyPercent: Number(e.target.value) })}
          />
        </div>

        <h2 className="mb-3 font-bold text-text-primary">{t('settings.marketingPrograms')}</h2>
        <div className="mb-6 flex flex-col gap-3">
          <Input
            label={t('settings.welcomeBonus', { currency: t('common.currency') })}
            type="number"
            value={settings.welcomeBonusAmount}
            onChange={(e) => setSettings({ ...settings, welcomeBonusAmount: Number(e.target.value) })}
          />
          <Input
            label={t('settings.referralBonus', { currency: t('common.currency') })}
            type="number"
            value={settings.referralBonusAmount}
            onChange={(e) => setSettings({ ...settings, referralBonusAmount: Number(e.target.value) })}
          />
        </div>

        <h2 className="mb-3 font-bold text-text-primary">{t('settings.techSupport')}</h2>
        <div className="mb-6 flex flex-col gap-3">
          <Input
            label={t('settings.supportWhatsapp')}
            value={settings.whatsappNumber}
            onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
            dir="ltr"
          />
          <Input
            label={t('settings.supportEmail')}
            value={settings.supportEmail}
            onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
            dir="ltr"
          />
        </div>

        <h2 className="mb-3 font-bold text-text-primary">{t('settings.contactInfo')}</h2>
        <div className="mb-6 flex flex-col gap-3">
          <Input
            label={t('settings.publicPhone')}
            value={settings.contactPhone}
            onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
            dir="ltr"
            placeholder="+20 1xxxxxxxxx"
          />
          <Input
            label={t('settings.publicEmail')}
            value={settings.contactEmail}
            onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
            dir="ltr"
          />
          <Input
            label={t('settings.address')}
            value={settings.contactAddress}
            onChange={(e) => setSettings({ ...settings, contactAddress: e.target.value })}
          />
        </div>

        <h2 className="mb-3 font-bold text-text-primary">{t('settings.socialLinks')}</h2>
        <p className="mb-3 text-sm text-text-secondary">{t('settings.socialLinksHint')}</p>
        <div className="mb-6 flex flex-col gap-3">
          <Input
            label="Facebook"
            value={settings.facebookUrl}
            onChange={(e) => setSettings({ ...settings, facebookUrl: e.target.value })}
            dir="ltr"
            placeholder="https://facebook.com/..."
          />
          <Input
            label="Instagram"
            value={settings.instagramUrl}
            onChange={(e) => setSettings({ ...settings, instagramUrl: e.target.value })}
            dir="ltr"
            placeholder="https://instagram.com/..."
          />
          <Input
            label="TikTok"
            value={settings.tiktokUrl}
            onChange={(e) => setSettings({ ...settings, tiktokUrl: e.target.value })}
            dir="ltr"
            placeholder="https://tiktok.com/@..."
          />
          <Input
            label="YouTube"
            value={settings.youtubeUrl}
            onChange={(e) => setSettings({ ...settings, youtubeUrl: e.target.value })}
            dir="ltr"
            placeholder="https://youtube.com/@..."
          />
        </div>

        <h2 className="mb-3 font-bold text-text-primary">{t('settings.depositReceiving')}</h2>
        <p className="mb-3 text-sm text-text-secondary">{t('settings.depositHint')}</p>
        <div className="mb-6 flex flex-col gap-3">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-text-primary">{t('settings.depositMethod')}</label>
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
            label={t('settings.accountNumber')}
            value={settings.depositPhoneNumber}
            onChange={(e) => setSettings({ ...settings, depositPhoneNumber: e.target.value })}
            dir="ltr"
          />
        </div>

        <h2 className="mb-3 font-bold text-text-primary">{t('settings.landingText')}</h2>
        <div className="mb-6 flex flex-col gap-3">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-text-primary">{t('settings.mainTitle')}</label>
            <textarea
              value={settings.heroTitle}
              onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })}
              rows={2}
              className="w-full rounded-xl border-2 border-border bg-white px-4 py-3 text-base focus:border-primary focus:outline-none"
            />
            <p className="mt-1 text-xs text-text-secondary">{t('settings.newLineHint')}</p>
          </div>
          <Input
            label={t('settings.subtitleLabel')}
            value={settings.heroSubtitle}
            onChange={(e) => setSettings({ ...settings, heroSubtitle: e.target.value })}
          />
        </div>

        <h2 className="mb-3 font-bold text-text-primary">{t('settings.visibleStats')}</h2>
        <p className="mb-3 text-sm text-text-secondary">{t('settings.statsHint')}</p>
        <div className="mb-6 grid grid-cols-2 gap-3">
          <Input
            label={t('settings.numDrivers')}
            value={settings.statDrivers}
            onChange={(e) => setSettings({ ...settings, statDrivers: e.target.value })}
          />
          <Input
            label={t('settings.numTrips')}
            value={settings.statTrips}
            onChange={(e) => setSettings({ ...settings, statTrips: e.target.value })}
          />
          <Input
            label={t('settings.numUsers')}
            value={settings.statUsers}
            onChange={(e) => setSettings({ ...settings, statUsers: e.target.value })}
          />
          <Input
            label={t('settings.numGovernorates')}
            value={settings.statCities}
            onChange={(e) => setSettings({ ...settings, statCities: e.target.value })}
          />
        </div>

        <h2 className="mb-3 font-bold text-text-primary">{t('settings.landingImage')}</h2>
        <p className="mb-3 text-sm text-text-secondary">{t('settings.landingImageHint')}</p>
        <div className="mb-6">
          {settings.heroImageUrl && (
            <img src={settings.heroImageUrl} alt={t('settings.preview')} className="mb-3 h-40 w-full rounded-xl object-cover" />
          )}
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-card py-4 text-text-secondary hover:border-primary">
            {uploadingHero ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            ) : (
              <span>📷 {settings.heroImageUrl ? t('settings.changeImage') : t('settings.uploadImage')}</span>
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

        {saved && <p className="mb-4 text-sm font-semibold text-success">✅ {t('settings.saved')}</p>}

        <Button onClick={handleSave} loading={saving}>
          {t('settings.saveSettings')}
        </Button>
      </main>
    </div>
  )
}
