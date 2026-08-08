import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'
import { subscribeDriverStatus } from '../lib/driverActions'
import { Button } from '../components/ui/Button'

export default function DriverPendingApprovalPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [status, setStatus] = useState<string | null>(null)
  const [reason, setReason] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (!user) return
    return subscribeDriverStatus(user.uid, (s, r) => {
      setStatus(s)
      setReason(r)
    })
  }, [user])

  if (status === 'approved') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="text-5xl">🎉</div>
        <h1 className="text-2xl font-bold text-text-primary">تم اعتماد حسابك</h1>
        <p className="text-text-secondary">تقدر دلوقتي تنشر رحلاتك وتبدأ تكسب</p>
        <Button onClick={() => navigate('/driver')} fullWidth={false}>
          الذهاب للوحة السائق
        </Button>
      </div>
    )
  }

  if (status === 'rejected') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="text-5xl">❌</div>
        <h1 className="text-2xl font-bold text-text-primary">للأسف مستنداتك اتراجعت</h1>
        {reason && <p className="text-text-secondary">{reason}</p>}
        <Button onClick={() => navigate('/driver/documents')} fullWidth={false}>
          إعادة رفع المستندات
        </Button>
      </div>
    )
  }

  if (status === 'notSubmitted') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-text-secondary">لسه ما رفعتش مستنداتك</p>
        <Button onClick={() => navigate('/driver/documents')} fullWidth={false}>
          رفع المستندات دلوقتي
        </Button>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <span className="h-10 w-10 animate-spin rounded-full border-4 border-warning border-t-transparent" />
      <h1 className="text-xl font-bold text-text-primary">مستنداتك تحت المراجعة</h1>
      <p className="text-text-secondary">فريق مسافر بيراجع مستنداتك، عادةً بتاخد أقل من 24 ساعة</p>
    </div>
  )
}
