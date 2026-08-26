import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/useAuth'
import {
  subscribeWalletBalance,
  subscribeWalletTransactions,
  requestDeposit,
  requestWithdraw,
  type WalletTransaction,
} from '../lib/wallet'
import { fetchAppSettings, type AppSettings } from '../lib/admin'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { BottomNav } from '../components/BottomNav'

const TYPE_LABELS: Record<WalletTransaction['type'], { label: string; icon: string }> = {
  deposit: { label: 'إيداع', icon: '⬆️' },
  withdraw: { label: 'سحب', icon: '⬇️' },
  payment: { label: 'دفع ثمن رحلة', icon: '🚗' },
  refund: { label: 'استرداد', icon: '↩️' },
  commission: { label: 'عمولة المنصة', icon: '%' },
}

const WITHDRAW_METHODS = ['فودافون كاش', 'إنستاباي', 'اتصالات كاش', 'أورنج كاش', 'تحويل بنكي']

export default function WalletPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [balance, setBalance] = useState(0)
  const [transactions, setTransactions] = useState<WalletTransaction[]>([])
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [showModal, setShowModal] = useState<'deposit' | 'withdraw' | null>(null)

  const [depositAmount, setDepositAmount] = useState('')
  const [senderNumber, setSenderNumber] = useState('')

  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawMethod, setWithdrawMethod] = useState(WITHDRAW_METHODS[0])
  const [accountNumber, setAccountNumber] = useState('')

  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (!user) return
    const unsub1 = subscribeWalletBalance(user.uid, setBalance)
    const unsub2 = subscribeWalletTransactions(user.uid, setTransactions)
    fetchAppSettings().then(setSettings)
    return () => {
      unsub1()
      unsub2()
    }
  }, [user])

  async function handleDeposit() {
    if (!user || !depositAmount || Number(depositAmount) <= 0 || !senderNumber.trim()) return
    setLoading(true)
    try {
      await requestDeposit(user.uid, Number(depositAmount), senderNumber.trim())
      setSubmitted(true)
    } finally {
      setLoading(false)
    }
  }

  async function handleWithdraw() {
    if (!user || !withdrawAmount || Number(withdrawAmount) <= 0 || !accountNumber.trim()) return
    if (Number(withdrawAmount) > balance) return
    setLoading(true)
    try {
      await requestWithdraw(user.uid, Number(withdrawAmount), withdrawMethod, accountNumber.trim())
      setSubmitted(true)
    } finally {
      setLoading(false)
    }
  }

  function closeModal() {
    setShowModal(null)
    setSubmitted(false)
    setDepositAmount('')
    setSenderNumber('')
    setWithdrawAmount('')
    setAccountNumber('')
  }

  return (
    <div className="min-h-screen bg-bg pb-24">
      <header className="flex items-center gap-3 border-b border-border bg-card px-4 py-4">
        <button onClick={() => navigate(-1)} className="text-xl">
          ←
        </button>
        <h1 className="text-lg font-bold text-text-primary">{t('wallet.title')}</h1>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6">
        <div className="mb-6 rounded-2xl bg-gradient-to-br from-primary to-secondary p-6 text-white shadow-lg shadow-primary/20">
          <p className="text-sm text-white/70">{t('wallet.balance')}</p>
          <p className="mb-4 text-3xl font-bold">{balance.toFixed(0)} {t('common.currency')}</p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowModal('deposit')}
              className="flex-1 rounded-xl border-2 border-white/50 py-2.5 font-semibold hover:bg-card/10"
            >
              {t('wallet.deposit')}
            </button>
            <button
              onClick={() => setShowModal('withdraw')}
              className="flex-1 rounded-xl border-2 border-white/50 py-2.5 font-semibold hover:bg-card/10"
            >
              {t('wallet.withdraw')}
            </button>
          </div>
        </div>

        <h2 className="mb-3 font-bold text-text-primary">{t('wallet.transactions')}</h2>
        {transactions.length === 0 && <p className="py-8 text-center text-text-secondary">{t('wallet.noTransactions')}</p>}
        {transactions.map((tx) => {
          const isCredit = tx.type === 'deposit' || tx.type === 'refund'
          const color = tx.status === 'pending' ? 'text-warning' : isCredit ? 'text-success' : 'text-danger'
          return (
            <div key={tx.id} className="mb-2 rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{TYPE_LABELS[tx.type].icon}</span>
                  <div>
                    <p className="font-semibold text-text-primary">{TYPE_LABELS[tx.type].label}</p>
                    <p className="text-xs text-text-secondary">
                      {tx.status === 'pending'
                        ? 'بانتظار الموافقة'
                        : new Intl.DateTimeFormat('ar-EG').format(tx.createdAt)}
                    </p>
                  </div>
                </div>
                <span className={`font-bold ${color}`}>
                  {isCredit ? '+' : '-'}
                  {tx.amount.toFixed(0)} {t('common.currency')}
                </span>
              </div>
              {(tx.method || tx.accountNumber || tx.senderNumber) && (
                <div className="mt-2 border-t border-border pt-2 text-xs text-text-secondary">
                  {tx.method && <span>{tx.method} · </span>}
                  {tx.accountNumber && <span dir="ltr">{tx.accountNumber}</span>}
                  {tx.senderNumber && <span dir="ltr">حوّلت من: {tx.senderNumber}</span>}
                </div>
              )}
            </div>
          )
        })}
      </main>

      <BottomNav />

      {showModal === 'deposit' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-card p-6">
            {submitted ? (
              <div className="text-center">
                <p className="mb-2 text-4xl">✅</p>
                <p className="mb-2 font-bold text-text-primary">تم إرسال طلبك بنجاح</p>
                <p className="text-sm text-text-secondary">هنتأكد من التحويل ونضيف الرصيد في أقرب وقت</p>
                <div className="mt-4">
                  <Button onClick={closeModal} fullWidth={false}>
                    تمام
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <h3 className="mb-4 text-lg font-bold text-text-primary">إيداع في المحفظة</h3>
                {settings?.depositPhoneNumber ? (
                  <div className="mb-4 rounded-xl bg-primary-light p-4 text-center">
                    <p className="mb-1 text-sm text-text-secondary">حوّل المبلغ الأول على</p>
                    <p className="text-lg font-bold text-primary">{settings.depositMethodName}</p>
                    <p dir="ltr" className="text-xl font-bold text-primary">
                      {settings.depositPhoneNumber}
                    </p>
                  </div>
                ) : (
                  <p className="mb-4 text-sm text-danger">لسه الإدارة معملتش إعداد رقم استقبال الإيداعات</p>
                )}
                <div className="flex flex-col gap-3">
                  <Input
                    label={`${t('wallet.transferredAmount')} (${t('common.currency')})`}
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                  />
                  <Input
                    label="رقمك اللي حوّلت منه"
                    value={senderNumber}
                    onChange={(e) => setSenderNumber(e.target.value)}
                    dir="ltr"
                    hint="عشان نتأكد من التحويل بسرعة"
                  />
                </div>
                <div className="mt-4 flex gap-3">
                  <Button variant="secondary" onClick={closeModal} fullWidth>
                    إلغاء
                  </Button>
                  <Button
                    onClick={handleDeposit}
                    loading={loading}
                    disabled={!depositAmount || !senderNumber.trim()}
                    fullWidth
                  >
                    تأكيد إني حوّلت
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showModal === 'withdraw' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-card p-6">
            {submitted ? (
              <div className="text-center">
                <p className="mb-2 text-4xl">✅</p>
                <p className="mb-2 font-bold text-text-primary">تم إرسال طلب السحب</p>
                <p className="text-sm text-text-secondary">هيتراجع الطلب والفلوس هتوصلك على الرقم اللي كتبته</p>
                <div className="mt-4">
                  <Button onClick={closeModal} fullWidth={false}>
                    تمام
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <h3 className="mb-4 text-lg font-bold text-text-primary">سحب من المحفظة</h3>
                <p className="mb-4 text-sm text-text-secondary">{t('wallet.availableBalance')}: {balance.toFixed(0)} {t('common.currency')}</p>
                <div className="flex flex-col gap-3">
                  <Input
                    label={`${t('wallet.amount')} (${t('common.currency')})`}
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                  />
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-text-primary">هتستلم إزاي؟</label>
                    <select
                      value={withdrawMethod}
                      onChange={(e) => setWithdrawMethod(e.target.value)}
                      className="w-full rounded-xl border-2 border-border bg-card px-4 py-3 focus:border-primary focus:outline-none"
                    >
                      {WITHDRAW_METHODS.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Input
                    label={withdrawMethod === 'تحويل بنكي' ? 'رقم الحساب / IBAN' : 'رقم الموبايل اللي هتستلم عليه'}
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    dir="ltr"
                  />
                </div>
                {Number(withdrawAmount) > balance && (
                  <p className="mt-2 text-sm text-danger">المبلغ أكبر من رصيدك المتاح</p>
                )}
                <div className="mt-4 flex gap-3">
                  <Button variant="secondary" onClick={closeModal} fullWidth>
                    إلغاء
                  </Button>
                  <Button
                    onClick={handleWithdraw}
                    loading={loading}
                    disabled={!withdrawAmount || !accountNumber.trim() || Number(withdrawAmount) > balance}
                    fullWidth
                  >
                    إرسال طلب السحب
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
