import * as functions from "firebase-functions/v2/https";
import { db, COLLECTIONS, notifyUser } from "./utils";

/**
 * التحقق إن المستخدم اللي بينادي الـ Function ده أدمن فعلاً - بيتقرا
 * من نفس وثيقة users المستخدمة في كل مكان في التطبيق (role == 'admin').
 * لوحة الإدارة (Phase 9) هتنادي الدوال دي بدل ما تعدّل Firestore مباشرة.
 */
async function assertIsAdmin(uid: string | undefined): Promise<void> {
  if (!uid) {
    throw new functions.HttpsError("unauthenticated", "لازم تسجّل دخول الأول");
  }
  const userDoc = await db.collection(COLLECTIONS.users).doc(uid).get();
  if (userDoc.data()?.role !== "admin") {
    throw new functions.HttpsError("permission-denied", "الصلاحية دي للإدارة فقط");
  }
}

export const approveDriver = functions.onCall(async (request) => {
  await assertIsAdmin(request.auth?.uid);

  const { driverId } = request.data as { driverId: string };
  await db.collection(COLLECTIONS.drivers).doc(driverId).update({
    verificationStatus: "approved",
    rejectionReason: null,
  });

  await notifyUser({
    userId: driverId,
    type: "adminAlert",
    title: "تم اعتماد حسابك 🎉",
    body: "تقدر دلوقتي تنشر رحلاتك على مسافر وتبدأ تكسب",
  });

  return { success: true };
});

export const rejectDriver = functions.onCall(async (request) => {
  await assertIsAdmin(request.auth?.uid);

  const { driverId, reason } = request.data as { driverId: string; reason: string };
  await db.collection(COLLECTIONS.drivers).doc(driverId).update({
    verificationStatus: "rejected",
    rejectionReason: reason || "المستندات مش واضحة، من فضلك ارفعها تاني",
  });

  await notifyUser({
    userId: driverId,
    type: "adminAlert",
    title: "تم رفض مستنداتك",
    body: reason || "من فضلك راجع مستنداتك وأعد رفعها",
  });

  return { success: true };
});
