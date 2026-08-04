import * as firestoreV2 from "firebase-functions/v2/firestore";
import { db, COLLECTIONS, notifyUser } from "./utils";

/**
 * أول ما حجز جديد يتعمل -> إشعار فوري للسائق.
 * ده بديل الكود اللي كان في تطبيق الراكب نفسه في Phase 6 (غير موثوق
 * لو التطبيق قفل قبل ما يخلّص الكتابة). دلوقتي مضمون 100% من السيرفر.
 */
export const onBookingCreated = firestoreV2.onDocumentCreated(
  `${COLLECTIONS.bookings}/{bookingId}`,
  async (event) => {
    const booking = event.data?.data();
    if (!booking) return;

    const tripSnap = await db.collection(COLLECTIONS.trips).doc(booking.tripId).get();
    const trip = tripSnap.data();
    const routeText = trip ? `${trip.originCity} → ${trip.destinationCity}` : "";

    await notifyUser({
      userId: booking.driverId,
      type: "newBookingRequest",
      title: "طلب حجز جديد",
      body: `${booking.seatsBooked} مقاعد على رحلة ${routeText}`,
      relatedId: booking.tripId,
    });
  }
);

/**
 * أول ما حالة الحجز تتغيّر (قبول/رفض) -> إشعار فوري للراكب.
 */
export const onBookingStatusChanged = firestoreV2.onDocumentUpdated(
  `${COLLECTIONS.bookings}/{bookingId}`,
  async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    if (!before || !after) return;
    if (before.status === after.status) return; // مفيش تغيير فعلي في الحالة

    if (after.status === "confirmed") {
      await notifyUser({
        userId: after.passengerId,
        type: "bookingAccepted",
        title: "تم قبول حجزك ✅",
        body: "السائق وافق على حجزك، جهّز نفسك للرحلة",
        relatedId: after.tripId,
      });
    } else if (after.status === "rejected") {
      await notifyUser({
        userId: after.passengerId,
        type: "bookingRejected",
        title: "للأسف تم رفض حجزك",
        body:
          after.paymentStatus === "refunded"
            ? "اتقفل الطلب وترجعلك فلوسك في المحفظة فورًا"
            : "اتقفل الطلب، جرّب رحلة تانية",
        relatedId: after.tripId,
      });
    }
  }
);

/**
 * رسالة شات جديدة -> إشعار فوري للطرف التاني في المحادثة (مش لنفس المُرسل).
 */
export const onNewChatMessage = firestoreV2.onDocumentCreated(
  `${COLLECTIONS.chats}/{chatId}/${COLLECTIONS.messages}/{messageId}`,
  async (event) => {
    const message = event.data?.data();
    const chatId = event.params.chatId;
    if (!message) return;

    const chatSnap = await db.collection(COLLECTIONS.chats).doc(chatId).get();
    const chat = chatSnap.data();
    if (!chat) return;

    const recipientId =
      message.senderId === chat.passengerId ? chat.driverId : chat.passengerId;

    const preview =
      message.type === "text"
        ? message.content
        : message.type === "image"
          ? "📷 صورة"
          : "📍 موقع";

    await notifyUser({
      userId: recipientId,
      type: "newMessage",
      title: "رسالة جديدة",
      body: preview,
      relatedId: chatId,
    });
  }
);
