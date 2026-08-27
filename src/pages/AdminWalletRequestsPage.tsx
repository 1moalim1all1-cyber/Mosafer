import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { subscribePendingWalletRequests, resolveWalletRequest, type WalletRequestRow } from '../lib/admin'
import { fetchUserProfile } from '../lib/users'
import type { AppUser } from '../types/user'
import { Button } from '../components/ui/Button'

function RequestRow({ request }: { request: WalletRequestRow }) {
  const { t } = useTranslation()
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchUserProfile(request.userId).then(setUser)
  }, [request.userId])

  async function handle(approve: boolean) {
    setLoading(true)
    try {
      await resolveWalletRequest(request.userId, request.txId, approve)
    } catch (err) {
      alert(err instanceof Error ? err.message : t('admin.genericError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mb-3 rounded-2xl border border-border bg-card p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-semibold text-text-primary">{user?.fullName ?? request.userId}</span>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
            request.type === 'deposit' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
          }`}
        >
          {request.type === 'deposit' ? t('wallet.deposit') : t('wallet.withdraw')}
        </span>
      </div>
      <p className="mb-2 text-lg font-bold text-primary">{request.amount.toFixed(0)} {t('common.currency')}</p>

      {request.type === 'withdraw' && request.accountNumber && (
        <div className="mb-3 rounded-lg bg-warning/5 p-3">
          <p className="text-xs text-text-secondary">{t('admin.sendMoneyTo')}</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-text-primary">{request.method}</p>
              <p dir="ltr" className="font-bold text-text-primary">
                {request.accountNumber}
              </p>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(request.accountNumber ?? '')
                alert(t('admin.numberCopied'))
              }}
              className="rounded-lg border border-border px-3 py-1.5 text-sm font-semibold text-primary"
            >
              📋 {t('admin.copy')}
            </button>
          </div>
        </div>
      )}

      {request.type === 'deposit' && request.senderNumber && (
        <p className="mb-3 text-sm text-text-secondary">
          {t('admin.transferredFrom')} <span dir="ltr">{request.senderNumber}</span>
        </p>
      )}

      <div className="flex gap-3">
        <Button variant="danger" onClick={() => handle(false)} loading={loading}>
          {t('admin.reject')}
        </Button>
        <Button variant="success" onClick={() => handle(true)} loading={loading}>
          {request.type === 'withdraw' ? t('admin.transferDone') : t('admin.approveAction')}
        </Button>
      </div>
    </div>
  )
}

export default function AdminWalletRequestsPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [requests, setRequests] = useState<WalletRequestRow[]>([])

  useEffect(() => subscribePendingWalletRequests(setRequests), [])

  return (
    <div className="min-h-screen bg-bg">
      <header className="flex items-center gap-3 border-b border-border bg-card px-4 py-4">
        <button onClick={() => navigate(-1)} className="text-xl">
          ←
        </button>
        <h1 className="text-lg font-bold text-text-primary">{t('admin.walletRequestsTitle')}</h1>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6">
        {requests.length === 0 && <p className="py-12 text-center text-text-secondary">{t('admin.noPendingRequests')}</p>}
        {requests.map((r) => (
          <RequestRow key={r.txId} request={r} />
        ))}
      </main>
    </div>
  )
}
