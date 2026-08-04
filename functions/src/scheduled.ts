import * as scheduler from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";
import { db, COLLECTIONS, notifyUser } from "./utils";

/**
 * بتشتغل كل 15 دقيقة، بتدوّر على الرحلات اللي هتقوم خلال الساعة الجاية
 * وبعتتلهاش تذكير قبل كده، وبتبعت تذكير لكل راكب معاه حجز مؤكد عليها.
 */
export const scheduledTripReminder = scheduler.onSchedule(
  { schedule: "every 15 minutes", timeZone: "Africa/Cairo" },
  async () => {
    const now = admin.firestore.Timestamp.now();
    const oneHourLater = admin.firestore.Timestamp.fromMillis(
      now.toMillis() + 60 * 60 * 1000
    );

    const tripsSnap = await db
      .collection(COLLECTIONS.trips)
      .where("status", "==", "active")
      .where("departureTime", ">=", now)
      .where("departureTime", "<=", oneHourLater)
      .get();

    for (const tripDoc of tripsSnap.docs) {
      const trip = tripDoc.data();
      if (trip.reminderSent === true) continue; // اتبعت قبل كده، متتكررش

      const bookingsSnap = await db
        .collection(COLLECTIONS.bookings)
        .where("tripId", "==", tripDoc.id)
        .where("status", "==", "confirmed")
        .get();

      for (const bookingDoc of bookingsSnap.docs) {
        const booking = bookingDoc.data();
        await notifyUser({
          userId: booking.passengerId,
          type: "tripStarted",
          title: "رحلتك هتقوم بعد شوية ⏰",
          body: `رحلتك من ${trip.originCity} لـ ${trip.destinationCity} هتنطلق الساعة`,
          relatedId: tripDoc.id,
        });
      }

      await tripDoc.ref.update({ reminderSent: true });
    }
  }
);
