import * as functions from "firebase-functions/v2/https";
import { db, COLLECTIONS, notifyUser } from "./utils";

async function assertIsAdmin(uid: string | undefined): Promise<void> {
  if (!uid) {
    throw new functions.HttpsError("unauthenticated", "لازم تسجّل دخول الأول");
  }
  const userDoc = await db.collection(COLLECTIONS.users).doc(uid).get();
  if (userDoc.data()?.role !== "admin") {
    throw new functions.HttpsError("permission-denied", "الصلاحية دي للإدارة فقط");
  }
}

/**
 * الإدارة بتقرر في طلب إيداع/سحب معلّق. القرار هنا هو اللي بيعدّل الرصيد
 * فعليًا - العميل (حتى لوحة الإدارة نفسها) مبيلمسش balance مباشرة أبدًا.
 */
export const resolveWalletRequest = functions.onCall(async (request) => {
  await assertIsAdmin(request.auth?.uid);

  const { userId, transactionId, approve } = request.data as {
    userId: string;
    transactionId: string;
    approve: boolean;
  };

  const walletRef = db.collection(COLLECTIONS.wallets).doc(userId);
  const txRef = walletRef.collection(COLLECTIONS.walletTransactions).doc(transactionId);

  await db.runTransaction(async (tx) => {
    const txSnap = await tx.get(txRef);
    if (!txSnap.exists) {
      throw new functions.HttpsError("not-found", "الطلب مش موجود");
    }
    const txData = txSnap.data()!;
    if (txData.status !== "pending") {
      throw new functions.HttpsError("failed-precondition", "تم البت في الطلب ده بالفعل");
    }

    if (!approve) {
      tx.update(txRef, { status: "rejected" });
      return;
    }

    const walletSnap = await tx.get(walletRef);
    const currentBalance = (walletSnap.data()?.balance ?? 0) as number;

    if (txData.type === "deposit") {
      const newBalance = currentBalance + (txData.amount as number);
      tx.update(walletRef, { balance: newBalance });
      tx.update(txRef, { status: "completed", balanceAfter: newBalance });
    } else if (txData.type === "withdraw") {
      if (currentBalance < txData.amount) {
        throw new functions.HttpsError(
          "failed-precondition",
          "رصيد المستخدم بقى أقل من مبلغ السحب المطلوب"
        );
      }
      const newBalance = currentBalance - (txData.amount as number);
      tx.update(walletRef, { balance: newBalance });
      tx.update(txRef, { status: "completed", balanceAfter: newBalance });
    }
  });

  await notifyUser({
    userId,
    type: "walletUpdate",
    title: approve ? "تم تنفيذ طلبك في المحفظة ✅" : "تم رفض طلبك في المحفظة",
    body: approve ? "راجع محفظتك للتفاصيل" : "تواصل مع الدعم لمزيد من التفاصيل",
  });

  return { success: true };
});
