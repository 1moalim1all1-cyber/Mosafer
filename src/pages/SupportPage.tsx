import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { addDoc, collection, onSnapshot, query, Timestamp, where } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { fetchAppSettings } from '../lib/admin'
import { useAuth } from '../contexts/useAuth'
import { Button } from '../components/ui/Button'
import type { SupportReport } from '../lib/admin'

export default function SupportPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { user } = useAuth()
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [contact, setContact] = useState<{ whatsappNumber: string; supportEmail: string } | null>(null)
  const [reports, setReports] = useState<SupportReport[]>([])

  useEffect(() => {
    fetchAppSettings().then((s) => setContact({ whatsappNumber: s.whatsappNumber, supportEmail: s.supportEmail }))
  }, [])

  useEffect(() => {
    if (!user) return
    const reportsQuery = query(collection(db, 'reports'), where('reporterId', '==', user.uid))
    return onSnapshot(reportsQuery, (snapshot) => {
      setReports(snapshot.docs.map((item) => {
        const data = item.data()
        return {
          id: item.id,
          reporterId: data.reporterId ?? '',
          message: data.message ?? '',
          status: data.status ?? 'pending',
          adminReply: data.adminReply ?? '',
          repliedAt: data.repliedAt?.toDate?.(),
          createdAt: data.createdAt?.toDate?.() ?? new Date(),
        }
      }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()))
    })
  }, [user])

  async function handleSend() {
    if (!message.trim() || !user) return
    setSending(true)
    try {
      await addDoc(collection(db, 'reports'), {
        reporterId: user.uid,
        message: message.trim(),
        status: 'pending',
        createdAt: Timestamp.now(),
      })
      setSent(true)
      setMessage('')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg">
      <header className="flex items-center gap-3 border-b border-border bg-card px-4 py-4">
        <button onClick={() => navigate(-1)} className="text-xl">
          ←
        </button>
        <h1 className="text-lg font-bold text-text-primary">{t('support.title')}</h1>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6">
        {contact && (contact.whatsappNumber || contact.supportEmail) && (
          <div className="mb-6 rounded-2xl border border-border bg-card p-4">
            <p className="mb-2 font-semibold text-text-primary">{t('support.directContact')}</p>
            {contact.whatsappNumber && <p className="text-text-secondary">💬 {contact.whatsappNumber}</p>}
            {contact.supportEmail && <p className="text-text-secondary">✉️ {contact.supportEmail}</p>}
          </div>
        )}

        <p className="mb-2 font-semibold text-text-primary">{t('support.orSendComplaint')}</p>
        {sent ? (
          <div className="rounded-2xl border border-success/40 bg-success/5 p-4 text-center">
            <p className="mb-2 text-2xl">✅</p>
            <p className="font-semibold text-text-primary">{t('support.messageSentTitle')}</p>
            <p className="text-sm text-text-secondary">{t('support.messageSentSubtitle')}</p>
          </div>
        ) : (
          <>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t('support.messagePlaceholder')}
              rows={5}
              className="mb-4 w-full rounded-xl border-2 border-border p-3 focus:border-primary focus:outline-none"
            />
            <Button onClick={handleSend} loading={sending} disabled={!message.trim()}>
              {t('support.send')}
            </Button>
          </>
        )}

        {reports.length > 0 && <section className="mt-8">
          <h2 className="mb-3 text-lg font-bold text-text-primary">بلاغاتي ورد الإدارة</h2>
          <div className="grid gap-3">
            {reports.map((report) => <article key={report.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-xs text-text-secondary">{report.createdAt.toLocaleString('ar-EG')}</span>
                <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">{report.status === 'pending' ? 'بانتظار الرد' : report.status === 'in_progress' ? 'قيد المراجعة' : report.status === 'resolved' ? 'تم الحل' : 'مغلق'}</span>
              </div>
              <p className="whitespace-pre-wrap text-sm text-text-secondary">{report.message}</p>
              {report.adminReply && <div className="mt-3 rounded-xl border border-primary/20 bg-primary/5 p-3"><p className="mb-1 text-xs font-bold text-primary">رد الإدارة</p><p className="whitespace-pre-wrap text-text-primary">{report.adminReply}</p></div>}
            </article>)}
          </div>
        </section>}
      </main>
    </div>
  )
}
