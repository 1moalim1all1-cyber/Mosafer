import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/useAuth'
import { sendTripOffer } from '../lib/tripOffers'
import type { TripRequest } from '../types/tripRequest'
import { Button } from './ui/Button'
import { Input } from './ui/Input'

export function SendOfferModal({ request, onClose }: { request: TripRequest; onClose: () => void }) {
  const { t } = useTranslation()
  const { user } = useAuth()

  const [departureTime, setDepartureTime] = useState(request.preferredTime ?? '')
  const [price, setPrice] = useState('')
  const [seats, setSeats] = useState(String(request.seatsNeeded))
  const [pickupPoint, setPickupPoint] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSend() {
    if (!user || !departureTime || !price) return
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
    } catch {
      alert(t('community.errorOffer'))
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

            <div className="mt-5 flex gap-3">
              <Button variant="secondary" onClick={onClose}>
                {t('wallet.cancel')}
              </Button>
              <Button onClick={handleSend} loading={loading} disabled={!departureTime || !price}>
                {t('community.sendOffer')}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
