import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';

import '../../domain/repositories/notification_repository.dart';

/// إدارة صلاحيات الإشعارات، والحصول على FCM Token، وحفظه في بروفايل
/// المستخدم عشان لاحقًا Cloud Function (Phase 7) تقدر تبعتله Push حقيقي.
///
/// ملحوظة مهمة: الإرسال الفعلي لإشعارات Push لمستخدمين تانيين مستحيل
/// يتم من تطبيق العميل مباشرة (محتاج Admin SDK / مفتاح سيرفر لأسباب أمنية).
/// اللي بيحصل هنا هو الجزء اللي بيخص جهاز المستخدم بس: طلب الصلاحية،
/// الحصول على Token، والاستماع للإشعارات اللي توصل فعليًا.
class FcmService {
  FcmService._();
  static final FcmService instance = FcmService._();

  final FirebaseMessaging _messaging = FirebaseMessaging.instance;

  Future<void> initialize({
    required String userId,
    required NotificationRepository notificationRepository,
  }) async {
    try {
      final settings = await _messaging.requestPermission(
        alert: true,
        badge: true,
        sound: true,
      );

      if (settings.authorizationStatus == AuthorizationStatus.denied) {
        debugPrint('Mosafer: المستخدم رفض صلاحية الإشعارات');
        return;
      }

      final token = await _messaging.getToken();
      if (token != null) {
        await notificationRepository.saveFcmToken(userId: userId, token: token);
      }

      // لو الـ Token اتغيّر (بيحصل أحيانًا)، نحدّثه في Firestore تلقائيًا
      _messaging.onTokenRefresh.listen((newToken) {
        notificationRepository.saveFcmToken(userId: userId, token: newToken);
      });

      // إشعار وصل والتطبيق مفتوح (Foreground) - هنا ممكن نعرض SnackBar
      // أو نعتمد على شاشة الإشعارات نفسها اللي بتتحدث Live من Firestore.
      FirebaseMessaging.onMessage.listen((message) {
        debugPrint('Mosafer: إشعار وصل والتطبيق مفتوح - ${message.notification?.title}');
      });
    } catch (e) {
      debugPrint('Mosafer: فشل تهيئة FCM - $e');
    }
  }
}
