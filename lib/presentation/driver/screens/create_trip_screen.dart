import 'package:latlong2/latlong.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../providers/driver_providers.dart';
import '../../trips/providers/trip_providers.dart';
import '../../trips/screens/location_picker_screen.dart';
import '../../auth/providers/auth_providers.dart';
import '../../shared/widgets/app_text_field.dart';
import '../../shared/widgets/app_button.dart';
import '../../../domain/entities/trip_entity.dart';
import '../../../domain/entities/user_entity.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/routing/app_router.dart';

class CreateTripScreen extends ConsumerStatefulWidget {
  const CreateTripScreen({super.key});

  @override
  ConsumerState<CreateTripScreen> createState() => _CreateTripScreenState();
}

class _CreateTripScreenState extends ConsumerState<CreateTripScreen> {
  String? _originCity;
  String? _destinationCity;
  LatLng? _originPoint;
  LatLng? _destinationPoint;
  DateTime _departureTime = DateTime.now().add(const Duration(hours: 2));

  final _priceController = TextEditingController();
  final _seatsController = TextEditingController(text: '3');
  final _durationController = TextEditingController(text: '60');

  bool _isReturnEmptyTrip = false;
  bool _isWomenOnly = false;

  Future<void> _pickLocation({required bool isOrigin}) async {
    final initial = isOrigin ? _originPoint : _destinationPoint;
    final result = await Navigator.of(context).push<PickedLocation>(
      MaterialPageRoute(
        builder: (_) => LocationPickerScreen(
          title: isOrigin ? 'حدد نقطة الانطلاق بالظبط' : 'حدد نقطة الوصول بالظبط',
          initialLocation: initial,
        ),
      ),
    );
    if (result == null) return;
    setState(() {
      final point = LatLng(result.lat, result.lng);
      if (isOrigin) {
        _originPoint = point;
      } else {
        _destinationPoint = point;
      }
    });
  }

