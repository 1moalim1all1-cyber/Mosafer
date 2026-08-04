import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../providers/trip_providers.dart';
import '../../bookings/providers/booking_providers.dart';
import '../../auth/providers/auth_providers.dart';
import '../../ratings/providers/rating_providers.dart';
import '../../ratings/widgets/rating_dialog.dart';
import '../../../data/repositories/booking_repository_impl.dart';
import '../../../domain/entities/booking_entity.dart';
import '../../../domain/entities/rating_entity.dart';
import '../../../domain/entities/trip_entity.dart';
import '../../../core/theme/app_colors.dart';

class MyBookingsScreen extends ConsumerWidget {
  const MyBookingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProvider);
    if (user == null) return const SizedBox.shrink();

    final bookingsAsync = ref.watch(_passengerBookingsProvider(user.uid));

    return Scaffold(
      appBar: AppBar(title: const Text('رحلاتي')),
      body: bookingsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (_, __) => const Center(child: Text('حصل خطأ في تحميل رحلاتك')),
        data: (bookings) {
          if (bookings.isEmpty) {
            return const Center(child: Text('لسه معملتش أي حجز'));
          }
          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: bookings.length,
            itemBuilder: (context, index) => _BookingTile(booking: bookings[index]),
          );
        },
      ),
    );
  }
}

final _passengerBookingsProvider = StreamProvider.autoDispose
    .family<List<BookingEntity>, String>((ref, passengerId) {
  return ref.read(bookingRepositoryProvider).watchPassengerBookings(passengerId);
});

class _BookingTile extends ConsumerWidget {
  final BookingEntity booking;
  const _BookingTile({required this.booking});

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
        return 'بانتظار الرد';
    }
  }

  Future<void> _cancel(WidgetRef ref, BuildContext context) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('تأكيد الإلغاء'),
        content: const Text('هتتفقد المقعد ده، وهترجعلك فلوسك لو كنت دفعت بالمحفظة'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('تراجع'),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: const Text('تأكيد الإلغاء'),
          ),
        ],
      ),
    );
    if (confirmed != true) return;

    try {
      await ref.read(bookingRepositoryProvider).cancelBooking(
            booking.id,
            tripId: booking.tripId,
            seatsToRestore: booking.seatsBooked,
          );
    } on BookingConflictException catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.message)));
      }
    }
  }

  Future<void> _rate(WidgetRef ref, BuildContext context, TripEntity trip) async {
    final user = ref.read(currentUserProvider);
    if (user == null) return;

    final alreadyRated = await ref
        .read(ratingRepositoryProvider)
        .hasRated(bookingId: booking.id, fromUserId: user.uid);

    if (alreadyRated) {
      if (context.mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(const SnackBar(content: Text('قيّمت الرحلة دي بالفعل')));
      }
      return;
    }

    if (!context.mounted) return;
    await showRatingDialog(
      context,
      ref,
      tripId: trip.id,
      bookingId: booking.id,
      fromUserId: user.uid,
      toUserId: trip.driverId,
      direction: RatingDirection.passengerToDriver,
      otherPartyName: 'السائق',
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final tripAsync = ref.watch(tripDetailsProvider(booking.tripId));
    final dateFormat = DateFormat('d MMM - hh:mm a', 'ar');

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
                tripAsync.when(
                  loading: () => const Text('جاري التحميل...'),
                  error: (_, __) => const Text('رحلة'),
                  data: (trip) => Text(
                    trip != null
                        ? '${trip.originCity} → ${trip.destinationCity}'
                        : 'رحلة اتلغت',
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                ),
                Text(_statusLabel(),
                    style: TextStyle(color: _statusColor(), fontWeight: FontWeight.w600)),
              ],
            ),
            const SizedBox(height: 6),
            Text(dateFormat.format(booking.createdAt),
                style: Theme.of(context).textTheme.bodySmall),
            const SizedBox(height: 4),
            Text('${booking.seatsBooked} مقاعد · ${booking.totalPrice.toStringAsFixed(0)} ج.م'),
            const SizedBox(height: 10),
            Row(
              children: [
                if (booking.status == BookingStatus.pending ||
                    booking.status == BookingStatus.confirmed)
                  TextButton(
                    onPressed: () => _cancel(ref, context),
                    style: TextButton.styleFrom(foregroundColor: AppColors.error),
                    child: const Text('إلغاء الحجز'),
                  ),
                if (booking.status == BookingStatus.completed)
                  tripAsync.maybeWhen(
                    data: (trip) => trip == null
                        ? const SizedBox.shrink()
                        : TextButton.icon(
                            onPressed: () => _rate(ref, context, trip),
                            icon: const Icon(Icons.star_outline, size: 18),
                            label: const Text('قيّم السائق'),
                          ),
                    orElse: () => const SizedBox.shrink(),
                  ),
                const Spacer(),
                if (booking.status != BookingStatus.cancelled)
                  TextButton(
                    onPressed: () => context.push('/trip/${booking.tripId}'),
                    child: const Text('تفاصيل الرحلة'),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
