import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/useAuth'
import { subscribeDriverStatus } from '../lib/driverActions'
import { Button } from '../components/ui/Button'

export default function DriverPendingApprovalPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()
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
        <h1 className="text-2xl font-bold text-text-primary">{t('driver.approvedTitle')}</h1>
        <p className="text-text-secondary">{t('driver.approvedSubtitle')}</p>
        <Button onClick={() => navigate('/driver')} fullWidth={false}>
          {t('driver.goToDashboard')}
        </Button>
      </div>
    )
  }

  if (status === 'rejected') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="text-5xl">❌</div>
        <h1 className="text-2xl font-bold text-text-primary">{t('driver.rejectedTitle')}</h1>
        {reason && <p className="text-text-secondary">{reason}</p>}
        <Button onClick={() => navigate('/driver/documents')} fullWidth={false}>
          {t('driver.reuploadDocs')}
        </Button>
      </div>
    )
  }

  if (status === 'notSubmitted') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-text-secondary">{t('driver.notSubmittedText')}</p>
        <Button onClick={() => navigate('/driver/documents')} fullWidth={false}>
          {t('driver.uploadNow')}
        </Button>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <span className="h-10 w-10 animate-spin rounded-full border-4 border-warning border-t-transparent" />
      <h1 className="text-xl font-bold text-text-primary">{t('driver.underReviewTitle')}</h1>
      <p className="text-text-secondary">{t('driver.underReviewSubtitle')}</p>
    </div>
  )
}
