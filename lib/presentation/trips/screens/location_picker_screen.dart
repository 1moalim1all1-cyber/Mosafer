import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:geolocator/geolocator.dart';

import '../../shared/widgets/app_button.dart';
import '../../../core/theme/app_colors.dart';

/// نتيجة اختيار الموقع - إحداثيات دقيقة (خط الطول والعرض)
class PickedLocation {
  final double lat;
  final double lng;
  const PickedLocation({required this.lat, required this.lng});
}

/// شاشة خريطة تفاعلية حقيقية (OpenStreetMap عبر flutter_map) - المستخدم
/// يدوس على أي نقطة بالظبط أو يجيب موقعه الحالي، ويتأكد بزرار "تأكيد الموقع".
class LocationPickerScreen extends StatefulWidget {
  final LatLng? initialLocation;
  final String title;

  const LocationPickerScreen({
    super.key,
    this.initialLocation,
    this.title = 'حدد الموقع بالظبط',
  });

  @override
  State<LocationPickerScreen> createState() => _LocationPickerScreenState();
}

class _LocationPickerScreenState extends State<LocationPickerScreen> {
  late LatLng _selectedPoint;
  final MapController _mapController = MapController();
  bool _isLocating = false;

  // نقطة افتراضية في وسط مصر (القاهرة تقريبًا) لو مفيش موقع مبدئي
  static const LatLng _egyptCenter = LatLng(30.0444, 31.2357);

  @override
  void initState() {
    super.initState();
    _selectedPoint = widget.initialLocation ?? _egyptCenter;
  }

  Future<void> _useCurrentLocation() async {
    setState(() => _isLocating = true);
    try {
      var permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }
      if (permission == LocationPermission.deniedForever) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('صلاحية الموقع مرفوضة، فعّلها من إعدادات المتصفح/الجهاز')),
          );
        }
        return;
      }

      final position = await Geolocator.getCurrentPosition();
      final point = LatLng(position.latitude, position.longitude);
      setState(() => _selectedPoint = point);
      _mapController.move(point, 15);
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('تعذّر تحديد موقعك الحالي، اختار من الخريطة يدويًا')),
        );
      }
    } finally {
      if (mounted) setState(() => _isLocating = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(widget.title)),
      body: Stack(
        children: [
          FlutterMap(
            mapController: _mapController,
            options: MapOptions(
              initialCenter: _selectedPoint,
              initialZoom: 12,
              onTap: (tapPosition, point) {
                setState(() => _selectedPoint = point);
              },
            ),
            children: [
              TileLayer(
                // خرائط OpenStreetMap - مجانية بالكامل بدون أي بطاقة أو مفتاح API
                urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                userAgentPackageName: 'com.mosafer.app',
              ),
              MarkerLayer(
                markers: [
                  Marker(
                    point: _selectedPoint,
                    width: 50,
                    height: 50,
                    child: const Icon(
                      Icons.location_on,
                      color: AppColors.accent,
                      size: 50,
                    ),
                  ),
                ],
              ),
            ],
          ),

          // زرار "موقعي الحالي" عائم فوق الخريطة
          Positioned(
            top: 16,
            left: 16,
            child: FloatingActionButton.small(
              heroTag: 'locate_me',
              backgroundColor: Colors.white,
              onPressed: _isLocating ? null : _useCurrentLocation,
              child: _isLocating
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Icon(Icons.my_location, color: AppColors.primary),
            ),
          ),

          // شريط تأكيد سفلي بالإحداثيات والزرار
          Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            child: Container(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
              decoration: BoxDecoration(
                color: Theme.of(context).scaffoldBackgroundColor,
                borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.08),
                    blurRadius: 12,
                    offset: const Offset(0, -4),
                  ),
                ],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'الإحداثيات: ${_selectedPoint.latitude.toStringAsFixed(5)}, '
                    '${_selectedPoint.longitude.toStringAsFixed(5)}',
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                  const SizedBox(height: 12),
                  AppButton(
                    label: 'تأكيد الموقع',
                    onPressed: () => Navigator.of(context).pop(
                      PickedLocation(lat: _selectedPoint.latitude, lng: _selectedPoint.longitude),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
