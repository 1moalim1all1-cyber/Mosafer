import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { addDoc, collection, Timestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { fetchAppSettings } from '../lib/admin'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/Button'

export default function SupportPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [contact, setContact] = useState<{ whatsappNumber: string; supportEmail: string } | null>(null)

  useEffect(() => {
    fetchAppSettings().then((s) => setContact({ whatsappNumber: s.whatsappNumber, supportEmail: s.supportEmail }))
  }, [])

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
        <h1 className="text-lg font-bold text-text-primary">الدعم والشكاوى</h1>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6">
        {contact && (contact.whatsappNumber || contact.supportEmail) && (
          <div className="mb-6 rounded-2xl border border-border bg-card p-4">
            <p className="mb-2 font-semibold text-text-primary">تواصل مباشر</p>
            {contact.whatsappNumber && <p className="text-text-secondary">💬 {contact.whatsappNumber}</p>}
            {contact.supportEmail && <p className="text-text-secondary">✉️ {contact.supportEmail}</p>}
          </div>
        )}

        <p className="mb-2 font-semibold text-text-primary">أو ابعتلنا شكوى/اقتراح</p>
        {sent ? (
          <div className="rounded-2xl border border-success/40 bg-success/5 p-4 text-center">
            <p className="mb-2 text-2xl">✅</p>
            <p className="font-semibold text-text-primary">تم إرسال رسالتك</p>
            <p className="text-sm text-text-secondary">هنرد عليك في أقرب وقت</p>
          </div>
        ) : (
          <>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="اكتب مشكلتك أو اقتراحك هنا..."
              rows={5}
              className="mb-4 w-full rounded-xl border-2 border-border p-3 focus:border-primary focus:outline-none"
            />
            <Button onClick={handleSend} loading={sending} disabled={!message.trim()}>
              إرسال
            </Button>
          </>
        )}
      </main>
    </div>
  )
}
