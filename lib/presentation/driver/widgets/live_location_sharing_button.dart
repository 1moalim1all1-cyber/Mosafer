import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';

import '../../trips/providers/trip_providers.dart';
import '../../../core/theme/app_colors.dart';

/// زرار عائم بيبدأ/يوقف مشاركة موقع السائق الحي مع الركاب أثناء الرحلة.
/// بيستخدم Geolocator.getPositionStream (بدل Timer دوري) عشان يبعت
/// تحديث بس لما السائق فعليًا يتحرك مسافة محسوسة (distanceFilter)،
/// ده بيوفّر بطارية وقراءات Firestore غير ضرورية.
class LiveLocationSharingButton extends ConsumerStatefulWidget {
  final String tripId;
  const LiveLocationSharingButton({super.key, required this.tripId});

  @override
  ConsumerState<LiveLocationSharingButton> createState() =>
      _LiveLocationSharingButtonState();
}

class _LiveLocationSharingButtonState
    extends ConsumerState<LiveLocationSharingButton> {
  StreamSubscription<Position>? _subscription;
  bool _isSharing = false;
  bool _isStarting = false;

  @override
  void dispose() {
    _subscription?.cancel();
    super.dispose();
  }

  Future<void> _toggleSharing() async {
    if (_isSharing) {
      await _subscription?.cancel();
      _subscription = null;
      await ref.read(tripRepositoryProvider).stopLiveLocation(widget.tripId);
      if (mounted) setState(() => _isSharing = false);
      return;
    }

    setState(() => _isStarting = true);
    try {
      var permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }
      if (permission == LocationPermission.deniedForever ||
          permission == LocationPermission.denied) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('محتاجين صلاحية الموقع عشان تشارك موقعك مع الراكب')),
          );
        }
        return;
      }

      const settings = LocationSettings(
        accuracy: LocationAccuracy.high,
        distanceFilter: 30, // تحديث كل ما يتحرك 30 متر تقريبًا
      );

      _subscription = Geolocator.getPositionStream(locationSettings: settings)
          .listen((position) {
        ref.read(tripRepositoryProvider).updateLiveLocation(
              tripId: widget.tripId,
              lat: position.latitude,
              lng: position.longitude,
            );
      });

      setState(() => _isSharing = true);
    } finally {
      if (mounted) setState(() => _isStarting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: _isSharing
            ? AppColors.success.withValues(alpha: 0.1)
            : AppColors.lightBackground,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: _isSharing ? AppColors.success : AppColors.lightBorder,
        ),
      ),
      child: Row(
        children: [
          Icon(
            _isSharing ? Icons.location_on : Icons.location_off_outlined,
            color: _isSharing ? AppColors.success : AppColors.lightTextSecondary,
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              _isSharing
                  ? 'موقعك بيتشارك مع الراكب دلوقتي'
                  : 'شارك موقعك الحي مع الراكب أثناء الرحلة',
              style: TextStyle(
                color: _isSharing ? AppColors.success : AppColors.lightTextSecondary,
                fontSize: 13,
              ),
            ),
          ),
          Switch(
            value: _isSharing,
            onChanged: _isStarting ? null : (_) => _toggleSharing(),
            activeThumbColor: AppColors.success,
          ),
        ],
      ),
    );
  }
}
