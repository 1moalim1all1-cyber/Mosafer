import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Bell, CalendarDays, ExternalLink, X } from 'lucide-react'
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
  admin_broadcast: '📢',
  new_booking: '💺',
  booking_accepted: '✅',
  booking_rejected: '❌',
  trip_status: '🚗',
  chat_message: '💬',
  tripOfferAccepted: '🤝',
  tripOfferResponse: '🚘',
  tripOffer: '🚘',
}

export default function NotificationsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [selectedNotification, setSelectedNotification] = useState<AppNotification | null>(null)

  function notificationDestination(notification: AppNotification): string | null {
    if (!notification.relatedId) return null
    if (notification.type === 'chat_message' || notification.type === 'tripOfferAccepted') return `/chat/${notification.relatedId}`
    if (notification.type === 'tripOffer') return `/community/my-requests?request=${notification.relatedId}`
    if (notification.type === 'tripOfferResponse') return '/driver'
    if (notification.type === 'booking_accepted' || notification.type === 'booking_rejected') return '/my-bookings'
    if (notification.type === 'new_booking') return `/driver/trip/${notification.relatedId}/bookings`
    if (notification.type === 'trip_status') return `/trip/${notification.relatedId}`
    return null
  }

  async function openNotification(notification: AppNotification) {
    setSelectedNotification(notification)
    if (user && !notification.isRead) {
      await markNotificationRead(user.uid, notification.id).catch(() => undefined)
    }
  }

  useEffect(() => {
    if (!user) return
    return subscribeNotifications(user.uid, setNotifications)
  }, [user])

  return (
    <div className="min-h-screen bg-bg">
      <header className="flex items-center justify-between border-b border-border bg-card px-4 py-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-xl border border-border text-text-primary" aria-label="رجوع">
            <ArrowLeft size={20} />
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

      <main className="mx-auto w-full max-w-5xl px-4 py-6">
        {notifications.length === 0 && <p className="py-12 text-center text-text-secondary">{t('notifications.noNotifications')}</p>}
        {notifications.map((n) => (
          <button
            key={n.id}
            onClick={() => openNotification(n)}
            className={`mb-3 flex w-full items-start gap-3 rounded-2xl border border-border px-4 py-4 text-right ${
              n.isRead ? 'bg-card' : 'bg-primary-light/40'
            }`}
          >
            <span className="text-xl">{TYPE_ICONS[n.type] ?? '🔔'}</span>
            <div className="flex-1">
              <p className={`text-text-primary ${n.isRead ? 'font-normal' : 'font-bold'}`}>{n.title}</p>
              <p className="text-sm text-text-secondary">{n.body}</p>
            </div>
            <span className="whitespace-nowrap text-xs text-text-secondary">
              {new Intl.DateTimeFormat('ar-EG', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }).format(n.createdAt)}
            </span>
          </button>
        ))}
      </main>

      {selectedNotification && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/65 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          role="presentation"
          onClick={() => setSelectedNotification(null)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="notification-title"
            className="w-full max-w-lg rounded-t-3xl border border-border bg-card p-5 shadow-2xl sm:rounded-3xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-2xl">
                  {TYPE_ICONS[selectedNotification.type] ?? <Bell size={22} />}
                </span>
                <div>
                  <p className="mb-1 text-xs font-semibold text-primary">تفاصيل الإشعار</p>
                  <h2 id="notification-title" className="text-lg font-bold text-text-primary">{selectedNotification.title}</h2>
                </div>
              </div>
              <button
                onClick={() => setSelectedNotification(null)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border text-text-secondary"
                aria-label="إغلاق"
              >
                <X size={20} />
              </button>
            </div>

            <p className="whitespace-pre-wrap break-words rounded-2xl border border-border bg-bg/60 p-4 leading-7 text-text-primary">
              {selectedNotification.body}
            </p>
            <p className="mt-3 flex items-center gap-2 text-xs text-text-secondary">
              <CalendarDays size={15} />
              {new Intl.DateTimeFormat('ar-EG', { dateStyle: 'long', timeStyle: 'short' }).format(selectedNotification.createdAt)}
            </p>

            <div className="mt-6 flex gap-3">
              {notificationDestination(selectedNotification) && (
                <button
                  onClick={() => {
                    const destination = notificationDestination(selectedNotification)
                    setSelectedNotification(null)
                    if (destination) navigate(destination)
                  }}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-bold text-white transition active:scale-[0.98]"
                >
                  <ExternalLink size={18} />
                  فتح التفاصيل المرتبطة
                </button>
              )}
              <button
                onClick={() => setSelectedNotification(null)}
                className="flex-1 rounded-xl border border-border px-4 py-3 font-bold text-text-primary"
              >
                إغلاق
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
