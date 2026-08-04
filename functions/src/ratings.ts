import * as firestoreV2 from "firebase-functions/v2/firestore";
import { db, COLLECTIONS } from "./utils";

/**
 * أول ما تقييم جديد يتسجّل -> نعيد حساب avgRating للمُقيَّم من كل
 * تقييماته الحقيقية المخزّنة في Firestore، مش من رقم بيتراكم في العميل
 * (ده بيمنع أي تلاعب في الأرقام من تطبيق الموبايل). عدد الرحلات
 * (totalTrips) بيتحدّث في مكان تاني (markTripCompleted).
 */
export const onRatingCreated = firestoreV2.onDocumentCreated(
  `${COLLECTIONS.ratings}/{ratingId}`,
  async (event) => {
    const rating = event.data?.data();
    if (!rating) return;

    const toUserId = rating.toUserId as string;

    const allRatingsSnap = await db
      .collection(COLLECTIONS.ratings)
      .where("toUserId", "==", toUserId)
      .get();

    if (allRatingsSnap.empty) return;

    let sum = 0;
    allRatingsSnap.forEach((doc) => {
      sum += (doc.data().stars as number) ?? 0;
    });
    const avg = sum / allRatingsSnap.size;

    await db
      .collection(COLLECTIONS.users)
      .doc(toUserId)
      .update({ avgRating: Math.round(avg * 10) / 10 });
  }
);
