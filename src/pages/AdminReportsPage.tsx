import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { subscribeSupportReports, setReportStatus, type SupportReport } from '../lib/admin'
import { fetchUserProfile } from '../lib/users'
import { Button } from '../components/ui/Button'

function ReportRow({ report }: { report: SupportReport }) {
  const { t } = useTranslation()
  const [name, setName] = useState(report.reporterId)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchUserProfile(report.reporterId).then((u) => {
      if (u?.fullName) setName(u.fullName)
    })
  }, [report.reporterId])

  async function handle(status: SupportReport['status']) {
    setLoading(true)
    try {
      await setReportStatus(report.id, status)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mb-3 rounded-2xl border border-border bg-card p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-semibold text-text-primary">{name}</span>
        <span className="text-xs text-text-secondary">{report.status}</span>
      </div>
      <p className="mb-3 whitespace-pre-wrap text-text-secondary">{report.message}</p>
      {report.status === 'pending' && (
        <div className="flex gap-2">
          <Button onClick={() => handle('resolved')} loading={loading} fullWidth={false}>
            {t('admin.approveAction')}
          </Button>
          <Button variant="secondary" onClick={() => handle('closed')} loading={loading} fullWidth={false}>
            {t('admin.closeReport')}
          </Button>
        </div>
      )}
    </div>
  )
}

export default function AdminReportsPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [reports, setReports] = useState<SupportReport[]>([])

  useEffect(() => {
    return subscribeSupportReports(setReports)
  }, [])

  return (
    <div className="min-h-screen bg-bg">
      <header className="flex items-center gap-3 border-b border-border bg-card px-4 py-4">
        <button onClick={() => navigate('/admin')} className="text-xl">
          ←
        </button>
        <h1 className="text-lg font-bold text-text-primary">{t('admin.reportsTitle')}</h1>
      </header>
      <main className="mx-auto max-w-lg px-4 py-6">
        {reports.length === 0 && <p className="py-12 text-center text-text-secondary">{t('admin.noReports')}</p>}
        {reports.map((report) => (
          <ReportRow key={report.id} report={report} />
        ))}
      </main>
    </div>
  )
}
