import { initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { createService, ServiceError } from './service.js'

initializeApp()
const service = createService(getFirestore())
const callable = (method, publicRead = false) => onCall({ region: 'us-central1', maxInstances: 10 }, async request => {
  if (!request.auth && !publicRead) throw new HttpsError('unauthenticated', 'سجّل الدخول أولًا')
  try { return await service[method](request.auth?.uid ?? null, request.data ?? {}) }
  catch (error) {
    if (error instanceof ServiceError) throw new HttpsError(error.code, error.message)
    console.error(method, error)
    throw new HttpsError('internal', 'تعذر إتمام العملية، حاول مرة أخرى')
  }
})
export const createBooking = callable('book')
export const sendTripOffer = callable('sendOffer')
export const respondToTripOffer = callable('respondOffer')
export const respondToBooking = callable('respondBooking')
export const cancelBooking = callable('cancelBooking')
export const verifyPassengerPin = callable('verifyPin')
export const changeTripStatus = callable('changeTripStatus')
export const submitRating = callable('rate')
export const getUserProfile = callable('profile', true)
export const lookupReferral = callable('lookupReferral')
export const deleteTrip = callable('deleteTrip')

// Matching alerts are processed server-side, since drivers cannot read or delete
// another passenger's saved alerts. A transaction makes event retries harmless.
export { notifyTripAlerts } from './tripAlerts.js'

export const cancelTripRequest = callable('cancelRequest')
