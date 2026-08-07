import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ShieldCheck, ShieldX, ShieldAlert } from 'lucide-react'
import { subscribeAllUsers, setUserStatus, type ManagedUser } from '../lib/admin'

const ROLE_LABELS: Record<ManagedUser['role'], string> = {
  passenger: 'راكب',
  driver: 'سائق',
  admin: 'أدمن',
}

const STATUS_CONFIG: Record<ManagedUser['status'], { label: string; color: string }> = {
  active: { label: 'نشط', color: 'text-success' },
  suspended: { label: 'موقوف مؤقتًا', color: 'text-warning' },
  banned: { label: 'محظور', color: 'text-danger' },
}

export default function AdminUsersPage() {
  const navigate = useNavigate()
  const [users, setUsers] = useState<ManagedUser[]>([])
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | ManagedUser['role']>('all')
  const [busyUid, setBusyUid] = useState<string | null>(null)

  useEffect(() => subscribeAllUsers(setUsers), [])

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchesRole = roleFilter === 'all' || u.role === roleFilter
      const matchesSearch =
        !search.trim() || u.fullName.includes(search.trim()) || u.phone.includes(search.trim())
      return matchesRole && matchesSearch
    })
  }, [users, search, roleFilter])

  async function changeStatus(uid: string, status: ManagedUser['status']) {
    setBusyUid(uid)
    try {
      await setUserStatus(uid, status)
    } finally {
      setBusyUid(null)
    }
  }

  return (
    <div className="min-h-screen bg-bg">
      <header className="flex items-center gap-3 border-b border-border bg-white px-4 py-4">
        <button onClick={() => navigate(-1)} className="text-xl">
          ←
        </button>
        <h1 className="text-lg font-bold text-text-primary">إدارة المستخدمين</h1>
      </header>

      <div className="sticky top-0 z-10 border-b border-border bg-white px-4 py-3">
        <div className="mb-2 flex items-center gap-2 rounded-xl border-2 border-border px-3 py-2">
          <Search size={18} className="text-text-secondary" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="دوّر بالاسم أو رقم الهاتف"
            className="flex-1 outline-none"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {(['all', 'passenger', 'driver', 'admin'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-sm font-semibold ${
                roleFilter === r ? 'border-primary bg-primary-light text-primary' : 'border-border text-text-secondary'
              }`}
            >
              {r === 'all' ? 'الكل' : ROLE_LABELS[r]}
            </button>
          ))}
        </div>
      </div>

      <main className="mx-auto max-w-lg px-4 py-6">
        <p className="mb-3 text-sm text-text-secondary">{filtered.length} مستخدم</p>

        {filtered.map((u) => (
          <div key={u.uid} className="mb-3 rounded-2xl border border-border bg-white p-4">
            <div className="mb-2 flex items-center justify-between">
              <div>
                <p className="font-semibold text-text-primary">{u.fullName || 'بدون اسم'}</p>
                <p dir="ltr" className="text-sm text-text-secondary">
                  {u.phone}
                </p>
              </div>
              <span className="rounded-full bg-primary-light px-2 py-1 text-xs font-semibold text-primary">
                {ROLE_LABELS[u.role]}
              </span>
            </div>

            <div className="mb-3 flex items-center justify-between text-sm text-text-secondary">
              <span>⭐ {u.avgRating.toFixed(1)} · {u.totalTrips} رحلة</span>
              <span className={`font-semibold ${STATUS_CONFIG[u.status].color}`}>{STATUS_CONFIG[u.status].label}</span>
            </div>

            {u.role !== 'admin' && (
              <div className="flex gap-2">
                <button
                  onClick={() => changeStatus(u.uid, 'active')}
                  disabled={busyUid === u.uid || u.status === 'active'}
                  className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-success/40 py-2 text-xs font-semibold text-success disabled:opacity-40"
                >
                  <ShieldCheck size={14} /> تفعيل
                </button>
                <button
                  onClick={() => changeStatus(u.uid, 'suspended')}
                  disabled={busyUid === u.uid || u.status === 'suspended'}
                  className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-warning/40 py-2 text-xs font-semibold text-warning disabled:opacity-40"
                >
                  <ShieldAlert size={14} /> إيقاف مؤقت
                </button>
                <button
                  onClick={() => changeStatus(u.uid, 'banned')}
                  disabled={busyUid === u.uid || u.status === 'banned'}
                  className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-danger/40 py-2 text-xs font-semibold text-danger disabled:opacity-40"
                >
                  <ShieldX size={14} /> حظر
                </button>
              </div>
            )}
          </div>
        ))}
      </main>
    </div>
  )
}
