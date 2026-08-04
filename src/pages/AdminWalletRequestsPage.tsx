import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { subscribePendingWalletRequests, resolveWalletRequest, type WalletRequestRow } from '../lib/admin'
import { fetchUserProfile } from '../lib/users'
import type { AppUser } from '../types/user'
import { Button } from '../components/ui/Button'

function RequestRow({ request }: { request: WalletRequestRow }) {
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
      alert(err instanceof Error ? err.message : 'حصل خطأ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mb-3 rounded-2xl border border-border bg-white p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-semibold text-text-primary">{user?.fullName ?? request.userId}</span>
        <span className="text-sm text-text-secondary">{request.type === 'deposit' ? 'إيداع' : 'سحب'}</span>
      </div>
      <p className="mb-3 text-lg font-bold text-primary">{request.amount.toFixed(0)} ج.م</p>
      <div className="flex gap-3">
        <Button variant="danger" onClick={() => handle(false)} loading={loading}>
          رفض
        </Button>
        <Button variant="success" onClick={() => handle(true)} loading={loading}>
          موافقة
        </Button>
      </div>
    </div>
  )
}

export default function AdminWalletRequestsPage() {
  const navigate = useNavigate()
  const [requests, setRequests] = useState<WalletRequestRow[]>([])

  useEffect(() => subscribePendingWalletRequests(setRequests), [])

  return (
    <div className="min-h-screen bg-bg">
      <header className="flex items-center gap-3 border-b border-border bg-white px-4 py-4">
        <button onClick={() => navigate(-1)} className="text-xl">
          ←
        </button>
        <h1 className="text-lg font-bold text-text-primary">طلبات المحفظة</h1>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6">
        {requests.length === 0 && <p className="py-12 text-center text-text-secondary">مفيش طلبات معلّقة دلوقتي</p>}
        {requests.map((r) => (
          <RequestRow key={r.txId} request={r} />
        ))}
      </main>
    </div>
  )
}
