import { tripTime } from './tripTime.js'
import { randomInt } from 'node:crypto'
import { Timestamp, FieldValue } from 'firebase-admin/firestore'

export class ServiceError extends Error {
  constructor(code, message) { super(message); this.code = code }
}
const fail = (message, code = 'failed-precondition') => { throw new ServiceError(code, message) }
const id = (value) => {
  if (typeof value !== 'string' || !value || value.length > 180 || value.includes('/')) fail('معرّف غير صحيح', 'invalid-argument')
  return value
}
const integer = (value, min, max) => Number.isInteger(value) && value >= min && value <= max
const money = (value) => Number.isFinite(value) && value >= 0 && value <= 50000
const round = (value) => Math.round(value * 100) / 100
const millis = (value) => value?.toMillis?.() ?? 0
const coords = (lat, lng) => Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180
const beforeStart = ['active', 'full', 'driver_arriving']

export function createService(db, now = () => Date.now()) {
  const ref = (name, key) => db.collection(name).doc(id(key))
  const stamp = () => Timestamp.fromMillis(now())
  async function account(tx, uid, driver = false) {
    id(uid)
    const snap = await tx.get(ref('users', uid))
    const user = snap.data()
    if (!user || user.status !== 'active') fail('حسابك غير متاح، تواصل مع الدعم', 'permission-denied')
    if (driver) {
      const doc = await tx.get(ref('drivers', uid))
      if (user.role !== 'driver' || doc.data()?.verificationStatus !== 'approved') fail('يلزم اعتماد حساب السائق أولًا', 'permission-denied')
      return { ...user, vehicle: doc.data().vehicle ?? {} }
    }
    return user
  }
  const notification = (tx, uid, key, title, body, relatedId, type = 'booking') => {
    tx.set(ref('users', uid).collection('notifications').doc(key), {
      userId: uid, type, title, body, relatedId, isRead: false, createdAt: stamp(),
    })
  }
  const member = (tripId, uid) => ref('trips', tripId).collection('members').doc(uid)
  const makePin = (tx, bookingId, passengerId) => tx.set(ref('bookingPins', bookingId), {
    passengerId, pin: String(randomInt(1000, 10000)), failedAttempts: 0, lockedUntil: null,
  })
  function bookingData(tripId, passengerId, driverId, seats, price, pickupLat, pickupLng, status = 'pending') {
    return { tripId, passengerId, driverId, seatsBooked: seats, totalPrice: price, originalPrice: price,
      paymentMethod: 'cash', paymentStatus: 'pending', status, pinVerified: false,
      pickupLat: pickupLat ?? null, pickupLng: pickupLng ?? null, createdAt: stamp() }
  }

  async function book(uid, input) {
    const tripId = id(input.tripId)
    if (!integer(input.seatsBooked, 1, 8)) fail('عدد المقاعد من 1 إلى 8', 'invalid-argument')
    if (!coords(input.pickupLat, input.pickupLng)) fail('حدد مكان الركوب', 'invalid-argument')
    if (input.paymentMethod !== 'cash' || input.couponCode?.trim()) fail('المتاح حاليًا هو الدفع النقدي بدون كوبونات')
    const bookingRef = ref('bookings', `${tripId}_${uid}`)
    return db.runTransaction(async tx => {
      const user = await account(tx, uid)
      const tripRef = ref('trips', tripId)
      const tripSnap = await tx.get(tripRef)
      const trip = tripSnap.data()
      if (!trip) fail('الرحلة غير موجودة', 'not-found')
      await account(tx, trip.driverId, true)
      const existing = await tx.get(bookingRef)
      // A retried request never consumes seats twice.
      if (existing.exists && ['pending', 'confirmed'].includes(existing.data().status)) return { bookingId: bookingRef.id, tripId }
      if (existing.exists) fail('لديك حجز سابق لهذه الرحلة؛ اختر رحلة أخرى')
      if (trip.status !== 'active' || millis(trip.departureTime) <= now()) fail('الرحلة لم تعد متاحة للحجز')
      if (trip.driverId === uid || (trip.isWomenOnly && user.gender !== 'female')) fail('لا يمكنك حجز هذه الرحلة', 'permission-denied')
      if (trip.availableSeats < input.seatsBooked) fail('المقاعد المتاحة لا تكفي')
      if (!money(trip.pricePerSeat)) fail('سعر الرحلة غير صحيح')
      const availableSeats = trip.availableSeats - input.seatsBooked
      tx.update(tripRef, { availableSeats, status: availableSeats === 0 ? 'full' : 'active' })
      tx.create(bookingRef, bookingData(tripId, uid, trip.driverId, input.seatsBooked,
        round(trip.pricePerSeat * input.seatsBooked), input.pickupLat, input.pickupLng))
      makePin(tx, bookingRef.id, uid)
      notification(tx, trip.driverId, `new_${bookingRef.id}`, 'طلب حجز جديد', 'راجع طلب الحجز واقبله أو ارفضه.', tripId, 'new_booking')
      return { bookingId: bookingRef.id, tripId }
    })
  }

  async function sendOffer(uid, input) {
    const requestId = id(input.requestId)
    if (!money(input.pricePerSeat) || input.pricePerSeat <= 0 || !integer(input.seatsOffered, 1, 8)) fail('راجع السعر وعدد المقاعد', 'invalid-argument')
    if (typeof input.departureTime !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(input.departureTime)) fail('موعد غير صحيح', 'invalid-argument')
    return db.runTransaction(async tx => {
      const driver = await account(tx, uid, true)
      const request = (await tx.get(ref('tripRequests', requestId))).data()
      const offerRef = ref('tripOffers', `${requestId}_${uid}`)
      const old = await tx.get(offerRef)
      const existingOffers = await tx.get(db.collection('tripOffers').where('requestId', '==', requestId).limit(100))
      if (existingOffers.size >= 100) fail('وصل الطلب للحد الأقصى من العروض')
      if (!request || request.status !== 'active' || millis(request.expiresAt) <= now()) fail('الطلب لم يعد متاحًا')
      await account(tx, request.passengerId)
      if (request.passengerId === uid) fail('لا يمكنك إرسال عرض لنفسك', 'permission-denied')
      if (input.seatsOffered < request.seatsNeeded) fail('العرض لازم يغطي عدد الركاب المطلوب')
      const departureAt = tripTime(request.travelDate, input.departureTime, request.country)
      if (!Number.isFinite(departureAt) || departureAt <= now()) fail('اختار موعدًا في المستقبل', 'invalid-argument')
      if (old.exists) fail('أرسلت عرضًا لهذا الطلب بالفعل', 'already-exists')
      tx.create(offerRef, { requestId, passengerId: request.passengerId, driverId: uid,
        driverName: driver.fullName, departureTime: input.departureTime, departureAt: Timestamp.fromMillis(departureAt),
        pricePerSeat: round(input.pricePerSeat), seatsOffered: input.seatsOffered,
        pickupPoint: String(input.pickupPoint ?? '').slice(0, 200), message: String(input.message ?? '').slice(0, 1000),
        status: 'pending', createdAt: stamp() })
      notification(tx, request.passengerId, `offer_${offerRef.id}`, 'وصلك عرض لطلب الرحلة',
        `${driver.fullName}: ${input.pricePerSeat} للمقعد. راجع العرض واقبله أو ارفضه.`, requestId, 'tripOffer')
      return { offerId: offerRef.id }
    })
  }

  async function respondOffer(uid, { offerId, accept }) {
    id(offerId)
    if (typeof accept !== 'boolean') fail('حدد قبول أو رفض', 'invalid-argument')
    return db.runTransaction(async tx => {
      await account(tx, uid)
      const offerRef = ref('tripOffers', offerId)
      const offer = (await tx.get(offerRef)).data()
      if (!offer || offer.passengerId !== uid) fail('هذا العرض لا يخصك', 'permission-denied')
      const requestRef = ref('tripRequests', offer.requestId)
      const request = (await tx.get(requestRef)).data()
      if (!request || request.passengerId !== uid) fail('الطلب غير موجود', 'not-found')
      if (accept && offer.status === 'accepted' && request.acceptedOfferId === offerId) {
        return { bookingId: offer.bookingId, tripId: offer.tripId }
      }
      if (!accept && offer.status === 'rejected') return { bookingId: null, tripId: null }
      if (offer.status !== 'pending' || request.status !== 'active' || millis(request.expiresAt) <= now()) fail('تم الرد على الطلب أو انتهى موعده')
      if (!accept) {
        tx.update(offerRef, { status: 'rejected', respondedAt: stamp() })
        notification(tx, offer.driverId, `reply_${offerId}`, 'تم رفض العرض', 'الراكب اعتذر عن عرض الرحلة.', offer.requestId, 'tripOfferResponse')
        return { bookingId: null, tripId: null }
      }
      const driver = await account(tx, offer.driverId, true)
      if (millis(offer.departureAt) <= now() || !money(offer.pricePerSeat) || !integer(request.seatsNeeded, 1, 8) || offer.seatsOffered < request.seatsNeeded) fail('العرض لم يعد صالحًا')
      const others = await tx.get(db.collection('tripOffers').where('requestId', '==', offer.requestId))
      if (others.size > 100) fail('الطلب يحتاج مراجعة الدعم لكثرة العروض')
      const tripId = `request_${offer.requestId}`
      const bookingId = `${tripId}_${uid}`
      const tripRef = ref('trips', tripId)
      const bookingRef = ref('bookings', bookingId)
      const tripExists = await tx.get(tripRef)
      const bookingExists = await tx.get(bookingRef)
      if (tripExists.exists || bookingExists.exists) fail('تم إنشاء رحلة لهذا الطلب بالفعل')
      tx.create(tripRef, { driverId: offer.driverId, passengerId: uid, requestId: offer.requestId,
        status: 'full', country: request.country, originCity: request.originCity, destinationCity: request.destinationCity,
        originGovernorate: '', destinationGovernorate: '', originLat: request.originLat ?? 0, originLng: request.originLng ?? 0,
        destinationLat: request.destinationLat ?? 0, destinationLng: request.destinationLng ?? 0,
        departureTime: offer.departureAt, estimatedDurationMinutes: 0, pricePerSeat: offer.pricePerSeat,
        totalSeats: request.seatsNeeded, availableSeats: 0, isReturnEmptyTrip: false, isWomenOnly: false,
        carType: driver.vehicle.type ?? driver.vehicle.model ?? '', createdAt: stamp() })
      tx.create(bookingRef, { ...bookingData(tripId, uid, offer.driverId, request.seatsNeeded,
        round(offer.pricePerSeat * request.seatsNeeded), request.originLat, request.originLng, 'confirmed'),
        requestId: offer.requestId, offerId })
      makePin(tx, bookingId, uid)
      tx.set(member(tripId, uid), { bookingId })
      tx.update(requestRef, { status: 'matched', acceptedOfferId: offerId, tripId, bookingId, matchedAt: stamp() })
      tx.update(offerRef, { status: 'accepted', tripId, bookingId, respondedAt: stamp() })
      for (const other of others.docs) {
        if (other.id !== offerId && other.data().status === 'pending') {
          tx.update(other.ref, { status: 'rejected', reason: 'another_offer_accepted', respondedAt: stamp() })
          notification(tx, other.data().driverId, `reply_${other.id}`, 'تم إغلاق الطلب', 'الراكب اختار عرضًا آخر.', offer.requestId, 'tripOfferResponse')
        }
      }
      notification(tx, offer.driverId, `reply_${offerId}`, 'تم قبول عرضك وتأكيد الرحلة', 'الحجز جاهز في لوحة الرحلات.', tripId, 'new_booking')
      notification(tx, uid, `confirmed_${bookingId}`, 'تم تأكيد حجزك', 'هتلاقي الرحلة وكود الركوب في حجوزاتي.', bookingId, 'booking_accepted')
      return { bookingId, tripId }
    })
  }

  async function cancelRequest(uid, { requestId, expired = false }) {
    return db.runTransaction(async tx => {
      await account(tx, uid)
      const requestRef = ref('tripRequests', requestId)
      const request = (await tx.get(requestRef)).data()
      if (!request || request.passengerId !== uid) fail('الطلب لا يخصك', 'permission-denied')
      const status = expired ? 'expired' : 'cancelled'
      if (request.status === status) return {}
      if (request.status !== 'active') fail('الطلب لم يعد متاحًا للإلغاء؛ راجع الحجز المرتبط به')
      if (expired && millis(request.expiresAt) > now()) fail('موعد الطلب لم ينته بعد')
      const offers = await tx.get(db.collection('tripOffers').where('requestId', '==', requestId))
      if (offers.size > 100) fail('هذا الطلب يحتاج مراجعة الدعم')
      tx.update(requestRef, { status })
      for (const offer of offers.docs) if (offer.data().status === 'pending') {
        tx.update(offer.ref, { status: 'rejected', reason: status, respondedAt: stamp() })
        notification(tx, offer.data().driverId, `reply_${offer.id}`, 'تم إغلاق طلب الرحلة',
          expired ? 'انتهى موعد طلب الرحلة.' : 'الراكب ألغى طلب الرحلة.', requestId, 'tripOfferResponse')
      }
      return {}
    })
  }

  async function respondBooking(uid, { bookingId, accept }) {
    if (typeof accept !== 'boolean') fail('حدد قبول أو رفض', 'invalid-argument')
    return db.runTransaction(async tx => {
      await account(tx, uid, true)
      const bookingRef = ref('bookings', bookingId)
      const b = (await tx.get(bookingRef)).data()
      if (!b || b.driverId !== uid) fail('الحجز لا يخصك', 'permission-denied')
      if (b.status === (accept ? 'confirmed' : 'rejected')) return {}
      if (b.status !== 'pending') fail('تم الرد على الحجز بالفعل')
      const tripRef = ref('trips', b.tripId)
      const trip = (await tx.get(tripRef)).data()
      if (!trip || !beforeStart.includes(trip.status)) fail('الرحلة لم تعد متاحة')
      if (accept) await account(tx, b.passengerId)
      if (!accept && b.paymentStatus === 'paid') fail('الحجز المدفوع القديم يحتاج تسوية من الإدارة')
      tx.update(bookingRef, { status: accept ? 'confirmed' : 'rejected' })
      if (accept) tx.set(member(b.tripId, b.passengerId), { bookingId })
      else {
        const availableSeats = Math.min(trip.totalSeats, trip.availableSeats + b.seatsBooked)
        tx.update(tripRef, { availableSeats, status: trip.status === 'full' ? 'active' : trip.status })
      }
      notification(tx, b.passengerId, `response_${bookingId}`, accept ? 'تم قبول حجزك' : 'تم رفض الحجز',
        accept ? 'حجزك مؤكد. افتح حجوزاتي للتتبع وكود الركوب.' : 'السائق اعتذر عن الحجز.', bookingId, accept ? 'booking_accepted' : 'booking_rejected')
      return {}
    })
  }

  async function cancelBooking(uid, { bookingId }) {
    return db.runTransaction(async tx => {
      await account(tx, uid)
      const bookingRef = ref('bookings', bookingId)
      const b = (await tx.get(bookingRef)).data()
      if (!b || b.passengerId !== uid) fail('الحجز لا يخصك', 'permission-denied')
      if (b.status === 'cancelled') return {}
      if (!['pending', 'confirmed'].includes(b.status)) fail('لا يمكن إلغاء الحجز')
      const tripRef = ref('trips', b.tripId)
      const trip = (await tx.get(tripRef)).data()
      if (!trip || !beforeStart.includes(trip.status)) fail('لا يمكن إلغاء الحجز بعد بدء أو انتهاء الرحلة')
      if (b.paymentStatus === 'paid') fail('الحجز المدفوع القديم يحتاج تسوية من الإدارة')
      tx.update(bookingRef, { status: 'cancelled', passengerLiveLat: null, passengerLiveLng: null })
      tx.delete(member(b.tripId, uid))
      tx.update(tripRef, { availableSeats: Math.min(trip.totalSeats, trip.availableSeats + b.seatsBooked),
        status: b.requestId ? 'cancelled' : trip.status === 'full' ? 'active' : trip.status })
      if (b.requestId) tx.update(ref('tripRequests', b.requestId), { status: 'cancelled' })
      notification(tx, b.driverId, `cancel_${bookingId}`, 'تم إلغاء الحجز', 'الراكب ألغى حجزه.', b.tripId, 'new_booking')
      return {}
    })
  }

  async function verifyPin(uid, { bookingId, pin }) {
    if (!/^\d{4}$/.test(String(pin))) fail('الكود من 4 أرقام', 'invalid-argument')
    return db.runTransaction(async tx => {
      await account(tx, uid, true)
      const bRef = ref('bookings', bookingId)
      const b = (await tx.get(bRef)).data()
      if (!b || b.driverId !== uid || b.status !== 'confirmed') fail('الحجز غير متاح للتحقق', 'permission-denied')
      const trip = (await tx.get(ref('trips', b.tripId))).data()
      if (!trip || !beforeStart.includes(trip.status)) fail('الرحلة غير متاحة للتحقق')
      if (b.pinVerified) return { verified: true }
      const pinRef = ref('bookingPins', bookingId)
      const secret = (await tx.get(pinRef)).data()
      if (!secret) fail('كود الحجز غير متاح؛ تواصل مع الدعم')
      if (millis(secret.lockedUntil) > now()) fail('محاولات كثيرة. انتظر 15 دقيقة', 'resource-exhausted')
      const verified = secret.pin === pin
      const attempts = millis(secret.lockedUntil) && millis(secret.lockedUntil) <= now() ? 0 : secret.failedAttempts ?? 0
      // Return false, not throw, so failed attempts are committed.
      tx.update(pinRef, { failedAttempts: verified ? 0 : attempts + 1,
        lockedUntil: !verified && attempts + 1 >= 5 ? Timestamp.fromMillis(now() + 15 * 60000) : null })
      if (verified) tx.update(bRef, { pinVerified: true })
      return { verified }
    })
  }

  async function changeTripStatus(uid, { tripId, status }) {
    return db.runTransaction(async tx => {
      await account(tx, uid, true)
      const tripRef = ref('trips', tripId)
      const trip = (await tx.get(tripRef)).data()
      if (!trip || trip.driverId !== uid) fail('الرحلة لا تخصك', 'permission-denied')
      if (trip.status === status) return {}
      const transitions = { active: ['driver_arriving', 'cancelled', 'expired'], full: ['driver_arriving', 'cancelled', 'expired'],
        driver_arriving: ['in_progress', 'cancelled'], in_progress: ['completed'] }
      if (!transitions[trip.status]?.includes(status)) fail('تغيير حالة الرحلة غير مسموح')
      const bookings = await tx.get(db.collection('bookings').where('tripId', '==', tripId))
      const active = bookings.docs.filter(d => ['pending', 'confirmed'].includes(d.data().status))
      if (active.length > 100) fail('هذه الرحلة تحتاج مراجعة الإدارة')
      const confirmed = active.filter(d => d.data().status === 'confirmed')
      if (status === 'in_progress' && (!confirmed.length || active.some(d => d.data().status === 'pending') || confirmed.some(d => !d.data().pinVerified))) fail('اقبل أو ارفض الطلبات وتحقق من كود كل راكب قبل بدء الرحلة')
      if (status === 'expired' && (active.length || millis(trip.departureTime) >= now() - 3 * 3600000)) fail('لا يمكن إغلاق رحلة لها حجوزات أو لم ينته موعدها')
      if (status === 'cancelled' && active.some(d => d.data().paymentStatus === 'paid')) fail('تحتاج الحجوزات المدفوعة تسوية من الإدارة')
      tx.update(tripRef, { status, ...(status === 'cancelled' ? { availableSeats: trip.totalSeats } : {}) })
      for (const doc of active) {
        const b = doc.data()
        if (status === 'completed' || status === 'cancelled') {
          tx.update(doc.ref, { status, passengerLiveLat: null, passengerLiveLng: null })
          tx.delete(member(tripId, b.passengerId))
          if (status === 'completed') tx.update(ref('users', b.passengerId), { totalTrips: FieldValue.increment(1) })
        }
        notification(tx, b.passengerId, `trip_${status}_${doc.id}`, status === 'completed' ? 'تم إنهاء الرحلة' : status === 'cancelled' ? 'تم إلغاء الرحلة' : status === 'in_progress' ? 'بدأت الرحلة' : 'السائق في الطريق', 'راجع تفاصيل الرحلة في حجوزاتي.', tripId, 'trip_status')
      }
      if (status === 'completed') {
        tx.update(ref('users', uid), { totalTrips: FieldValue.increment(1) })
        tx.set(ref('stats', 'public'), { completedTripsCount: FieldValue.increment(1) }, { merge: true })
      }
      if (status === 'completed' || status === 'cancelled') {
        tx.delete(ref('tripLocations', tripId))
        if (trip.requestId && status === 'cancelled') tx.update(ref('tripRequests', trip.requestId), { status: 'cancelled' })
      }
      return {}
    })
  }

  async function rate(uid, { bookingId, stars, comment = '' }) {
    if (!integer(stars, 1, 5) || typeof comment !== 'string' || comment.length > 1000) fail('راجع التقييم والتعليق', 'invalid-argument')
    return db.runTransaction(async tx => {
      await account(tx, uid)
      const b = (await tx.get(ref('bookings', bookingId))).data()
      if (!b || b.status !== 'completed' || ![b.passengerId, b.driverId].includes(uid)) fail('التقييم متاح لأطراف رحلة مكتملة فقط', 'permission-denied')
      const ratingRef = ref('ratings', `${bookingId}_${uid}`)
      const existing = await tx.get(ratingRef)
      const legacy = await tx.get(db.collection('ratings').where('bookingId', '==', bookingId).where('fromUserId', '==', uid).limit(1))
      if (existing.exists || !legacy.empty) fail('قيّمت الرحلة دي بالفعل', 'already-exists')
      const toUserId = uid === b.passengerId ? b.driverId : b.passengerId
      const userRef = ref('users', toUserId)
      const recipient = (await tx.get(userRef)).data()
      if (!recipient) fail('الحساب غير موجود')
      let previousCount = recipient.ratingCount
      let previousSum = recipient.ratingSum
      if (!Number.isFinite(previousCount) || !Number.isFinite(previousSum)) {
        const legacyReviews = await tx.get(db.collection('ratings').where('toUserId', '==', toUserId))
        const unique = new Map()
        for (const review of legacyReviews.docs) {
          const r = review.data()
          if (integer(r.stars, 1, 5)) unique.set(`${r.bookingId}_${r.fromUserId}`, r.stars)
        }
        previousCount = unique.size
        previousSum = [...unique.values()].reduce((sum, value) => sum + value, 0)
      }
      const count = previousCount + 1
      const sum = previousSum + stars
      tx.create(ratingRef, { bookingId, tripId: b.tripId, fromUserId: uid, toUserId,
        direction: uid === b.passengerId ? 'passengerToDriver' : 'driverToPassenger', stars,
        comment: comment.trim(), isReported: false, createdAt: stamp() })
      tx.update(userRef, { ratingCount: count, ratingSum: sum, avgRating: sum / count })
      return {}
    })
  }

  async function profile(uid, { userId, bookingId }) {
    id(userId)
    return db.runTransaction(async tx => {
      const caller = uid ? await account(tx, uid) : { role: 'guest' }
      const u = (await tx.get(ref('users', userId))).data()
      if (!u) return { profile: null, driver: null }
      const d = (await tx.get(ref('drivers', userId))).data()
      let contactAllowed = uid === userId || caller.role === 'admin'
      if (bookingId) {
        const b = (await tx.get(ref('bookings', bookingId))).data()
        contactAllowed ||= !!b && b.status === 'confirmed' &&
          ((b.passengerId === uid && b.driverId === userId) || (b.driverId === uid && b.passengerId === userId))
      }
      return { profile: { uid: userId, fullName: u.fullName, role: u.role, profileImageUrl: u.profileImageUrl ?? null,
        avgRating: u.avgRating ?? 0, totalTrips: u.totalTrips ?? 0, trustScore: u.trustScore ?? 0,
        isPhoneVerified: u.isPhoneVerified === true, phone: contactAllowed ? u.phone ?? '' : '',
        email: uid === userId || caller.role === 'admin' ? u.email ?? '' : '' },
      driver: d ? { uid: userId, verificationStatus: d.verificationStatus,
        vehicle: d.verificationStatus === 'approved' ? { make: d.vehicle?.make ?? '', model: d.vehicle?.model ?? '', color: d.vehicle?.color ?? '', seats: d.vehicle?.seats ?? 0 } : null } : null }
    })
  }

  async function deleteTrip(uid, { tripId }) {
    return db.runTransaction(async tx => {
      const caller = await account(tx, uid)
      const tripRef = ref('trips', tripId)
      const trip = (await tx.get(tripRef)).data()
      if (!trip) return {}
      if (caller.role !== 'admin' && trip.driverId !== uid) fail('لا يمكنك حذف الرحلة', 'permission-denied')
      const bookings = await tx.get(db.collection('bookings').where('tripId', '==', tripId).limit(1))
      if (!bookings.empty) fail('لا يمكن حذف رحلة لها حجوزات؛ احتفظ بها في سجل الرحلات')
      tx.delete(tripRef)
      tx.delete(ref('tripLocations', tripId))
      return {}
    })
  }

  async function lookupReferral(uid, { code }) {
    id(uid)
    if (typeof code !== 'string' || !/^[A-Z0-9]{8}$/.test(code)) return { uid: null }
    const snap = await db.collection('users').where('referralCode', '==', code).limit(1).get()
    return { uid: snap.empty ? null : snap.docs[0].id }
  }

  return { book, sendOffer, respondOffer, respondBooking, cancelBooking, verifyPin, changeTripStatus, rate, profile, lookupReferral, deleteTrip, cancelRequest }
}
