import 'package:equatable/equatable.dart';

enum WalletTransactionType { deposit, withdraw, payment, refund, commission }

enum WalletTransactionStatus { pending, completed, rejected }

class WalletTransactionEntity extends Equatable {
  final String id;
  final WalletTransactionType type;
  final double amount;
  final double? balanceAfter;
  final String? relatedBookingId;
  final WalletTransactionStatus status;
  final DateTime createdAt;

  const WalletTransactionEntity({
    required this.id,
    required this.type,
    required this.amount,
    this.balanceAfter,
    this.relatedBookingId,
    required this.status,
    required this.createdAt,
  });

  bool get isCredit =>
      type == WalletTransactionType.deposit || type == WalletTransactionType.refund;

  @override
  List<Object?> get props => [id, type, amount, status, createdAt];
}

/// طلب محفظة معلّق كما تراه لوحة الإدارة - بيحمل userId معاه لأنه ناتج
/// من CollectionGroup query عبر كل المستخدمين مش تحت مستخدم واحد بس.
class AdminWalletRequest extends Equatable {
  final String userId;
  final WalletTransactionEntity transaction;

  const AdminWalletRequest({required this.userId, required this.transaction});

  @override
  List<Object?> get props => [userId, transaction];
}
