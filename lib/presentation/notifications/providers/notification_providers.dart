import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../domain/repositories/notification_repository.dart';
import '../../../data/repositories/notification_repository_impl.dart';
import '../../auth/providers/auth_providers.dart';

final notificationRepositoryProvider = Provider<NotificationRepository>((ref) {
  return NotificationRepositoryImpl();
});

final notificationsProvider = StreamProvider.autoDispose((ref) {
  final user = ref.watch(currentUserProvider);
  if (user == null) return const Stream.empty();
  return ref.read(notificationRepositoryProvider).watchNotifications(user.uid);
});

final unreadNotificationsCountProvider = StreamProvider.autoDispose<int>((ref) {
  final user = ref.watch(currentUserProvider);
  if (user == null) return const Stream.empty();
  return ref.read(notificationRepositoryProvider).watchUnreadCount(user.uid);
});
