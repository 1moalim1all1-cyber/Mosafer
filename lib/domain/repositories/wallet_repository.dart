import 'wallet_transaction_entity.dart';

abstract class WalletRepository {
  Stream<double> watchBalance(String uid);

  Stream<List<WalletTransactionEntity>> watchTransactions(String uid);

  /// طلب إيداع - بيتسجّل بحالة "pending" ومبيغيّرش الرصيد فورًا.
  /// اعتماده الفعلي هيبقى من لوحة الإدارة (Phase 9) لحد ما يتم ربط
  /// بوابة دفع حقيقية (Visa/المحافظ الإلكترونية).
  Future<void> requestDeposit({required String uid, required double amount});

  /// طلب سحب - نفس منطق الإيداع، بانتظار موافقة الإدارة.
  Future<void> requestWithdraw({required String uid, required double amount});

  /// كل طلبات الإيداع/السحب المعلّقة عبر كل المستخدمين - تستخدمها لوحة
  /// الإدارة فقط (collectionGroup query محمي بصلاحيات الأدمن في الـ Rules).
  Stream<List<AdminWalletRequest>> watchPendingRequestsForAdmin();

  /// قرار الإدارة في طلب إيداع/سحب - عبر Cloud Function (resolveWalletRequest)
  /// بيحصل فيها فعليًا تعديل الرصيد بصلاحيات سيرفر آمنة.
  Future<void> resolveRequest({
    required String userId,
    required String transactionId,
    required bool approve,
  });
}
