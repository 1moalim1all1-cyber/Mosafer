import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../../domain/entities/trip_entity.dart';
import '../../../core/theme/app_colors.dart';
import '../../auth/providers/auth_providers.dart';
import '../../driver/providers/driver_providers.dart';

class TripCard extends ConsumerWidget {
  final TripEntity trip;
  final VoidCallback onTap;

  const TripCard({super.key, required this.trip, required this.onTap});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final timeFormat = DateFormat('hh:mm a', 'ar');
    final arrival = trip.estimatedArrivalTime ??
        trip.departureTime.add(Duration(minutes: trip.estimatedDurationMinutes));

    final driverAsync = ref.watch(
      FutureProvider.autoDispose(
        (ref) => ref.read(authRepositoryProvider).fetchUserProfile(trip.driverId),
      ),
    );
    final vehicleAsync = ref.watch(
      FutureProvider.autoDispose(
        (ref) => ref.read(driverRepositoryProvider).getDriverProfile(trip.driverId),
      ),
    );

    return Card(
      margin: const EdgeInsets.only(bottom: 14),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ---- شارات "راجع فاضي" و"سيدات فقط" — لازم تُقرأ من نظرة سريعة ----
              if (trip.isReturnEmptyTrip || trip.isWomenOnly)
                Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: Row(
                    children: [
                      if (trip.isReturnEmptyTrip)
                        _buildBadge(
                          icon: Icons.recycling,
                          label: 'راجع فاضي',
                          color: AppColors.returnEmptyTrip,
                        ),
                      if (trip.isReturnEmptyTrip && trip.isWomenOnly)
                        const SizedBox(width: 8),
                      if (trip.isWomenOnly)
                        _buildBadge(
                          icon: Icons.female,
                          label: 'سيدات فقط',
                          color: AppColors.womenOnly,
                        ),
                    ],
                  ),
                ),

              // ---- صف بيانات السائق: صورة + اسم + تقييم ----
              driverAsync.when(
                loading: () => const _DriverRowSkeleton(),
                error: (_, __) => const SizedBox.shrink(),
                data: (driver) {
                  if (driver == null) return const SizedBox.shrink();
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: Row(
                      children: [
                        CircleAvatar(
                          radius: 20,
                          backgroundColor: AppColors.accent.withValues(alpha: 0.12),
                          backgroundImage: driver.profileImageUrl != null
                              ? NetworkImage(driver.profileImageUrl!)
                              : null,
                          child: driver.profileImageUrl == null
                              ? Icon(Icons.person, color: AppColors.accentDark)
                              : null,
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(driver.fullName,
                                  style: Theme.of(context).textTheme.titleMedium),
                              Row(
                                children: [
                                  const Icon(Icons.star, size: 13, color: AppColors.ratingStar),
                                  const SizedBox(width: 3),
                                  Text(
                                    driver.avgRating > 0
                                        ? '${driver.avgRating.toStringAsFixed(1)} · ${driver.totalTrips} رحلة'
                                        : 'سائق جديد',
                                    style: Theme.of(context).textTheme.bodySmall,
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),

              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(timeFormat.format(trip.departureTime),
                              style: Theme.of(context).textTheme.titleLarge),
                          const SizedBox(width: 6),
                          Icon(Icons.arrow_back, size: 14,
                              color: Theme.of(context).textTheme.bodySmall?.color),
                          const SizedBox(width: 6),
                          Text(timeFormat.format(arrival),
                              style: Theme.of(context).textTheme.bodyMedium),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text('${trip.originCity} → ${trip.destinationCity}',
                          style: Theme.of(context).textTheme.bodyMedium),
                      Text('${trip.estimatedDurationMinutes} دقيقة تقريبًا',
                          style: Theme.of(context).textTheme.bodySmall),
                    ],
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        '${trip.pricePerSeat.toStringAsFixed(0)} ج.م',
                        style: Theme.of(context)
                            .textTheme
                            .titleLarge
                            ?.copyWith(color: AppColors.accent, fontWeight: FontWeight.bold),
                      ),
                      Text('للمقعد', style: Theme.of(context).textTheme.bodySmall),
                    ],
                  ),
                ],
              ),

              const Divider(height: 24),

              // ---- بيانات السيارة: النوع، اللون، الموديل، المقاعد ----
              vehicleAsync.when(
                loading: () => const SizedBox(height: 16),
                error: (_, __) => const SizedBox.shrink(),
                data: (driverProfile) {
                  final vehicle = driverProfile?.vehicle;
                  return Wrap(
                    spacing: 16,
                    runSpacing: 6,
                    children: [
                      _infoChip(context, Icons.event_seat, '${trip.availableSeats} مقاعد متاحة'),
                      _infoChip(context, Icons.directions_car_filled, trip.carType),
                      if (vehicle != null) ...[
                        _infoChip(context, Icons.palette_outlined, vehicle.color),
                        _infoChip(context, Icons.badge_outlined,
                            '${vehicle.make} ${vehicle.model}'),
                      ],
                    ],
                  );
                },
              ),

              const SizedBox(height: 14),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: onTap,
                  child: const Text('احجز الآن'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _infoChip(BuildContext context, IconData icon, String text) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 15, color: Theme.of(context).textTheme.bodySmall?.color),
        const SizedBox(width: 4),
        Text(text, style: Theme.of(context).textTheme.bodySmall),
      ],
    );
  }

  Widget _buildBadge({
    required IconData icon,
    required String label,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withValues(alpha: 0.4)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: color),
          const SizedBox(width: 4),
          Text(label, style: TextStyle(color: color, fontSize: 12, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}

class _DriverRowSkeleton extends StatelessWidget {
  const _DriverRowSkeleton();

  @override
  Widget build(BuildContext context) {
    return const Padding(
      padding: EdgeInsets.only(bottom: 12),
      child: Row(
        children: [
          CircleAvatar(radius: 20, backgroundColor: AppColors.lightBorder),
          SizedBox(width: 10),
          Text('...'),
        ],
      ),
    );
  }
}
