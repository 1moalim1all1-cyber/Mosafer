import 'package:cloud_firestore/cloud_firestore.dart';
import '../../domain/entities/wallet_transaction_entity.dart';

class WalletTransactionModel extends WalletTransactionEntity {
  const WalletTransactionModel({
    required super.id,
    required super.type,
    required super.amount,
    super.balanceAfter,
    super.relatedBookingId,
    required super.status,
    required super.createdAt,
  });

  factory WalletTransactionModel.fromMap(String id, Map<String, dynamic> map) {
    return WalletTransactionModel(
      id: id,
      type: WalletTransactionType.values.firstWhere(
        (t) => t.name == (map['type'] ?? 'deposit'),
        orElse: () => WalletTransactionType.deposit,
      ),
      amount: (map['amount'] ?? 0).toDouble(),
      balanceAfter: map['balanceAfter'] != null
          ? (map['balanceAfter'] as num).toDouble()
          : null,
      relatedBookingId: map['relatedBookingId'],
      status: WalletTransactionStatus.values.firstWhere(
        (s) => s.name == (map['status'] ?? 'pending'),
        orElse: () => WalletTransactionStatus.pending,
      ),
      createdAt: (map['createdAt'] is Timestamp)
          ? (map['createdAt'] as Timestamp).toDate()
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'type': type.name,
      'amount': amount,
      'balanceAfter': balanceAfter,
      'relatedBookingId': relatedBookingId,
      'status': status.name,
      'createdAt': FieldValue.serverTimestamp(),
    };
  }
}
