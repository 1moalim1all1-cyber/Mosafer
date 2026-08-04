import * as admin from "firebase-admin";

admin.initializeApp();

export const db = admin.firestore();
export const messaging = admin.messaging();

export const COLLECTIONS = {
  users: "users",
  drivers: "drivers",
  trips: "trips",
  bookings: "bookings",
  wallets: "wallets",
  walletTransactions: "walletTransactions",
  chats: "chats",
  messages: "messages",
  notifications: "notifications",
  ratings: "ratings",
} as const;

export const COMMISSION = {
  standardPercent: 10,
  returnEmptyTripPercent: 5,
};

/**
 * بعت Push Notification لكل الأجهزة المسجّلة لمستخدم معيّن (fcmTokens array)،
 * وبيشيل أي Token بقى غير صالح (Uninstall / انتهاء صلاحية) تلقائيًا.
 */
export async function sendPushToUser(
  userId: string,
  title: string,
  body: string,
  data: Record<string, string> = {}
): Promise<void> {
  const userDoc = await db.collection(COLLECTIONS.users).doc(userId).get();
  const tokens: string[] = userDoc.data()?.fcmTokens ?? [];
  if (tokens.length === 0) return;

  const response = await messaging.sendEachForMulticast({
    tokens,
    notification: { title, body },
    data,
  });

  // تنظيف الـ Tokens اللي فشلت بشكل دائم (مش أخطاء شبكة مؤقتة)
  const invalidTokens: string[] = [];
  response.responses.forEach((res, idx) => {
    if (
      !res.success &&
      (res.error?.code === "messaging/invalid-registration-token" ||
        res.error?.code === "messaging/registration-token-not-registered")
    ) {
      invalidTokens.push(tokens[idx]);
    }
  });

  if (invalidTokens.length > 0) {
    await db.collection(COLLECTIONS.users).doc(userId).update({
      fcmTokens: admin.firestore.FieldValue.arrayRemove(...invalidTokens),
    });
  }
}

/**
 * إنشاء وثيقة إشعار داخل التطبيق (In-app) + إرسال Push في نفس الوقت.
 * ده الاستبدال الآمن لمنطق العميل المؤقت اللي كان في Phase 6.
 */
export async function notifyUser(params: {
  userId: string;
  type: string;
  title: string;
  body: string;
  relatedId?: string;
}): Promise<void> {
  const { userId, type, title, body, relatedId } = params;

  await db
    .collection(COLLECTIONS.users)
    .doc(userId)
    .collection(COLLECTIONS.notifications)
    .add({
      type,
      title,
      body,
      relatedId: relatedId ?? null,
      isRead: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

  await sendPushToUser(userId, title, body, {
    type,
    relatedId: relatedId ?? "",
  });
}