  Future<void> _pickDateTime() async {
    final date = await showDatePicker(
      context: context,
      initialDate: _departureTime,
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 90)),
    );
    if (date == null || !mounted) return;

    final time = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.fromDateTime(_departureTime),
    );
    if (time == null) return;

    setState(() {
      _departureTime =
          DateTime(date.year, date.month, date.day, time.hour, time.minute);
    });
  }

  Future<void> _submit() async {
    if (_originCity == null || _destinationCity == null) {
      ref.read(createTripErrorProvider.notifier).state = 'اختار نقطة الانطلاق والوصول';
      return;
    }
    if (_originCity == _destinationCity) {
      ref.read(createTripErrorProvider.notifier).state =
          'نقطة الانطلاق والوصول لازم يكونوا مختلفين';
      return;
    }
    if (_originPoint == null || _destinationPoint == null) {
      ref.read(createTripErrorProvider.notifier).state =
          'حدد نقطتي الانطلاق والوصول بالظبط من الخريطة';
      return;
    }
    final price = double.tryParse(_priceController.text);
    final seats = int.tryParse(_seatsController.text);
    if (price == null || price <= 0) {
      ref.read(createTripErrorProvider.notifier).state = 'أدخل سعر صحيح للمقعد';
      return;
    }
    if (seats == null || seats <= 0) {
      ref.read(createTripErrorProvider.notifier).state = 'أدخل عدد مقاعد صحيح';
      return;
    }

    final user = ref.read(currentUserProvider);
    if (user == null) return;

    ref.read(createTripLoadingProvider.notifier).state = true;
    ref.read(createTripErrorProvider.notifier).state = null;

    try {
      final trip = TripEntity(
        id: '',
        driverId: user.uid,
        status: TripStatus.active,
        originCity: _originCity!,
        originGovernorate: _originCity!,
        originLat: _originPoint!.latitude,
        originLng: _originPoint!.longitude,
        destinationCity: _destinationCity!,
        destinationGovernorate: _destinationCity!,
        destinationLat: _destinationPoint!.latitude,
        destinationLng: _destinationPoint!.longitude,
        departureTime: _departureTime,
        estimatedDurationMinutes: int.tryParse(_durationController.text) ?? 60,
        pricePerSeat: price,
        totalSeats: seats,
        availableSeats: seats,
        isReturnEmptyTrip: _isReturnEmptyTrip,
        isWomenOnly: _isWomenOnly,
        carType: 'اقتصادية',
      );

      await ref.read(tripRepositoryProvider).createTrip(trip);

      if (!mounted) return;
      context.go(AppRoutes.driverDashboard);
    } catch (_) {
      ref.read(createTripErrorProvider.notifier).state = 'حصل خطأ أثناء نشر الرحلة';
    } finally {
      if (mounted) ref.read(createTripLoadingProvider.notifier).state = false;
    }
  }

  @override
  Widget build(BuildContext context) {
    final isLoading = ref.watch(createTripLoadingProvider);
    final error = ref.watch(createTripErrorProvider);
    final currentUser = ref.watch(currentUserProvider);
    final isFemaleDriver = currentUser?.gender == Gender.female;
    final governorates = ref.watch(activeGovernorateNamesProvider);
    final dateFormat = DateFormat('EEEE d MMMM - hh:mm a', 'ar');

    return Scaffold(
      appBar: AppBar(title: const Text('إنشاء رحلة جديدة')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            DropdownButtonFormField<String>(
              initialValue: _originCity,
              decoration: const InputDecoration(labelText: 'من'),
              items: governorates
                  .map((c) => DropdownMenuItem(value: c, child: Text(c)))
                  .toList(),
              onChanged: (v) => setState(() => _originCity = v),
            ),
            const SizedBox(height: 8),
            _MapPickButton(
              isSelected: _originPoint != null,
              onTap: () => _pickLocation(isOrigin: true),
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              initialValue: _destinationCity,
              decoration: const InputDecoration(labelText: 'إلى'),
              items: governorates
                  .map((c) => DropdownMenuItem(value: c, child: Text(c)))
                  .toList(),
              onChanged: (v) => setState(() => _destinationCity = v),
            ),
            const SizedBox(height: 8),
            _MapPickButton(
              isSelected: _destinationPoint != null,
              onTap: () => _pickLocation(isOrigin: false),
            ),
            const SizedBox(height: 16),
            InkWell(
              onTap: _pickDateTime,
              child: InputDecorator(
                decoration: const InputDecoration(labelText: 'وقت الانطلاق'),
                child: Text(dateFormat.format(_departureTime)),
              ),
            ),
            const SizedBox(height: 12),
            AppTextField(
              controller: _priceController,
              label: 'السعر للمقعد الواحد (ج.م)',
              keyboardType: TextInputType.number,
            ),
            const SizedBox(height: 12),
            AppTextField(
              controller: _seatsController,
              label: 'عدد المقاعد المتاحة',
              keyboardType: TextInputType.number,
            ),
            const SizedBox(height: 12),
            AppTextField(
              controller: _durationController,
              label: 'المدة المتوقعة (دقيقة)',
              keyboardType: TextInputType.number,
            ),

            const SizedBox(height: 20),
            _buildToggle(
              icon: Icons.recycling,
              label: 'راجع فاضي',
              subtitle: 'سعر مخفض لرحلة عودة بمقاعد فاضية',
              value: _isReturnEmptyTrip,
              color: AppColors.returnEmptyTrip,
              onChanged: (v) => setState(() => _isReturnEmptyTrip = v),
            ),

            // فلتر "سيدات فقط" متاح للسائقات فقط - نفس القاعدة المفروضة
            // في البحث وفي Firestore Rules.
            if (isFemaleDriver) ...[
              const SizedBox(height: 12),
              _buildToggle(
                icon: Icons.female,
                label: 'رحلة سيدات فقط',
                subtitle: 'هتظهر للراكبات الإناث فقط',
                value: _isWomenOnly,
                color: AppColors.womenOnly,
                onChanged: (v) => setState(() => _isWomenOnly = v),
              ),
            ],

            if (error != null) ...[
              const SizedBox(height: 16),
              Text(error, style: const TextStyle(color: AppColors.error)),
            ],

            const SizedBox(height: 24),
            AppButton(
              label: 'نشر الرحلة',
              isLoading: isLoading,
              onPressed: _submit,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildToggle({
    required IconData icon,
    required String label,
    required String subtitle,
    required bool value,
    required Color color,
    required ValueChanged<bool> onChanged,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14),
      decoration: BoxDecoration(
        border: Border.all(color: color.withValues(alpha: 0.3)),
        borderRadius: BorderRadius.circular(12),
      ),
      child: SwitchListTile(
        contentPadding: EdgeInsets.zero,
        secondary: Icon(icon, color: color),
        title: Text(label),
        subtitle: Text(subtitle),
        value: value,
        activeThumbColor: color,
        onChanged: onChanged,
      ),
    );
  }
}

class _MapPickButton extends StatelessWidget {
  final bool isSelected;
  final VoidCallback onTap;
  const _MapPickButton({required this.isSelected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(10),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        decoration: BoxDecoration(
          color: isSelected
              ? AppColors.success.withValues(alpha: 0.08)
              : AppColors.lightBackground,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: isSelected ? AppColors.success : AppColors.lightBorder,
          ),
        ),
        child: Row(
          children: [
            Icon(
              isSelected ? Icons.check_circle : Icons.map_outlined,
              size: 18,
              color: isSelected ? AppColors.success : AppColors.primary,
            ),
            const SizedBox(width: 8),
            Text(
              isSelected ? 'اتحدد بالظبط من الخريطة ✓' : 'حدد الموقع بالظبط من الخريطة',
              style: TextStyle(
                fontSize: 13,
                color: isSelected ? AppColors.success : AppColors.primary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
