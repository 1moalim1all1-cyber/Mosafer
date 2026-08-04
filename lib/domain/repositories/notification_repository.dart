import '../entities/notification_entity.dart';

abstract class NotificationRepository {
  Stream<List<NotificationEntity>> watchNotifications(String userId);

  Stream<int> watchUnreadCount(String userId);

  Future<void> markAsRead(String userId, String notificationId);

  Future<void> markAllAsRead(String userId);

  /// إنشاء إشعار لمستخدم تاني - حل مؤقت مباشر من العميل لحد ما ننقل
  /// المنطق ده بالكامل لـ Cloud Functions في Phase 7 (أضمن وأوثق في التسليم).
  Future<void> createNotification({
    required String userId,
    required NotificationType type,
    required String title,
    required String body,
    String? relatedId,
  });

  Future<void> saveFcmToken({required String userId, required String token});
}
