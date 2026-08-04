import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../bookings/providers/booking_providers.dart';
import '../../auth/providers/auth_providers.dart';
import '../../chat/providers/chat_providers.dart';
import '../widgets/live_location_sharing_button.dart';
import '../../ratings/providers/rating_providers.dart';
import '../../ratings/widgets/rating_dialog.dart';
import '../../../domain/entities/booking_entity.dart';
import '../../../domain/entities/rating_entity.dart';
import '../../../core/theme/app_colors.dart';

final _tripBookingsProvider = StreamProvider.autoDispose
    .family<List<BookingEntity>, String>((ref, tripId) {
  return ref.read(bookingRepositoryProvider).watchTripBookings(tripId);
});

class DriverTripBookingsScreen extends ConsumerWidget {
  final String tripId;
  const DriverTripBookingsScreen({super.key, required this.tripId});

  Future<void> _respond(
    WidgetRef ref,
    BookingEntity booking,
    bool accept,
  ) async {
    // إشعار الراكب بالنتيجة بقى بيحصل تلقائيًا من Cloud Function
    // (onBookingStatusChanged) أول ما حالة الحجز تتغيّر - مفيش داعي
    // نبعته يدويًا من هنا زي ما كان في Phase 6.
    await ref.read(bookingRepositoryProvider).respondToBooking(
          bookingId: booking.id,
          tripId: booking.tripId,
          seatsBooked: booking.seatsBooked,
          accept: accept,
        );
  }

  Future<void> _openChatWithPassenger(WidgetRef ref, BuildContext context, BookingEntity booking) async {
    final chatId = ref
        .read(chatRepositoryProvider)
        .buildChatId(tripId: booking.tripId, passengerId: booking.passengerId);

    await ref.read(chatRepositoryProvider).ensureChatExists(
          chatId: chatId,
          tripId: booking.tripId,
          passengerId: booking.passengerId,
          driverId: booking.driverId,
        );

    if (!context.mounted) return;
    context.push('/chat/$chatId');
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final bookingsAsync = ref.watch(_tripBookingsProvider(tripId));

    return Scaffold(
      appBar: AppBar(
        title: const Text('طلبات الحجز'),
        actions: [
          TextButton(
            onPressed: () async {
              final confirmed = await showDialog<bool>(
                context: context,
                builder: (_) => AlertDialog(
                  title: const Text('تأكيد إنهاء الرحلة'),
                  content: const Text(
                    'هيتم تحويل أرباح الحجوزات المدفوعة بالمحفظة لرصيدك '
                    'بعد خصم عمولة المنصة. متأكد إن الرحلة خلصت فعلاً؟',
                  ),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.of(context).pop(false),
                      child: const Text('إلغاء'),
                    ),
                    TextButton(
                      onPressed: () => Navigator.of(context).pop(true),
                      child: const Text('تأكيد'),
                    ),
                  ],
                ),
              );
              if (confirmed != true) return;

              try {
                await ref.read(bookingRepositoryProvider).markTripCompleted(tripId);
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('تم إنهاء الرحلة وتحويل الأرباح')),
                  );
                  Navigator.of(context).pop();
                }
              } catch (_) {
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('حصل خطأ، حاول تاني')),
                  );
                }
              }
            },
            child: const Text('إنهاء الرحلة'),
          ),
        ],
      ),
      body: Column(
        children: [
          LiveLocationSharingButton(tripId: tripId),
          Expanded(
            child: bookingsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (_, __) => const Center(child: Text('حصل خطأ في تحميل الطلبات')),
        data: (bookings) {
          if (bookings.isEmpty) {
            return const Center(child: Text('لسه مفيش حجوزات على الرحلة دي'));
          }
          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: bookings.length,
            itemBuilder: (context, index) {
              final booking = bookings[index];
              return _BookingCard(
                booking: booking,
                onAccept: () => _respond(ref, booking, true),
                onReject: () => _respond(ref, booking, false),
                onMessage: () => _openChatWithPassenger(ref, context, booking),
                onRate: () => showRatingDialog(
                  context,
                  ref,
                  tripId: booking.tripId,
                  bookingId: booking.id,
                  fromUserId: booking.driverId,
                  toUserId: booking.passengerId,
                  direction: RatingDirection.driverToPassenger,
                  otherPartyName: 'الراكب',
                ),
              );
            },
          );
        },
            ),
          ),
        ],
      ),
    );
  }
}

class _BookingCard extends ConsumerWidget {
  final BookingEntity booking;
  final VoidCallback onAccept;
  final VoidCallback onReject;
  final VoidCallback onMessage;
  final VoidCallback onRate;

  const _BookingCard({
    required this.booking,
    required this.onAccept,
    required this.onReject,
    required this.onMessage,
    required this.onRate,
  });

  Color _statusColor() {
    switch (booking.status) {
      case BookingStatus.confirmed:
        return AppColors.success;
      case BookingStatus.rejected:
      case BookingStatus.cancelled:
        return AppColors.error;
      case BookingStatus.completed:
        return AppColors.info;
      case BookingStatus.pending:
        return AppColors.warning;
    }
  }

  String _statusLabel() {
    switch (booking.status) {
      case BookingStatus.confirmed:
        return 'مؤكد';
      case BookingStatus.rejected:
        return 'مرفوض';
      case BookingStatus.cancelled:
        return 'ملغي';
      case BookingStatus.completed:
        return 'منتهي';
      case BookingStatus.pending:
        return 'بانتظار ردك';
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final passengerAsync =
        ref.watch(FutureProvider.autoDispose((ref) {
      return ref.read(authRepositoryProvider).fetchUserProfile(booking.passengerId);
    }));

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                passengerAsync.when(
                  loading: () => const Text('جاري التحميل...'),
                  error: (_, __) => const Text('راكب'),
                  data: (p) => Text(
                    p?.fullName ?? 'راكب',
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                ),
                Row(
                  children: [
                    IconButton(
                      icon: const Icon(Icons.chat_bubble_outline, size: 20),
                      onPressed: onMessage,
                      visualDensity: VisualDensity.compact,
                    ),
                    Text(
                      _statusLabel(),
                      style: TextStyle(color: _statusColor(), fontWeight: FontWeight.w600),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 6),
            Text('${booking.seatsBooked} مقاعد · ${booking.totalPrice.toStringAsFixed(0)} ج.م'),
            if (booking.status == BookingStatus.pending) ...[
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: onReject,
                      child: const Text('رفض'),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: onAccept,
                      child: const Text('قبول'),
                    ),
                  ),
                ],
              ),
            ],
            if (booking.status == BookingStatus.completed) ...[
              const SizedBox(height: 8),
              TextButton.icon(
                onPressed: onRate,
                icon: const Icon(Icons.star_outline, size: 18),
                label: const Text('قيّم الراكب'),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
