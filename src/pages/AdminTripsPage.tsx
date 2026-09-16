import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Search, Trash2 } from 'lucide-react'
import { subscribeAllTrips, deleteTrip, type ManagedTrip } from '../lib/admin'

function getStatusConfig(t: (key: string) => string): Record<string, { label: string; color: string }> {
  return {
    pending: { label: t('admin.statusPending'), color: 'text-warning' },
    active: { label: t('admin.statusActiveTrip'), color: 'text-success' },
    full: { label: t('admin.statusFull'), color: 'text-primary' },
    driver_arriving: { label: 'السائق في الطريق', color: 'text-warning' },
    in_progress: { label: 'الرحلة جارية', color: 'text-success' },
    completed: { label: t('admin.statusCompleted'), color: 'text-text-secondary' },
    cancelled: { label: t('admin.statusCancelled'), color: 'text-danger' },
    expired: { label: t('admin.statusExpired'), color: 'text-text-secondary' },
  }
}

export default function AdminTripsPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { t, i18n } = useTranslation()
  const STATUS_CONFIG = getStatusConfig(t)
  const [trips, setTrips] = useState<ManagedTrip[]>([])
  const [search, setSearch] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)
  const statusFilter = searchParams.get('status') ?? 'all'

  useEffect(() => subscribeAllTrips(setTrips), [])

  const filtered = useMemo(() => {
    let result = trips
    if (statusFilter !== 'all') result = result.filter((trip) => trip.status === statusFilter)
    if (!search.trim()) return result
    return result.filter((trip) => trip.originCity.includes(search.trim()) || trip.destinationCity.includes(search.trim()))
  }, [trips, search, statusFilter])

  function setStatusFilter(status: string) {
    if (status === 'all') setSearchParams({})
    else setSearchParams({ status })
  }

  async function handleDelete(trip: ManagedTrip) {
    if (!confirm(t('admin.confirmDeleteTrip', { from: trip.originCity, to: trip.destinationCity }))) return
    setBusyId(trip.id)
    try {
      await deleteTrip(trip.id)
    } catch {
      alert(t('admin.deleteError'))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="min-h-screen bg-bg">
      <header className="flex items-center gap-3 border-b border-border bg-card px-4 py-4">
        <button onClick={() => navigate(-1)} className="text-xl">←</button>
        <div>
          <h1 className="text-lg font-bold text-text-primary">{t('admin.tripsTitle')}</h1>
          {statusFilter === 'active' && <p className="text-xs text-success">عرض الرحلات النشطة فقط</p>}
        </div>
      </header>

      <div className="sticky top-0 z-10 border-b border-border bg-card px-4 py-3">
        <div className="mx-auto mb-3 flex w-full max-w-7xl gap-2 overflow-x-auto">
          <button onClick={() => setStatusFilter('all')} className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold ${statusFilter === 'all' ? 'border-primary bg-primary-light text-primary' : 'border-border text-text-secondary'}`}>كل الرحلات</button>
          <button onClick={() => setStatusFilter('active')} className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold ${statusFilter === 'active' ? 'border-success bg-success/10 text-success' : 'border-border text-text-secondary'}`}>النشطة</button>
          <button onClick={() => setStatusFilter('in_progress')} className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold ${statusFilter === 'in_progress' ? 'border-success bg-success/10 text-success' : 'border-border text-text-secondary'}`}>جارية</button>
          <button onClick={() => setStatusFilter('completed')} className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold ${statusFilter === 'completed' ? 'border-primary bg-primary-light text-primary' : 'border-border text-text-secondary'}`}>مكتملة</button>
          <button onClick={() => setStatusFilter('cancelled')} className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold ${statusFilter === 'cancelled' ? 'border-danger bg-danger/10 text-danger' : 'border-border text-text-secondary'}`}>ملغية</button>
        </div>
        <div className="mx-auto flex w-full max-w-7xl items-center gap-2 rounded-xl border-2 border-border px-3 py-2">
          <Search size={18} className="text-text-secondary" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('admin.searchByGovernorate')} className="flex-1 bg-transparent outline-none" />
        </div>
      </div>

      <main className="mx-auto w-full max-w-7xl px-4 py-6">
        <p className="mb-3 text-sm text-text-secondary">{filtered.length} {t('admin.tripsCountLabel')}</p>
        {filtered.length === 0 && <p className="py-12 text-center text-text-secondary">لا توجد رحلات مطابقة للفلتر الحالي</p>}
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {filtered.map((trip) => (
          <div key={trip.id} className="mb-3 rounded-2xl border border-border bg-card p-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="font-semibold text-text-primary">{trip.originCity} → {trip.destinationCity}</p>
              <span className={`text-sm font-semibold ${STATUS_CONFIG[trip.status]?.color ?? 'text-text-secondary'}`}>{STATUS_CONFIG[trip.status]?.label ?? trip.status}</span>
            </div>
            <p className="mb-3 text-sm text-text-secondary">
              {new Intl.DateTimeFormat(i18n.language === 'ar' ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(trip.departureTime)} · {trip.availableSeats}/{trip.totalSeats} {t('admin.seats')} · {trip.pricePerSeat.toFixed(0)} {t('common.currency')}
            </p>
            <div className="flex gap-2">
              <button onClick={() => navigate(`/trip/${trip.id}`)} className="flex-1 rounded-lg border border-primary/40 py-2 text-sm font-semibold text-primary">التفاصيل</button>
              <button onClick={() => handleDelete(trip)} disabled={busyId === trip.id} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-danger/40 py-2 text-sm font-semibold text-danger disabled:opacity-40">
                <Trash2 size={14} /> {t('admin.deleteTrip')}
              </button>
            </div>
          </div>
        ))}
        </div>
      </main>
    </div>
  )
}
