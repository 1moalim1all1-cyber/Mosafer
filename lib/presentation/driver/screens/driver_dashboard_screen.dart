import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../providers/driver_providers.dart';
import '../../trips/providers/trip_providers.dart';
import '../../auth/providers/auth_providers.dart';
import '../../../domain/entities/driver_entity.dart';
import '../../../domain/entities/trip_entity.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/routing/app_router.dart';

class DriverDashboardScreen extends ConsumerWidget {
  const DriverDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProvider);
    final driverStatusAsync = ref.watch(driverStatusProvider);

    if (user == null) return const SizedBox.shrink();

    final tripsAsync = ref.watch(driverTripsProvider(user.uid));

    return Scaffold(
      appBar: AppBar(title: const Text('لوحة السائق')),
      floatingActionButton: driverStatusAsync.maybeWhen(
        data: (driver) => driver?.isApproved == true
            ? FloatingActionButton.extended(
                onPressed: () => context.push(AppRoutes.createTrip),
                icon: const Icon(Icons.add),
                label: const Text('رحلة جديدة'),
              )
            : null,
        orElse: () => null,
      ),
      body: Column(
        children: [
          driverStatusAsync.when(
            loading: () => const SizedBox.shrink(),
            error: (_, __) => const SizedBox.shrink(),
            data: (driver) {
              if (driver?.isApproved == true) return const SizedBox.shrink();
              return _buildNotApprovedBanner(context);
            },
          ),
          Expanded(
            child: tripsAsync.when(
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (_, __) => const Center(child: Text('حصل خطأ في تحميل رحلاتك')),
              data: (trips) {
                if (trips.isEmpty) {
                  return const Center(child: Text('لسه معملتش أي رحلة'));
                }
                return ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: trips.length,
                  itemBuilder: (context, index) {
                    final trip = trips[index];
                    return _DriverTripTile(trip: trip);
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNotApprovedBanner(BuildContext context) {
    return Container(
      width: double.infinity,
      color: AppColors.warning.withValues(alpha: 0.12),
      padding: const EdgeInsets.all(14),
      child: Row(
        children: [
          const Icon(Icons.info_outline, color: AppColors.warning),
          const SizedBox(width: 10),
          const Expanded(
            child: Text('حسابك لسه تحت المراجعة، مش هتقدر تنشر رحلات لحد الاعتماد'),
          ),
          TextButton(
            onPressed: () => context.push(AppRoutes.driverPendingApproval),
            child: const Text('التفاصيل'),
          ),
        ],
      ),
    );
  }
}

class _DriverTripTile extends StatelessWidget {
  final TripEntity trip;
  const _DriverTripTile({required this.trip});

  Color _statusColor() {
    switch (trip.status) {
      case TripStatus.active:
        return AppColors.success;
      case TripStatus.full:
        return AppColors.info;
      case TripStatus.completed:
        return AppColors.lightTextSecondary;
      case TripStatus.cancelled:
        return AppColors.error;
      case TripStatus.pending:
        return AppColors.warning;
    }
  }

  String _statusLabel() {
    switch (trip.status) {
      case TripStatus.active:
        return 'نشطة';
      case TripStatus.full:
        return 'مكتملة المقاعد';
      case TripStatus.completed:
        return 'منتهية';
      case TripStatus.cancelled:
        return 'ملغاة';
      case TripStatus.pending:
        return 'قيد المراجعة';
    }
  }

  @override
  Widget build(BuildContext context) {
    final dateFormat = DateFormat('d MMM - hh:mm a', 'ar');

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        onTap: () => context.push('/driver/trip/${trip.id}/bookings'),
        title: Text('${trip.originCity} → ${trip.destinationCity}'),
        subtitle: Text(dateFormat.format(trip.departureTime)),
        trailing: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text(
              _statusLabel(),
              style: TextStyle(color: _statusColor(), fontWeight: FontWeight.w600),
            ),
            Text('${trip.availableSeats}/${trip.totalSeats} متاح'),
          ],
        ),
      ),
    );
  }
}
