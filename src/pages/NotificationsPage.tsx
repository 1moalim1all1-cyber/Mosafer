import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/useAuth'
import { subscribeNotifications, markNotificationRead, markAllNotificationsRead, type AppNotification } from '../lib/notifications'

const TYPE_ICONS: Record<string, string> = {
  bookingAccepted: '✅',
  bookingRejected: '❌',
  newBookingRequest: '💺',
  tripStarted: '🚗',
  tripCompleted: '🏁',
  newMessage: '💬',
  promotion: '🏷️',
  walletUpdate: '👛',
  adminAlert: '📢',
}

export default function NotificationsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [notifications, setNotifications] = useState<AppNotification[]>([])

  useEffect(() => {
    if (!user) return
    return subscribeNotifications(user.uid, setNotifications)
  }, [user])

  return (
    <div className="min-h-screen bg-bg">
      <header className="flex items-center justify-between border-b border-border bg-card px-4 py-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-xl">
            ←
          </button>
          <h1 className="text-lg font-bold text-text-primary">{t('notifications.title')}</h1>
        </div>
        <button
          onClick={() => user && markAllNotificationsRead(user.uid)}
          className="text-sm font-semibold text-primary"
        >
          {t('notifications.markAllRead')}
        </button>
      </header>

      <main className="mx-auto max-w-lg">
        {notifications.length === 0 && <p className="py-12 text-center text-text-secondary">{t('notifications.noNotifications')}</p>}
        {notifications.map((n) => (
          <button
            key={n.id}
            onClick={() => user && !n.isRead && markNotificationRead(user.uid, n.id)}
            className={`flex w-full items-start gap-3 border-b border-border px-4 py-4 text-right ${
              n.isRead ? 'bg-card' : 'bg-primary-light/40'
            }`}
          >
            <span className="text-xl">{TYPE_ICONS[n.type] ?? '🔔'}</span>
            <div className="flex-1">
              <p className={`text-text-primary ${n.isRead ? 'font-normal' : 'font-bold'}`}>{n.title}</p>
              <p className="text-sm text-text-secondary">{n.body}</p>
            </div>
            <span className="whitespace-nowrap text-xs text-text-secondary">
              {new Intl.DateTimeFormat('ar-EG', { day: 'numeric', month: 'short' }).format(n.createdAt)}
            </span>
          </button>
        ))}
      </main>
    </div>
  )
}
