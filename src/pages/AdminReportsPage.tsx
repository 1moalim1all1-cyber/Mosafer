import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { replyToSupportReport, subscribeSupportReports, setReportStatus, type SupportReport } from '../lib/admin'
import { fetchUserProfile } from '../lib/users'
import { Button } from '../components/ui/Button'

function ReportRow({ report }: { report: SupportReport }) {
  const { t } = useTranslation()
  const [name, setName] = useState(report.reporterId)
  const [loading, setLoading] = useState(false)
  const [reply, setReply] = useState(report.adminReply ?? '')
  const [error, setError] = useState('')

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

  async function sendReply(status: SupportReport['status']) {
    setLoading(true)
    setError('')
    try {
      await replyToSupportReport(report, reply, status)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'تعذر إرسال الرد')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mb-3 rounded-2xl border border-border bg-card p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-semibold text-text-primary">{name}</span>
        <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">{report.status}</span>
      </div>
      <p className="mb-1 text-xs text-text-secondary">{report.createdAt.toLocaleString('ar-EG')}</p>
      <p className="mb-3 whitespace-pre-wrap text-text-secondary">{report.message}</p>
      <textarea value={reply} onChange={(event) => setReply(event.target.value)} rows={3} placeholder="اكتب رد الإدارة لصاحب البلاغ" className="mb-2 w-full rounded-xl border border-border bg-bg p-3 text-text-primary outline-none focus:border-primary" />
      {error && <p className="mb-2 text-sm text-danger">{error}</p>}
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => sendReply('in_progress')} loading={loading} disabled={!reply.trim()} fullWidth={false}>إرسال وقيد المراجعة</Button>
        <Button variant="secondary" onClick={() => sendReply('resolved')} loading={loading} disabled={!reply.trim()} fullWidth={false}>إرسال وتم الحل</Button>
        {report.status !== 'closed' && <Button variant="secondary" onClick={() => handle('closed')} loading={loading} fullWidth={false}>{t('admin.closeReport')}</Button>}
      </div>
      {report.adminReply && <p className="mt-3 rounded-xl bg-primary/5 p-3 text-sm text-text-secondary"><strong className="text-text-primary">آخر رد:</strong> {report.adminReply}</p>}
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
