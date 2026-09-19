import { test, before, after, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { initializeApp, deleteApp } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing'
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { createService } from '../src/service.js'

if (!process.env.FIRESTORE_EMULATOR_HOST) throw new Error('Tests require the Firestore emulator; never use production.')
const projectId = 'demo-mosafer'
const app = initializeApp({ projectId })
const db = getFirestore(app)
let clock = Date.now()
const service = createService(db, () => clock)
let env
const ts = (delta = 0) => Timestamp.fromMillis(clock + delta)
const user = (role = 'passenger') => ({ role, status: 'active', fullName: role, phone: '01000000000', email: 'private@example.test', gender: 'male', totalTrips: 0, avgRating: 0 })
const request = () => ({ passengerId: 'p', country: 'egypt', originCity: 'القاهرة', destinationCity: 'الإسكندرية',
  originLat: 30, originLng: 31, destinationLat: 31, destinationLng: 30, seatsNeeded: 2,
  travelDate: new Date(clock + 86400000).toISOString().slice(0, 10), status: 'active', expiresAt: ts(2 * 86400000), createdAt: ts() })
const trip = (seats = 2) => ({ driverId: 'd', status: 'active', country: 'egypt', originCity: 'القاهرة', destinationCity: 'الإسكندرية',
  totalSeats: seats, availableSeats: seats, pricePerSeat: 100, departureTime: ts(86400000), isWomenOnly: false })
const offerInput = () => ({ requestId: 'r', departureTime: '12:00', departureAt: clock + 86400000, pricePerSeat: 100, seatsOffered: 2 })
const bookingInput = () => ({ tripId: 't', seatsBooked: 1, paymentMethod: 'cash', pickupLat: 30, pickupLng: 31 })
const client = uid => env.authenticatedContext(uid).firestore()

before(async () => { env = await initializeTestEnvironment({ projectId, firestore: { rules: readFileSync(new URL('../../firestore.rules', import.meta.url), 'utf8') } }) })
after(async () => { await env.cleanup(); await db.terminate(); await deleteApp(app) })
beforeEach(async () => {
  await env.clearFirestore()
  clock = Date.now()
  await Promise.all(['p', 'p2', 'stranger'].map(uid => db.doc(`users/${uid}`).set(user())))
  await Promise.all(['d', 'd2'].map(async uid => {
    await db.doc(`users/${uid}`).set(user('driver'))
    await db.doc(`drivers/${uid}`).set({ verificationStatus: 'approved', vehicle: { model: 'Car', seats: 4 } })
  }))
  await db.doc('users/admin').set(user('admin'))
  await db.doc('tripRequests/r').set(request())
  await db.doc('trips/t').set(trip())
})

test('accepting an offer creates one confirmed booking and trip, rejects competitors and retries safely', async () => {
  const a = await service.sendOffer('d', offerInput())
  const b = await service.sendOffer('d2', offerInput())
  const accepted = await service.respondOffer('p', { offerId: a.offerId, accept: true })
  assert.deepEqual(await service.respondOffer('p', { offerId: a.offerId, accept: true }), accepted)
  const booking = (await db.doc(`bookings/${accepted.bookingId}`).get()).data()
  assert.equal(booking.status, 'confirmed'); assert.equal(booking.totalPrice, 200)
  assert.equal(booking.startPin, undefined)
  assert.equal((await db.doc(`trips/${accepted.tripId}`).get()).data().availableSeats, 0)
  assert.equal((await db.doc(`tripOffers/${b.offerId}`).get()).data().status, 'rejected')
  assert.equal((await db.collection('bookings').get()).size, 1)
  assert.equal((await db.doc('tripRequests/r').get()).data().acceptedOfferId, a.offerId)
  assert.equal((await db.collection('users/d/notifications').get()).size, 1)
  assert.equal((await db.collection('users/p/notifications').get()).size, 3)
})

test('concurrent acceptance of competing offers has only one winner', async () => {
  const a = await service.sendOffer('d', offerInput()); const b = await service.sendOffer('d2', offerInput())
  const results = await Promise.allSettled([a, b].map(x => service.respondOffer('p', { offerId: x.offerId, accept: true })))
  assert.equal(results.filter(x => x.status === 'fulfilled').length, 1)
  assert.equal((await db.collection('bookings').get()).size, 1)
})

test('unauthorized, cancelled, expired, short-seat, duplicate and unapproved offers are rejected', async () => {
  await assert.rejects(service.sendOffer('d', { ...offerInput(), seatsOffered: 1 }))
  await assert.rejects(service.sendOffer('p2', offerInput()))
  const a = await service.sendOffer('d', offerInput())
  await assert.rejects(service.sendOffer('d', offerInput()))
  await assert.rejects(service.respondOffer('p2', { offerId: a.offerId, accept: true }))
  await db.doc('tripRequests/r').update({ status: 'cancelled' })
  await assert.rejects(service.respondOffer('p', { offerId: a.offerId, accept: true }))
  await db.doc('tripRequests/r').update({ status: 'active', expiresAt: ts(-1) })
  await assert.rejects(service.respondOffer('p', { offerId: a.offerId, accept: true }))
  await db.doc('tripRequests/r').update({ expiresAt: ts(86400000) })
  await db.doc('users/d').update({ status: 'banned' })
  await assert.rejects(service.respondOffer('p', { offerId: a.offerId, accept: true }))
})

test('last-seat bookings and retries cannot oversell', async () => {
  await db.doc('trips/t').set(trip(1))
  const results = await Promise.allSettled(['p', 'p2'].map(uid => service.book(uid, bookingInput())))
  assert.equal(results.filter(r => r.status === 'fulfilled').length, 1)
  const winner = results[0].status === 'fulfilled' ? 'p' : 'p2'
  const result = await service.book(winner, bookingInput())
  assert.equal((await db.collection('bookings').get()).size, 1)
  assert.equal((await db.doc('trips/t').get()).data().availableSeats, 0)
  await service.respondBooking('d', { bookingId: result.bookingId, accept: false })
  await service.respondBooking('d', { bookingId: result.bookingId, accept: false })
  assert.equal((await db.doc('trips/t').get()).data().availableSeats, 1)
})

test('booking validates account, time, gender, ownership and seat quantities', async () => {
  await assert.rejects(service.book('p', { ...bookingInput(), seatsBooked: -1 }))
  await assert.rejects(service.book('d', bookingInput()))
  await db.doc('trips/t').update({ isWomenOnly: true })
  await assert.rejects(service.book('p', bookingInput()))
  await db.doc('trips/t').update({ isWomenOnly: false, departureTime: ts(-1) })
  await assert.rejects(service.book('p', bookingInput()))
})

test('PIN is hidden from driver and rate limited; full trip lifecycle increments statistics once', async () => {
  const { bookingId } = await service.book('p', bookingInput())
  await service.respondBooking('d', { bookingId, accept: true })
  await assertFails(getDoc(doc(client('d'), 'bookingPins', bookingId)))
  await assertSucceeds(getDoc(doc(client('p'), 'bookingPins', bookingId)))
  await assertFails(updateDoc(doc(client('d'), 'bookings', bookingId), { pinVerified: true }))
  await service.changeTripStatus('d', { tripId: 't', status: 'driver_arriving' })
  await assert.rejects(service.changeTripStatus('d', { tripId: 't', status: 'in_progress' }))
  const pin = (await db.doc(`bookingPins/${bookingId}`).get()).data().pin
  for (let i = 0; i < 5; i++) assert.equal((await service.verifyPin('d', { bookingId, pin: '0000' })).verified, false)
  await assert.rejects(service.verifyPin('d', { bookingId, pin }), e => e.code === 'resource-exhausted')
  clock += 16 * 60000
  assert.equal((await service.verifyPin('d', { bookingId, pin })).verified, true)
  await service.changeTripStatus('d', { tripId: 't', status: 'in_progress' })
  await assert.rejects(service.cancelBooking('p', { bookingId }))
  await service.changeTripStatus('d', { tripId: 't', status: 'completed' })
  await service.changeTripStatus('d', { tripId: 't', status: 'completed' })
  assert.equal((await db.doc('users/d').get()).data().totalTrips, 1)
  assert.equal((await db.doc('users/p').get()).data().totalTrips, 1)
})

test('ratings require completed bookings and prevent duplicates and forged recipients', async () => {
  const { bookingId } = await service.book('p', bookingInput())
  await assert.rejects(service.rate('p', { bookingId, stars: 5 }))
  await db.doc(`bookings/${bookingId}`).update({ status: 'completed' })
  await assert.rejects(service.rate('stranger', { bookingId, stars: 5 }))
  await service.rate('p', { bookingId, stars: 4, toUserId: 'stranger' })
  await assert.rejects(service.rate('p', { bookingId, stars: 5 }))
  assert.equal((await db.doc('users/d').get()).data().avgRating, 4)
  assert.equal((await db.doc('users/stranger').get()).data().avgRating, 0)
  await assertFails(setDoc(doc(client('p'), 'ratings', 'fake'), { stars: 5, fromUserId: 'p' }))
})

test('profiles and locations are private; contacts are released only to confirmed participants', async () => {
  await assertFails(getDoc(doc(client('stranger'), 'users', 'p')))
  assert.equal((await service.profile('stranger', { userId: 'p' })).profile.phone, '')
  const { bookingId } = await service.book('p', bookingInput())
  await service.respondBooking('d', { bookingId, accept: true })
  assert.equal((await service.profile('d', { userId: 'p', bookingId })).profile.phone, '01000000000')
  assert.equal((await service.profile('stranger', { userId: 'p', bookingId })).profile.phone, '')
  await db.doc('tripLocations/t').set({ driverLiveLat: 30, driverLiveLng: 31, driverLiveUpdatedAt: ts() })
  await assertFails(getDoc(doc(client('stranger'), 'tripLocations', 't')))
  await assertSucceeds(getDoc(doc(client('p'), 'tripLocations', 't')))
  await service.cancelBooking('p', { bookingId })
  await assertFails(getDoc(doc(client('p'), 'tripLocations', 't')))
  assert.equal((await service.profile('d', { userId: 'p', bookingId })).profile.phone, '')
})

test('driver resubmission works after rejection without self-approval', async () => {
  await db.doc('drivers/d').update({ verificationStatus: 'rejected', rejectionReason: 'صورة غير واضحة' })
  await assertSucceeds(setDoc(doc(client('d'), 'drivers', 'd'), { verificationStatus: 'pending', rejectionReason: null, licenseImageUrl: 'new' }, { merge: true }))
  await assertFails(updateDoc(doc(client('d'), 'drivers', 'd'), { verificationStatus: 'approved' }))
})

test('clients cannot forge bookings, acceptance, public live positions or seat changes', async () => {
  await assertFails(setDoc(doc(client('p'), 'bookings', 'fake'), { passengerId: 'p', driverId: 'd', tripId: 't', status: 'confirmed' }))
  await assertFails(updateDoc(doc(client('p'), 'trips', 't'), { availableSeats: 50 }))
  await assertFails(updateDoc(doc(client('d'), 'trips', 't'), { driverLiveLat: 30, driverLiveLng: 31 }))
  await assertFails(updateDoc(doc(client('p'), 'tripRequests', 'r'), { status: 'matched' }))
  const { offerId } = await service.sendOffer('d', offerInput())
  await assertFails(updateDoc(doc(client('p'), 'tripOffers', offerId), { status: 'accepted' }))
  await assertSucceeds(getDocs(query(collection(client('p'), 'tripOffers'), where('requestId', '==', 'r'), where('passengerId', '==', 'p'))))
})

test('driver can list their own trips and admin can list wallet requests', async () => {
  await assertSucceeds(getDocs(query(collection(client('d'), 'trips'), where('driverId', '==', 'd'))))
  await assertSucceeds(getDoc(doc(client('admin'), 'users', 'p')))
})

test('rejected offer does not create a trip; cancelled request cannot be accepted concurrently', async () => {
  const { offerId } = await service.sendOffer('d', offerInput())
  await service.respondOffer('p', { offerId, accept: false })
  assert.equal((await db.collection('bookings').get()).size, 0)
  assert.equal((await db.doc('tripRequests/r').get()).data().status, 'active')
  const second = await service.sendOffer('d2', offerInput())
  await service.cancelRequest('p', { requestId: 'r' })
  assert.equal((await db.doc(`tripOffers/${second.offerId}`).get()).data().status, 'rejected')
  await assert.rejects(service.respondOffer('p', { offerId: second.offerId, accept: true }))
})

test('public profile is sanitized and trusted trip deletion preserves booking history', async () => {
  const result = await service.profile(null, { userId: 'p' })
  assert.equal(result.profile.phone, ''); assert.equal(result.profile.email, '')
  assert.equal(result.profile.favoriteTrips, undefined)
  await assert.rejects(service.deleteTrip('p', { tripId: 't' }))
  await service.book('p', bookingInput())
  await assert.rejects(service.deleteTrip('admin', { tripId: 't' }))
  await db.doc('trips/empty').set(trip())
  await service.deleteTrip('admin', { tripId: 'empty' })
  assert.equal((await db.doc('trips/empty').get()).exists, false)
})

test('suspended drivers cannot write locations or offers; registration cannot inject ratings', async () => {
  await db.doc('users/d').update({ status: 'suspended' })
  await assertFails(setDoc(doc(client('d'), 'tripLocations', 't'), { driverLiveLat: 30, driverLiveLng: 31, driverLiveUpdatedAt: new Date() }))
  await assert.rejects(service.sendOffer('d', offerInput()))
  const u = { ...user(), isPhoneVerified: false, isEmailVerified: false, trustScore: 0, language: 'ar', favoriteTrips: [], referralCode: 'ABCDEFGH', referredByUid: null, createdAt: new Date() }
  await assertFails(setDoc(doc(client('new'), 'users', 'new'), { ...u, ratingCount: 1, ratingSum: 5 }))
  await assertSucceeds(setDoc(doc(client('new'), 'users', 'new'), u))
  await assertSucceeds(setDoc(doc(client('new'), 'wallets', 'new'), { balance: 0, currency: 'EGP', createdAt: new Date() }))
})

test('migration dry run is read-only, application removes exposed data and reruns preserve private PINs', async () => {
  const { execFile } = await import('node:child_process')
  const { promisify } = await import('node:util')
  const execute = promisify(execFile)
  const script = new URL('../scripts/migrate.js', import.meta.url).pathname
  await db.doc('bookings/legacy').set({ ...bookingInput(), driverId: 'd', passengerId: 'p', status: 'confirmed', startPin: '1234' })
  await db.doc('trips/t').update({ driverLiveLat: 30, driverLiveLng: 31 })
  await execute(process.execPath, [script, '--project=demo-mosafer'])
  assert.equal((await db.doc('bookings/legacy').get()).data().startPin, '1234')
  await execute(process.execPath, [script, '--project=demo-mosafer', '--apply'])
  assert.equal((await db.doc('bookings/legacy').get()).data().startPin, undefined)
  assert.equal((await db.doc('trips/t').get()).data().driverLiveLat, undefined)
  assert.equal((await db.doc('trips/t/members/p').get()).exists, true)
  const pin = (await db.doc('bookingPins/legacy').get()).data().pin
  await execute(process.execPath, [script, '--project=demo-mosafer', '--apply'])
  assert.equal((await db.doc('bookingPins/legacy').get()).data().pin, pin)
})
