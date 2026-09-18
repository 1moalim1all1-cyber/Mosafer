import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/useAuth'
import { sendTripOffer } from '../lib/tripOffers'
import { subscribeDriverStatus } from '../lib/driverActions'
import type { TripRequest } from '../types/tripRequest'
import { Button } from './ui/Button'
import { Input } from './ui/Input'

export function SendOfferModal({ request, onClose }: { request: TripRequest; onClose: () => void }) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [driverStatus, setDriverStatus] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user?.uid) return
    return subscribeDriverStatus(user.uid, setDriverStatus)
  }, [user?.uid])

  const [departureTime, setDepartureTime] = useState(request.preferredTime ?? '')
  const [price, setPrice] = useState('')
  const [seats, setSeats] = useState(String(request.seatsNeeded))
  const [pickupPoint, setPickupPoint] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSend() {
    if (!user || !departureTime || !price || driverStatus !== 'approved') return
    setError('')
    setLoading(true)
    try {
      await sendTripOffer({
        requestId: request.id,
        passengerId: request.passengerId,
        driverName: user.fullName,
        departureTime,
        pricePerSeat: Number(price),
        seatsOffered: Number(seats),
        pickupPoint: pickupPoint || undefined,
        message: message || undefined,
      })
      setSent(true)
    } catch (cause) {
      console.error('Failed to send trip offer:', cause)
      const code = typeof cause === 'object' && cause !== null && 'code' in cause ? String(cause.code) : ''
      const message = cause instanceof Error ? cause.message : ''
      setError(code === 'permission-denied'
        ? 'رفض Firebase إرسال العرض. تأكد إن حسابك سائق معتمد من الإدارة وإن قواعد Firestore منشورة.'
        : message || `${t('community.errorOffer')}${code ? ` (${code})` : ''}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center" onClick={onClose}>
      <div className="w-full max-w-sm rounded-t-3xl bg-card p-6 sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
        {sent ? (
          <div className="py-4 text-center">
            <div className="mb-2 text-4xl">✅</div>
            <p className="mb-4 font-semibold text-text-primary">{t('community.offerSent')}</p>
            <Button onClick={onClose}>{t('wallet.ok')}</Button>
          </div>
        ) : (
          <>
            <h3 className="mb-4 text-lg font-bold text-text-primary">{t('community.sendOfferTitle')}</h3>
            <div className="flex flex-col gap-3">
              <Input label={t('driver.time')} type="time" value={departureTime} onChange={(e) => setDepartureTime(e.target.value)} />
              <Input label={t('community.pricePerSeatShort')} type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
              <Input
                label={t('driver.availableSeatsCount')}
                type="number"
                min={1}
                value={seats}
                onChange={(e) => setSeats(e.target.value)}
              />
              <Input
                label={t('community.pickupPointOptional')}
                value={pickupPoint}
                onChange={(e) => setPickupPoint(e.target.value)}
              />
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-text-primary">{t('community.shortMessageOptional')}</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={2}
                  className="w-full rounded-xl border-2 border-border bg-bg px-4 py-3 focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            {driverStatus && driverStatus !== 'approved' && (
              <div className="mt-4 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-text-primary">
                {driverStatus === 'pending'
                  ? 'مستندات السائق قيد مراجعة الإدارة. تقدر تبعت عرض بعد اعتماد الحساب.'
                  : 'لازم تستكمل مستندات السائق وتنتظر اعتماد الإدارة قبل إرسال عرض.'}
                {driverStatus !== 'pending' && (
                  <button type="button" className="mt-2 block font-semibold text-primary underline" onClick={() => navigate('/driver/documents')}>
                    استكمال مستندات السائق
                  </button>
                )}
              </div>
            )}
            {error && <p role="alert" className="mt-3 rounded-xl bg-red-500/10 p-3 text-sm text-red-500">{error}</p>}

            <div className="mt-5 flex gap-3">
              <Button variant="secondary" onClick={onClose}>
                {t('wallet.cancel')}
              </Button>
              <Button onClick={handleSend} loading={loading} disabled={driverStatus !== 'approved' || !departureTime || !price || !Number.isFinite(Number(price)) || Number(price) <= 0 || !Number.isInteger(Number(seats)) || Number(seats) < 1}>
                {t('community.sendOffer')}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
