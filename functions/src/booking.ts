import * as functions from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { db, COLLECTIONS, COMMISSION } from "./utils";

type PaymentMethod = "cash" | "card" | "wallet";

/**
 * إنشاء حجز - النسخة الآمنة اللي بتشتغل بصلاحيات Admin SDK الكاملة،
 * فمفيش داعي بعد كده إن firestore.rules تسمح للعميل يعدّل availableSeats
 * أو balance مباشرة زي ما كان مضطر يحصل في Phase 4-5.
 */
export const createBooking = functions.onCall(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) {
    throw new functions.HttpsError("unauthenticated", "لازم تسجّل دخول الأول");
  }

  const { tripId, seatsBooked, paymentMethod } = request.data as {
    tripId: string;
    seatsBooked: number;
    paymentMethod: PaymentMethod;
  };

  if (!tripId || !seatsBooked || seatsBooked < 1) {
    throw new functions.HttpsError("invalid-argument", "بيانات الحجز ناقصة");
  }

  const tripRef = db.collection(COLLECTIONS.trips).doc(tripId);
  const bookingRef = db.collection(COLLECTIONS.bookings).doc();
  const walletRef = db.collection(COLLECTIONS.wallets).doc(uid);

  const bookingId = await db.runTransaction(async (tx) => {
    const tripSnap = await tx.get(tripRef);
    if (!tripSnap.exists) {
      throw new functions.HttpsError("not-found", "الرحلة دي مش موجودة");
    }

    const trip = tripSnap.data()!;
    if (trip.status !== "active") {
      throw new functions.HttpsError(
        "failed-precondition",
        "الرحلة دي مش متاحة للحجز حاليًا"
      );
    }
    if (trip.driverId === uid) {
      throw new functions.HttpsError(
        "failed-precondition",
        "مستحيل تحجز في رحلتك إنت"
      );
    }
    if (trip.isWomenOnly) {
      const requesterDoc = await tx.get(db.collection(COLLECTIONS.users).doc(uid));
      if (requesterDoc.data()?.gender !== "female") {
        // نفس قاعدة firestore.rules، بس هنا كطبقة تحقق سيرفر إضافية
        throw new functions.HttpsError(
          "permission-denied",
          "الرحلة دي مخصصة للسيدات فقط"
        );
      }
    }

    const currentAvailable = trip.availableSeats as number;
    if (currentAvailable < seatsBooked) {
      throw new functions.HttpsError(
        "failed-precondition",
        `للأسف متبقاش إلا ${currentAvailable} مقاعد متاحة`
      );
    }

    const totalPrice = (trip.pricePerSeat as number) * seatsBooked;
    let paymentStatus: "pending" | "paid" = "pending";

    if (paymentMethod === "wallet") {
      const walletSnap = await tx.get(walletRef);
      const currentBalance = (walletSnap.data()?.balance ?? 0) as number;

      if (currentBalance < totalPrice) {
        throw new functions.HttpsError(
          "failed-precondition",
          `رصيد محفظتك مش كافي، رصيدك الحالي ${currentBalance.toFixed(0)} ج.م`
        );
      }

      const newBalance = currentBalance - totalPrice;
      tx.update(walletRef, { balance: newBalance });

      const walletTxRef = walletRef.collection(COLLECTIONS.walletTransactions).doc();
      tx.set(walletTxRef, {
        type: "payment",
        amount: totalPrice,
        balanceAfter: newBalance,
        relatedBookingId: bookingRef.id,
        status: "completed",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      paymentStatus = "paid";
    }

    const newAvailable = currentAvailable - seatsBooked;
    tx.update(tripRef, {
      availableSeats: newAvailable,
      status: newAvailable === 0 ? "full" : "active",
    });

    tx.set(bookingRef, {
      tripId,
      passengerId: uid,
      driverId: trip.driverId,
      seatsBooked,
      status: "pending",
      totalPrice,
      paymentMethod,
      paymentStatus,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return bookingRef.id;
  });

  return { bookingId };
});

/**
 * قبول أو رفض السائق لطلب حجز - نفس منطق الاسترداد اللي كان في العميل،
 * بس دلوقتي بصلاحيات سيرفر كاملة ومحمي من أي تلاعب.
 */
export const respondToBooking = functions.onCall(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) {
    throw new functions.HttpsError("unauthenticated", "لازم تسجّل دخول الأول");
  }

  const { bookingId, accept } = request.data as {
    bookingId: string;
    accept: boolean;
  };

  const bookingRef = db.collection(COLLECTIONS.bookings).doc(bookingId);

  await db.runTransaction(async (tx) => {
    const bookingSnap = await tx.get(bookingRef);
    if (!bookingSnap.exists) {
      throw new functions.HttpsError("not-found", "الحجز مش موجود");
    }
    const booking = bookingSnap.data()!;

    if (booking.driverId !== uid) {
      throw new functions.HttpsError(
        "permission-denied",
        "مسموح بس لسائق الرحلة يرد على الحجز ده"
      );
    }
    if (booking.status !== "pending") {
      throw new functions.HttpsError(
        "failed-precondition",
        "تم الرد على الحجز ده بالفعل"
      );
    }

    if (accept) {
      tx.update(bookingRef, { status: "confirmed" });
      return;
    }

    // ---- الرفض: إرجاع المقاعد + استرداد المحفظة لو الدفع كان بيها ----
    const tripRef = db.collection(COLLECTIONS.trips).doc(booking.tripId);
    const tripSnap = await tx.get(tripRef);

    if (tripSnap.exists) {
      const trip = tripSnap.data()!;
      const restored = Math.min(
        trip.totalSeats,
        (trip.availableSeats as number) + (booking.seatsBooked as number)
      );
      tx.update(tripRef, { availableSeats: restored, status: "active" });
    }

    if (booking.paymentMethod === "wallet" && booking.paymentStatus === "paid") {
      const walletRef = db.collection(COLLECTIONS.wallets).doc(booking.passengerId);
      const walletSnap = await tx.get(walletRef);
      const currentBalance = (walletSnap.data()?.balance ?? 0) as number;
      const newBalance = currentBalance + (booking.totalPrice as number);

      tx.update(walletRef, { balance: newBalance });

      const refundTxRef = walletRef.collection(COLLECTIONS.walletTransactions).doc();
      tx.set(refundTxRef, {
        type: "refund",
        amount: booking.totalPrice,
        balanceAfter: newBalance,
        relatedBookingId: bookingId,
        status: "completed",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      tx.update(bookingRef, { status: "rejected", paymentStatus: "refunded" });
    } else {
      tx.update(bookingRef, { status: "rejected" });
    }
  });

  return { success: true };
});

/**
 * الراكب بيلغي حجزه هو بنفسه (قبل ما السائق يرد عليه أو حتى بعد التأكيد).
 * بترجّع المقاعد وتسترد فلوس المحفظة لو الدفع كان بيها، بنفس منطق الرفض.
 */
export const cancelBooking = functions.onCall(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) {
    throw new functions.HttpsError("unauthenticated", "لازم تسجّل دخول الأول");
  }

  const { bookingId } = request.data as { bookingId: string };
  const bookingRef = db.collection(COLLECTIONS.bookings).doc(bookingId);

  await db.runTransaction(async (tx) => {
    const bookingSnap = await tx.get(bookingRef);
    if (!bookingSnap.exists) {
      throw new functions.HttpsError("not-found", "الحجز مش موجود");
    }
    const booking = bookingSnap.data()!;

    if (booking.passengerId !== uid) {
      throw new functions.HttpsError(
        "permission-denied",
        "مسموح بس لصاحب الحجز يلغيه"
      );
    }
    if (booking.status === "cancelled" || booking.status === "completed") {
      throw new functions.HttpsError(
        "failed-precondition",
        "الحجز ده اتقفل بالفعل"
      );
    }

    const tripRef = db.collection(COLLECTIONS.trips).doc(booking.tripId);
    const tripSnap = await tx.get(tripRef);
    if (tripSnap.exists) {
      const trip = tripSnap.data()!;
      const restored = Math.min(
        trip.totalSeats,
        (trip.availableSeats as number) + (booking.seatsBooked as number)
      );
      tx.update(tripRef, { availableSeats: restored, status: "active" });
    }

    if (booking.paymentMethod === "wallet" && booking.paymentStatus === "paid") {
      const walletRef = db.collection(COLLECTIONS.wallets).doc(uid);
      const walletSnap = await tx.get(walletRef);
      const currentBalance = (walletSnap.data()?.balance ?? 0) as number;
      const newBalance = currentBalance + (booking.totalPrice as number);

      tx.update(walletRef, { balance: newBalance });

      const refundTxRef = walletRef.collection(COLLECTIONS.walletTransactions).doc();
      tx.set(refundTxRef, {
        type: "refund",
        amount: booking.totalPrice,
        balanceAfter: newBalance,
        relatedBookingId: bookingId,
        status: "completed",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      tx.update(bookingRef, { status: "cancelled", paymentStatus: "refunded" });
    } else {
      tx.update(bookingRef, { status: "cancelled" });
    }
  });

  return { success: true };
});

/**
 * السائق بيعلّم الرحلة كمنتهية - وده اللي بيحصّل فيه فعليًا التحويل
 * لمحفظة السائق (خصم العمولة) لكل الحجوزات المدفوعة بالمحفظة.
 * الدفع النقدي مبيتحولش فلوس هنا لأن الفلوس اتقبضت يدويًا بالفعل.
 */
export const markTripCompleted = functions.onCall(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) {
    throw new functions.HttpsError("unauthenticated", "لازم تسجّل دخول الأول");
  }

  const { tripId } = request.data as { tripId: string };
  const tripRef = db.collection(COLLECTIONS.trips).doc(tripId);

  const tripSnap = await tripRef.get();
  if (!tripSnap.exists) {
    throw new functions.HttpsError("not-found", "الرحلة مش موجودة");
  }
  const trip = tripSnap.data()!;
  if (trip.driverId !== uid) {
    throw new functions.HttpsError(
      "permission-denied",
      "مسموح بس لسائق الرحلة يقفلها"
    );
  }

  const commissionPercent = trip.isReturnEmptyTrip
    ? COMMISSION.returnEmptyTripPercent
    : COMMISSION.standardPercent;

  const bookingsSnap = await db
    .collection(COLLECTIONS.bookings)
    .where("tripId", "==", tripId)
    .where("status", "==", "confirmed")
    .get();

  await db.runTransaction(async (tx) => {
    tx.update(tripRef, { status: "completed" });

    // زيادة عدد الرحلات المكتملة للسائق نفسه
    const driverRef = db.collection(COLLECTIONS.users).doc(uid);
    tx.update(driverRef, {
      totalTrips: admin.firestore.FieldValue.increment(1),
    });

    for (const bookingDoc of bookingsSnap.docs) {
      const booking = bookingDoc.data();
      tx.update(bookingDoc.ref, { status: "completed" });

      // زيادة عدد الرحلات المكتملة لكل راكب كان معاه حجز مؤكد
      const passengerRef = db.collection(COLLECTIONS.users).doc(booking.passengerId);
      tx.update(passengerRef, {
        totalTrips: admin.firestore.FieldValue.increment(1),
      });

      if (booking.paymentMethod === "wallet" && booking.paymentStatus === "paid") {
        const commissionAmount = (booking.totalPrice as number) * (commissionPercent / 100);
        const driverEarning = (booking.totalPrice as number) - commissionAmount;

        const driverWalletRef = db.collection(COLLECTIONS.wallets).doc(uid);
        const driverWalletSnap = await tx.get(driverWalletRef);
        const currentDriverBalance = (driverWalletSnap.data()?.balance ?? 0) as number;
        const newDriverBalance = currentDriverBalance + driverEarning;

        tx.update(driverWalletRef, { balance: newDriverBalance });

        const earningTxRef = driverWalletRef
          .collection(COLLECTIONS.walletTransactions)
          .doc();
        tx.set(earningTxRef, {
          type: "deposit",
          amount: driverEarning,
          balanceAfter: newDriverBalance,
          relatedBookingId: bookingDoc.id,
          status: "completed",
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        const commissionTxRef = driverWalletRef
          .collection(COLLECTIONS.walletTransactions)
          .doc();
        tx.set(commissionTxRef, {
          type: "commission",
          amount: commissionAmount,
          relatedBookingId: bookingDoc.id,
          status: "completed",
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    }
  });

  return { success: true };
});
