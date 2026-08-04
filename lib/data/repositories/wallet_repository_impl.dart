import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:cloud_functions/cloud_functions.dart';

import '../../core/constants/app_constants.dart';
import '../../domain/entities/wallet_transaction_entity.dart';
import '../../domain/repositories/wallet_repository.dart';
import '../models/wallet_transaction_model.dart';

class WalletRepositoryImpl implements WalletRepository {
  final FirebaseFirestore _firestore;
  final FirebaseFunctions _functions;

  WalletRepositoryImpl({FirebaseFirestore? firestore, FirebaseFunctions? functions})
      : _firestore = firestore ?? FirebaseFirestore.instance,
        _functions = functions ?? FirebaseFunctions.instance;

  DocumentReference<Map<String, dynamic>> _walletDoc(String uid) =>
      _firestore.collection(AppConstants.walletsCollection).doc(uid);

  CollectionReference<Map<String, dynamic>> _transactionsRef(String uid) =>
      _walletDoc(uid).collection(AppConstants.walletTransactionsSubCollection);

  @override
  Stream<double> watchBalance(String uid) {
    return _walletDoc(uid).snapshots().map((doc) {
      if (!doc.exists) return 0.0;
      return (doc.data()?['balance'] ?? 0).toDouble();
    });
  }

  @override
  Stream<List<WalletTransactionEntity>> watchTransactions(String uid) {
    return _transactionsRef(uid)
        .orderBy('createdAt', descending: true)
        .limit(50)
        .snapshots()
        .map((snap) => snap.docs
            .map((d) => WalletTransactionModel.fromMap(d.id, d.data()))
            .toList());
  }

  @override
  Future<void> requestDeposit({required String uid, required double amount}) async {
    final model = WalletTransactionModel(
      id: '',
      type: WalletTransactionType.deposit,
      amount: amount,
      status: WalletTransactionStatus.pending,
      createdAt: DateTime.now(),
    );
    await _transactionsRef(uid).add(model.toMap());
  }

  @override
  Future<void> requestWithdraw({required String uid, required double amount}) async {
    final model = WalletTransactionModel(
      id: '',
      type: WalletTransactionType.withdraw,
      amount: amount,
      status: WalletTransactionStatus.pending,
      createdAt: DateTime.now(),
    );
    await _transactionsRef(uid).add(model.toMap());
  }

  @override
  Stream<List<AdminWalletRequest>> watchPendingRequestsForAdmin() {
    return _firestore
        .collectionGroup(AppConstants.walletTransactionsSubCollection)
        .where('status', isEqualTo: 'pending')
        .orderBy('createdAt', descending: true)
        .snapshots()
        .map((snap) => snap.docs.map((d) {
              final userId = d.reference.parent.parent!.id;
              return AdminWalletRequest(
                userId: userId,
                transaction: WalletTransactionModel.fromMap(d.id, d.data()),
              );
            }).toList());
  }

  @override
  Future<void> resolveRequest({
    required String userId,
    required String transactionId,
    required bool approve,
  }) async {
    await _functions.httpsCallable('resolveWalletRequest').call({
      'userId': userId,
      'transactionId': transactionId,
      'approve': approve,
    });
  }
}
