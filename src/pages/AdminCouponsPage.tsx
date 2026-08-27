import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { subscribeCoupons, addCoupon, toggleCouponActive, deleteCoupon, type CouponRow } from '../lib/admin'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

export default function AdminCouponsPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [items, setItems] = useState<CouponRow[]>([])
  const [code, setCode] = useState('')
  const [value, setValue] = useState('')
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage')
  const [maxUses, setMaxUses] = useState('100')

  useEffect(() => subscribeCoupons(setItems), [])

  async function handleAdd() {
    if (!code.trim() || !value) return
    await addCoupon({
      code: code.trim(),
      discountType,
      value: Number(value),
      maxUses: Number(maxUses),
      isActive: true,
    })
    setCode('')
    setValue('')
  }

  return (
    <div className="min-h-screen bg-bg">
      <header className="flex items-center gap-3 border-b border-border bg-card px-4 py-4">
        <button onClick={() => navigate(-1)} className="text-xl">
          ←
        </button>
        <h1 className="text-lg font-bold text-text-primary">{t('admin.couponsTitle')}</h1>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6">
        <div className="mb-6 rounded-2xl border border-border bg-card p-4">
          <h2 className="mb-3 font-bold text-text-primary">{t('admin.newCoupon')}</h2>
          <div className="flex flex-col gap-3">
            <Input label={t('admin.code')} value={code} onChange={(e) => setCode(e.target.value)} />
            <div className="grid grid-cols-2 gap-3">
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'fixed')}
                className="rounded-xl border-2 border-border px-3 py-2.5"
              >
                <option value="percentage">{t('admin.percentage')}</option>
                <option value="fixed">{t('admin.fixedAmount')}</option>
              </select>
              <Input label="" placeholder={t('admin.value')} type="number" value={value} onChange={(e) => setValue(e.target.value)} />
            </div>
            <Input label={t('admin.maxUses')} type="number" value={maxUses} onChange={(e) => setMaxUses(e.target.value)} />
            <Button onClick={handleAdd} fullWidth={false}>
              {t('admin.addCoupon')}
            </Button>
          </div>
        </div>

        {items.map((c) => (
          <div key={c.id} className="mb-2 flex items-center justify-between rounded-xl border border-border bg-card p-4">
            <div>
              <p className="font-bold text-text-primary">{c.code}</p>
              <p className="text-sm text-text-secondary">
                {c.discountType === 'percentage' ? `${c.value}%` : `${c.value} ${t('common.currency')}`} · {t('admin.used')} {c.usedCount}/{c.maxUses}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-text-secondary">
                <input type="checkbox" checked={c.isActive} onChange={(e) => toggleCouponActive(c.id, e.target.checked)} />
                {t('admin.active')}
              </label>
              <button onClick={() => deleteCoupon(c.id)} className="text-danger">
                🗑️
              </button>
            </div>
          </div>
        ))}
      </main>
    </div>
  )
}
