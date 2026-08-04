import * as firestoreV2 from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";
import { db, COLLECTIONS, notifyUser } from "./utils";

/**
 * أول ما مستخدم جديد يتسجّل -> منح رصيد ترحيبي تلقائي، وبعدين لو اتسجّل
 * بكود دعوة صاحب، منح مكافأة للطرفين. القيمتين قابلتين للتحكم من لوحة
 * الإدارة (appSettings/general) بدون أي تعديل كود.
 *
 * ملحوظة أمنية: العميل مستحيل يقدر يحط رصيد لنفسه مباشرة (firestore.rules
 * بتمنع زيادة balance من غير Cloud Function) - الدالة دي هي المصدر
 * الوحيد لمنح الرصيد الترحيبي والمكافآت.
 */
export const onUserCreated = firestoreV2.onDocumentCreated(
  `${COLLECTIONS.users}/{userId}`,
  async (event) => {
    const userId = event.params.userId;
    const user = event.data?.data();
    if (!user) return;

    const settingsDoc = await db.collection("appSettings").doc("general").get();
    const settings = settingsDoc.data() ?? {};
    const welcomeBonus = (settings.welcomeBonusAmount ?? 20) as number;
    const referralBonus = (settings.referralBonusAmount ?? 15) as number;

    const walletRef = db.collection(COLLECTIONS.wallets).doc(userId);

    // ---- الرصيد الترحيبي ----
    if (welcomeBonus > 0) {
      await db.runTransaction(async (tx) => {
        const walletSnap = await tx.get(walletRef);
        const currentBalance = (walletSnap.data()?.balance ?? 0) as number;
        const newBalance = currentBalance + welcomeBonus;
        tx.update(walletRef, { balance: newBalance });

        const txRef = walletRef.collection(COLLECTIONS.walletTransactions).doc();
        tx.set(txRef, {
          type: "deposit",
          amount: welcomeBonus,
          balanceAfter: newBalance,
          status: "completed",
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      });

      await notifyUser({
        userId,
        type: "walletUpdate",
        title: "هدية ترحيبية 🎉",
        body: `خدت ${welcomeBonus.toFixed(0)} ج.م رصيد ترحيبي في محفظتك`,
      });
    }

    // ---- مكافأة دعوة الأصدقاء (للطرفين) ----
    const referredByUid = user.referredByUid as string | undefined;
    if (referredByUid && referralBonus > 0) {
      const referrerWalletRef = db.collection(COLLECTIONS.wallets).doc(referredByUid);

      // مكافأة المستخدم الجديد (المدعو)
      await db.runTransaction(async (tx) => {
        const walletSnap = await tx.get(walletRef);
        const currentBalance = (walletSnap.data()?.balance ?? 0) as number;
        const newBalance = currentBalance + referralBonus;
        tx.update(walletRef, { balance: newBalance });

        const txRef = walletRef.collection(COLLECTIONS.walletTransactions).doc();
        tx.set(txRef, {
          type: "deposit",
          amount: referralBonus,
          balanceAfter: newBalance,
          status: "completed",
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      });

      // مكافأة صاحب الكود (الداعي)
      await db.runTransaction(async (tx) => {
        const walletSnap = await tx.get(referrerWalletRef);
        const currentBalance = (walletSnap.data()?.balance ?? 0) as number;
        const newBalance = currentBalance + referralBonus;
        tx.update(referrerWalletRef, { balance: newBalance });

        const txRef = referrerWalletRef
          .collection(COLLECTIONS.walletTransactions)
          .doc();
        tx.set(txRef, {
          type: "deposit",
          amount: referralBonus,
          balanceAfter: newBalance,
          status: "completed",
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      });

      await notifyUser({
        userId: referredByUid,
        type: "walletUpdate",
        title: "مكافأة دعوة صديق 🎁",
        body: `صاحبك انضم لمسافر بالكود بتاعك، خدت ${referralBonus.toFixed(0)} ج.م`,
      });
    }
  }
);
