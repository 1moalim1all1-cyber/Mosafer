import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Star, ShieldCheck } from 'lucide-react'
import { fetchUserProfile } from '../lib/users'
import { fetchUserReviews } from '../lib/ratings'
import type { AppUser } from '../types/user'

export default function PublicProfilePage() {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const [user, setUser] = useState<AppUser | null | undefined>(undefined)
  const [reviews, setReviews] = useState<{ id: string; stars: number; comment: string }[]>([])

  useEffect(() => {
    if (!userId) return
    fetchUserProfile(userId).then(setUser)
    fetchUserReviews(userId).then(setReviews)
  }, [userId])

  if (user === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (user === null) {
    return <div className="flex min-h-screen items-center justify-center text-text-secondary">{t('track.bookingNotFound')}</div>
  }

  const firstName = user.fullName.split(' ')[0]

  return (
    <div className="min-h-screen bg-bg">
      <header className="flex items-center gap-3 border-b border-border bg-card px-4 py-4">
        <button onClick={() => navigate(-1)} className="text-xl">
          ←
        </button>
        <h1 className="text-lg font-bold text-text-primary">{t('publicProfile.title')}</h1>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-24 w-24 items-center justify-center rounded-full bg-primary-light text-4xl">
            {user.profileImageUrl ? (
              <img src={user.profileImageUrl} className="h-24 w-24 rounded-full object-cover" alt={firstName} />
            ) : (
              '🧑'
            )}
          </div>
          <p className="text-xl font-bold text-text-primary">{firstName}</p>
          {user.role === 'driver' && (
            <span className="mt-1 flex items-center gap-1 text-sm font-semibold text-success">
              <ShieldCheck size={14} /> {t('publicProfile.verifiedDriver')}
            </span>
          )}
        </div>

        <div className="mb-6 grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <p className="flex items-center justify-center gap-1 text-lg font-bold text-text-primary">
              <Star size={16} className="text-warning" fill="currentColor" /> {user.avgRating.toFixed(1)}
            </p>
            <p className="text-xs text-text-secondary">{t('publicProfile.rating')}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <p className="text-lg font-bold text-text-primary">{user.totalTrips}</p>
            <p className="text-xs text-text-secondary">{t('publicProfile.trips')}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <p className="text-sm font-bold text-text-primary">
              {new Intl.DateTimeFormat(i18n.language === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'short' }).format(
                user.createdAt,
              )}
            </p>
            <p className="text-xs text-text-secondary">{t('publicProfile.memberSince')}</p>
          </div>
        </div>

        <h2 className="mb-3 font-bold text-text-primary">{t('publicProfile.reviews')}</h2>
        {reviews.length === 0 && <p className="text-sm text-text-secondary">{t('publicProfile.noReviewsYet')}</p>}
        {reviews.map((r) => (
          <div key={r.id} className="mb-2 rounded-xl border border-border bg-card p-3">
            <div className="mb-1 flex gap-0.5 text-warning">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={12} fill={i < r.stars ? 'currentColor' : 'none'} />
              ))}
            </div>
            <p className="text-sm text-text-secondary">"{r.comment}"</p>
          </div>
        ))}
      </main>
    </div>
  )
}
