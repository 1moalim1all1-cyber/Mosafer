import { initializeApp } from 'firebase-admin/app'
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore'
import { randomInt } from 'node:crypto'
import { tripTime } from '../src/tripTime.js'

const project = process.argv.find(x => x.startsWith('--project='))?.slice(10)
const apply = process.argv.includes('--apply')
if (!project) throw new Error('Specify --project=YOUR_PROJECT. Default is dry run; --apply writes changes.')
initializeApp({ projectId: project })
const db = getFirestore()
const counts = { bookings: 0, trips: 0, requests: 0, offers: 0, legacyAcceptedOffers: 0 }

// Run during a maintenance window after taking a Firestore export. No private
// values or PINs are printed. Each document migration is atomic and repeatable.
for await (const doc of db.collection('bookings').stream()) {
  const b = doc.data()
  counts.bookings++
  if (!apply) continue
  await db.runTransaction(async tx => {
    const current = (await tx.get(doc.ref)).data()
    const pinRef = db.doc(`bookingPins/${doc.id}`)
    const pin = await tx.get(pinRef)
    if (!pin.exists && ['pending', 'confirmed'].includes(current.status)) {
      tx.create(pinRef, { passengerId: b.passengerId, pin: String(randomInt(1000, 10000)), failedAttempts: 0, lockedUntil: null })
    }
    if (current.startPin !== undefined) tx.update(doc.ref, { startPin: FieldValue.delete() })
    if (current.status === 'confirmed') tx.set(db.doc(`trips/${b.tripId}/members/${b.passengerId}`), { bookingId: doc.id })
  })
}
for await (const doc of db.collection('trips').stream()) {
  counts.trips++
  if (apply) await doc.ref.update({ driverLiveLat: FieldValue.delete(), driverLiveLng: FieldValue.delete(), driverLiveUpdatedAt: FieldValue.delete() })
}
for await (const doc of db.collection('tripRequests').stream()) {
  const r = doc.data()
  if (!r.expiresAt) {
    counts.requests++
    const expires = tripTime(r.travelDate, r.preferredTime || '23:59:59', r.country) + (r.preferredTime ? 2 * 3600000 : 0)
    if (apply) await doc.ref.update({ expiresAt: Timestamp.fromMillis(Number.isFinite(expires) ? expires : 0),
      ...(!Number.isFinite(expires) || expires < Date.now() ? (r.status === 'active' ? { status: 'expired' } : {}) : {}) })
  }
}
for await (const doc of db.collection('tripOffers').stream()) {
  const o = doc.data()
  if (o.status === 'accepted' && !o.bookingId) counts.legacyAcceptedOffers++
  if (o.status === 'pending' && !o.departureAt) {
    counts.offers++
    const r = (await db.doc(`tripRequests/${o.requestId}`).get()).data()
    const departure = r ? tripTime(r.travelDate, o.departureTime, r.country) : NaN
    if (apply) await doc.ref.update(Number.isFinite(departure) && departure > Date.now() && r.status === 'active'
      ? { departureAt: Timestamp.fromMillis(departure) }
      : { status: 'rejected', reason: 'expired_before_migration' })
  }
}
console.log(JSON.stringify({ mode: apply ? 'applied' : 'dry-run', project, counts }, null, 2))
if (counts.legacyAcceptedOffers) console.log('Legacy accepted offers without bookings need support review; do not silently rebook them.')
await db.terminate()
