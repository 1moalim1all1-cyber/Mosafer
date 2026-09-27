import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { BellRing, Send } from 'lucide-react'
import { sendNotificationToAllUsers } from '../lib/admin'
import { Button } from '../components/ui/Button'

export default function AdminBroadcastPage() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')
  const [error, setError] = useState('')

  async function submit(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError('')
    setResult('')
    try {
      const count = await sendNotificationToAllUsers(title, body)
      setResult(`تم إرسال الرسالة إلى ${count} مستخدم نشط`)
      setTitle('')
      setBody('')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'تعذر إرسال الرسالة')
    } finally {
      setLoading(false)
    }
  }

  return <div className="min-h-screen bg-bg">
    <header className="flex items-center gap-3 border-b border-border bg-card px-4 py-4">
      <button onClick={() => navigate(-1)} className="text-xl">←</button>
      <h1 className="text-lg font-bold text-text-primary">إرسال رسالة لكل المستخدمين</h1>
    </header>
    <main className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-5 flex items-start gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-4">
        <BellRing className="mt-0.5 shrink-0 text-primary" />
        <p className="text-sm text-text-secondary">الرسالة هتظهر فورًا داخل جرس الإشعارات لكل الحسابات النشطة. راجع النص كويس قبل الإرسال.</p>
      </div>
      <form onSubmit={submit} className="rounded-2xl border border-border bg-card p-5">
        <label className="mb-2 block font-semibold text-text-primary">عنوان الرسالة</label>
        <input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={80} placeholder="مثال: تحديث جديد في مسافر" className="mb-4 w-full rounded-xl border border-border bg-bg p-3 text-text-primary outline-none focus:border-primary" />
        <label className="mb-2 block font-semibold text-text-primary">محتوى الرسالة</label>
        <textarea value={body} onChange={(event) => setBody(event.target.value)} maxLength={500} rows={6} placeholder="اكتب الرسالة اللي هتوصل للمستخدمين" className="mb-2 w-full rounded-xl border border-border bg-bg p-3 text-text-primary outline-none focus:border-primary" />
        <p className="mb-4 text-left text-xs text-text-secondary">{body.length}/500</p>
        {error && <p className="mb-3 text-sm text-danger">{error}</p>}
        {result && <p className="mb-3 rounded-xl bg-success/10 p-3 text-sm font-semibold text-success">✅ {result}</p>}
        <Button type="submit" loading={loading} disabled={!title.trim() || !body.trim()}><Send size={18} /> إرسال للجميع</Button>
      </form>
    </main>
  </div>
}
