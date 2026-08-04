import 'package:cloud_firestore/cloud_firestore.dart';

import '../../core/constants/app_constants.dart';
import '../../domain/entities/notification_entity.dart';
import '../../domain/repositories/notification_repository.dart';
import '../models/notification_model.dart';

class NotificationRepositoryImpl implements NotificationRepository {
  final FirebaseFirestore _firestore;

  NotificationRepositoryImpl({FirebaseFirestore? firestore})
      : _firestore = firestore ?? FirebaseFirestore.instance;

  CollectionReference<Map<String, dynamic>> _notifRef(String userId) =>
      _firestore
          .collection(AppConstants.usersCollection)
          .doc(userId)
          .collection(AppConstants.notificationsCollection);

  @override
  Stream<List<NotificationEntity>> watchNotifications(String userId) {
    return _notifRef(userId)
        .orderBy('createdAt', descending: true)
        .limit(50)
        .snapshots()
        .map((snap) => snap.docs
            .map((d) => NotificationModel.fromMap(d.id, d.data()))
            .toList());
  }

  @override
  Stream<int> watchUnreadCount(String userId) {
    return _notifRef(userId)
        .where('isRead', isEqualTo: false)
        .snapshots()
        .map((snap) => snap.docs.length);
  }

  @override
  Future<void> markAsRead(String userId, String notificationId) {
    return _notifRef(userId).doc(notificationId).update({'isRead': true});
  }

  @override
  Future<void> markAllAsRead(String userId) async {
    final unread = await _notifRef(userId).where('isRead', isEqualTo: false).get();
    if (unread.docs.isEmpty) return;
    final batch = _firestore.batch();
    for (final doc in unread.docs) {
      batch.update(doc.reference, {'isRead': true});
    }
    await batch.commit();
  }

  @override
  Future<void> createNotification({
    required String userId,
    required NotificationType type,
    required String title,
    required String body,
    String? relatedId,
  }) async {
    final model = NotificationModel(
      id: '',
      type: type,
      title: title,
      body: body,
      relatedId: relatedId,
      createdAt: DateTime.now(),
    );
    await _notifRef(userId).add(model.toMap());
  }

  @override
  Future<void> saveFcmToken({required String userId, required String token}) async {
    await _firestore.collection(AppConstants.usersCollection).doc(userId).update({
      'fcmTokens': FieldValue.arrayUnion([token]),
    });
  }
}
