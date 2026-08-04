import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../domain/entities/trip_entity.dart';
import '../../../core/theme/app_colors.dart';

class TripCard extends StatelessWidget {
  final TripEntity trip;
  final VoidCallback onTap;

  const TripCard({super.key, required this.trip, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final timeFormat = DateFormat('hh:mm a', 'ar');

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(14),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ---- شارات "راجع فاضي" و"سيدات فقط" — لازم تُقرأ من نظرة سريعة ----
              if (trip.isReturnEmptyTrip || trip.isWomenOnly)
                Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: Row(
                    children: [
                      if (trip.isReturnEmptyTrip) _buildBadge(
                        icon: Icons.recycling,
                        label: 'راجع فاضي',
                        color: AppColors.returnEmptyTrip,
                      ),
                      if (trip.isReturnEmptyTrip && trip.isWomenOnly)
                        const SizedBox(width: 8),
                      if (trip.isWomenOnly) _buildBadge(
                        icon: Icons.female,
                        label: 'سيدات فقط',
                        color: AppColors.womenOnly,
                      ),
                    ],
                  ),
                ),

              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(timeFormat.format(trip.departureTime),
                          style: Theme.of(context).textTheme.titleLarge),
                      Text('${trip.originCity} → ${trip.destinationCity}',
                          style: Theme.of(context).textTheme.bodyMedium),
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
                            ?.copyWith(color: AppColors.accent),
                      ),
                      Text('للمقعد', style: Theme.of(context).textTheme.bodySmall),
                    ],
                  ),
                ],
              ),
              const Divider(height: 20),
              Row(
                children: [
                  Icon(Icons.event_seat, size: 16, color: Theme.of(context).textTheme.bodySmall?.color),
                  const SizedBox(width: 4),
                  Text('${trip.availableSeats} مقاعد متاحة',
                      style: Theme.of(context).textTheme.bodySmall),
                  const SizedBox(width: 16),
                  Icon(Icons.directions_car, size: 16, color: Theme.of(context).textTheme.bodySmall?.color),
                  const SizedBox(width: 4),
                  Text(trip.carType, style: Theme.of(context).textTheme.bodySmall),
                ],
              ),
            ],
          ),
        ),
      ),
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
