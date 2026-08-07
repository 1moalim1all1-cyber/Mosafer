import { useState } from 'react'
import { submitRating, type RatingDirection } from '../lib/ratings'
import { Button } from './ui/Button'

interface RatingModalProps {
  tripId: string
  bookingId: string
  fromUserId: string
  toUserId: string
  direction: RatingDirection
  otherPartyName: string
  onClose: () => void
}

export function RatingModal({ tripId, bookingId, fromUserId, toUserId, direction, otherPartyName, onClose }: RatingModalProps) {
  const [stars, setStars] = useState(5)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    setLoading(true)
    try {
      await submitRating({ tripId, bookingId, fromUserId, toUserId, direction, stars, comment: comment || undefined })
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-card p-6">
        <h3 className="mb-4 text-center text-lg font-bold text-text-primary">قيّم {otherPartyName}</h3>
        <div className="mb-4 flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} onClick={() => setStars(n)} className="text-3xl">
              {n <= stars ? '⭐' : '☆'}
            </button>
          ))}
        </div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="تعليق (اختياري)"
          className="mb-4 w-full rounded-xl border-2 border-border p-3 focus:border-primary focus:outline-none"
          rows={2}
        />
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose} fullWidth>
            لاحقًا
          </Button>
          <Button onClick={handleSubmit} loading={loading} fullWidth>
            إرسال
          </Button>
        </div>
      </div>
    </div>
  )
}
