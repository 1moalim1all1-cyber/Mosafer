import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { subscribeWalletBalance, subscribeWalletTransactions, requestDeposit, requestWithdraw, type WalletTransaction } from '../lib/wallet'
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

export default function WalletPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [balance, setBalance] = useState(0)
  const [transactions, setTransactions] = useState<WalletTransaction[]>([])
  const [showModal, setShowModal] = useState<'deposit' | 'withdraw' | null>(null)
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (!user) return
    const unsub1 = subscribeWalletBalance(user.uid, setBalance)
    const unsub2 = subscribeWalletTransactions(user.uid, setTransactions)
    return () => {
      unsub1()
      unsub2()
    }
  }, [user])

  async function handleSubmit() {
    if (!user || !amount || Number(amount) <= 0) return
    setLoading(true)
    try {
      if (showModal === 'deposit') await requestDeposit(user.uid, Number(amount))
      else await requestWithdraw(user.uid, Number(amount))
      setSubmitted(true)
    } finally {
      setLoading(false)
    }
  }

  function closeModal() {
    setShowModal(null)
    setAmount('')
    setSubmitted(false)
  }

  return (
    <div className="min-h-screen bg-bg pb-24">
      <header className="flex items-center gap-3 border-b border-border bg-white px-4 py-4">
        <button onClick={() => navigate(-1)} className="text-xl">
          ←
        </button>
        <h1 className="text-lg font-bold text-text-primary">المحفظة</h1>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6">
        <div className="mb-6 rounded-2xl bg-gradient-to-br from-primary to-primary-hover p-6 text-white shadow-lg shadow-primary/20">
          <p className="text-sm text-white/70">الرصيد الحالي</p>
          <p className="mb-4 text-3xl font-bold">{balance.toFixed(0)} ج.م</p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowModal('deposit')}
              className="flex-1 rounded-xl border-2 border-white/50 py-2.5 font-semibold hover:bg-white/10"
            >
              إيداع
            </button>
            <button
              onClick={() => setShowModal('withdraw')}
              className="flex-1 rounded-xl border-2 border-white/50 py-2.5 font-semibold hover:bg-white/10"
            >
              سحب
            </button>
          </div>
        </div>

        <h2 className="mb-3 font-bold text-text-primary">سجل العمليات</h2>
        {transactions.length === 0 && <p className="py-8 text-center text-text-secondary">لسه مفيش عمليات على محفظتك</p>}
        {transactions.map((tx) => {
          const isCredit = tx.type === 'deposit' || tx.type === 'refund'
          const color = tx.status === 'pending' ? 'text-warning' : isCredit ? 'text-success' : 'text-danger'
          return (
            <div key={tx.id} className="mb-2 flex items-center justify-between rounded-xl border border-border bg-white p-4">
              <div className="flex items-center gap-3">
                <span className="text-xl">{TYPE_LABELS[tx.type].icon}</span>
                <div>
                  <p className="font-semibold text-text-primary">{TYPE_LABELS[tx.type].label}</p>
                  <p className="text-xs text-text-secondary">
                    {tx.status === 'pending' ? 'بانتظار الموافقة' : new Intl.DateTimeFormat('ar-EG').format(tx.createdAt)}
                  </p>
                </div>
              </div>
              <span className={`font-bold ${color}`}>
                {isCredit ? '+' : '-'}
                {tx.amount.toFixed(0)} ج.م
              </span>
            </div>
          )
        })}
      </main>

      <BottomNav />

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6">
            {submitted ? (
              <div className="text-center">
                <div className="mb-2 text-4xl">✅</div>
                <h3 className="mb-2 text-lg font-bold text-text-primary">تم إرسال طلبك بنجاح</h3>
                <p className="mb-4 text-sm text-text-secondary">هيتراجع الطلب وتوصلك النتيجة في سجل العمليات</p>
                <Button onClick={closeModal} fullWidth={false}>
                  تمام
                </Button>
              </div>
            ) : (
              <>
                <h3 className="mb-4 text-lg font-bold text-text-primary">
                  {showModal === 'deposit' ? 'إيداع في المحفظة' : 'سحب من المحفظة'}
                </h3>
                <p className="mb-4 rounded-lg bg-primary-light p-3 text-sm text-primary">
                  الطلب هيتراجع من فريق مسافر ويتحول لرصيدك بعد التأكيد اليدوي
                </p>
                <Input label="المبلغ (ج.م)" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
                <div className="mt-4 flex gap-3">
                  <Button variant="secondary" onClick={closeModal} fullWidth>
                    إلغاء
                  </Button>
                  <Button onClick={handleSubmit} loading={loading} fullWidth>
                    إرسال
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
