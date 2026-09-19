import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { onDocumentCreated } from 'firebase-functions/v2/firestore'

export const notifyTripAlerts = onDocumentCreated({ document: 'trips/{tripId}', region: 'us-central1', retry: true }, async event => {
  const trip = event.data?.data()
  if (!trip || trip.status !== 'active') return
  const db = getFirestore()
  // Single-field query avoids requiring an undeployed composite index.
  const alerts = db.collection('tripAlerts').where('country', '==', trip.country)
  for await (const alert of alerts.stream()) {
    const data = alert.data()
    if (data.originCity !== trip.originCity || data.destinationCity !== trip.destinationCity) continue
    await db.runTransaction(async tx => {
      const current = await tx.get(alert.ref)
      if (!current.exists) return
      const passenger = await tx.get(db.doc(`users/${data.userId}`))
      if (passenger.data()?.status !== 'active' || (trip.isWomenOnly && passenger.data()?.gender !== 'female')) return
      tx.set(db.doc(`users/${data.userId}/notifications/alert_${event.params.tripId}_${alert.id}`), {
        userId: data.userId, type: 'tripAlertMatch', title: 'رحلة جديدة على المسار المطلوب',
        body: `${trip.originCity} → ${trip.destinationCity}`, relatedId: event.params.tripId,
        isRead: false, createdAt: Timestamp.now(),
      })
      tx.delete(alert.ref)
    })
  }
})
