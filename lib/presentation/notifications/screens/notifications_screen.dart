import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../providers/notification_providers.dart';
import '../../auth/providers/auth_providers.dart';
import '../../shared/widgets/staggered_fade_in.dart';
import '../../../domain/entities/notification_entity.dart';
import '../../../core/theme/app_colors.dart';

class NotificationsScreen extends ConsumerWidget {
  const NotificationsScreen({super.key});

  IconData _iconFor(NotificationType type) {
    switch (type) {
      case NotificationType.bookingAccepted:
        return Icons.check_circle_outline;
      case NotificationType.bookingRejected:
        return Icons.cancel_outlined;
      case NotificationType.newBookingRequest:
        return Icons.event_seat_outlined;
      case NotificationType.tripStarted:
        return Icons.directions_car_filled_outlined;
      case NotificationType.tripCompleted:
        return Icons.flag_outlined;
      case NotificationType.newMessage:
        return Icons.chat_bubble_outline;
      case NotificationType.promotion:
        return Icons.local_offer_outlined;
      case NotificationType.walletUpdate:
        return Icons.account_balance_wallet_outlined;
      case NotificationType.adminAlert:
        return Icons.campaign_outlined;
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final notificationsAsync = ref.watch(notificationsProvider);
    final user = ref.watch(currentUserProvider);
    final dateFormat = DateFormat('d MMM - hh:mm a', 'ar');

    return Scaffold(
      appBar: AppBar(
        title: const Text('الإشعارات'),
        actions: [
          TextButton(
            onPressed: user == null
                ? null
                : () => ref
                    .read(notificationRepositoryProvider)
                    .markAllAsRead(user.uid),
            child: const Text('تعليم الكل كمقروء'),
          ),
        ],
      ),
      body: notificationsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (_, __) => const Center(child: Text('حصل خطأ في تحميل الإشعارات')),
        data: (notifications) {
          if (notifications.isEmpty) {
            return const Center(child: Text('لسه مفيش إشعارات'));
          }
          return ListView.separated(
            itemCount: notifications.length,
            separatorBuilder: (_, __) => const Divider(height: 1),
            itemBuilder: (context, index) {
              final n = notifications[index];
              return StaggeredFadeIn(
                index: index,
                child: ListTile(
                onTap: () {
                  if (!n.isRead && user != null) {
                    ref.read(notificationRepositoryProvider).markAsRead(user.uid, n.id);
                  }
                },
                leading: CircleAvatar(
                  backgroundColor: n.isRead
                      ? AppColors.lightBackground
                      : AppColors.primary.withValues(alpha: 0.12),
                  child: Icon(_iconFor(n.type),
                      color: n.isRead ? AppColors.lightTextSecondary : AppColors.primary),
                ),
                title: Text(
                  n.title,
                  style: TextStyle(fontWeight: n.isRead ? FontWeight.normal : FontWeight.bold),
                ),
                subtitle: Text(n.body),
                trailing: Text(
                  dateFormat.format(n.createdAt),
                  style: Theme.of(context).textTheme.bodySmall,
                ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
