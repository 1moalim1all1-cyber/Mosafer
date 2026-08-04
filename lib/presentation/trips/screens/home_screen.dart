import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../providers/trip_providers.dart';
import '../../auth/providers/auth_providers.dart';
import '../../shared/widgets/app_button.dart';
import '../../notifications/providers/notification_providers.dart';
import '../../../core/routing/app_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../domain/entities/user_entity.dart';
import '../../../domain/entities/trip_search_params.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  @override
  Widget build(BuildContext context) {
    final params = ref.watch(searchParamsProvider);
    final currentUser = ref.watch(currentUserProvider);
    final isFemale = currentUser?.gender == Gender.female;

    return Scaffold(
      appBar: AppBar(
        title: const Text('فين رايح؟'),
        actions: [
          Consumer(
            builder: (context, ref, _) {
              final unreadAsync = ref.watch(unreadNotificationsCountProvider);
              final count = unreadAsync.maybeWhen(data: (c) => c, orElse: () => 0);
              return Stack(
                children: [
                  IconButton(
                    icon: const Icon(Icons.notifications_outlined),
                    onPressed: () => context.push(AppRoutes.notifications),
                  ),
                  if (count > 0)
                    Positioned(
                      right: 8,
                      top: 8,
                      child: Container(
                        padding: const EdgeInsets.all(3),
                        decoration: const BoxDecoration(
                          color: AppColors.error,
                          shape: BoxShape.circle,
                        ),
                        constraints: const BoxConstraints(minWidth: 16, minHeight: 16),
                        child: Text(
                          '$count',
                          style: const TextStyle(color: Colors.white, fontSize: 10),
                          textAlign: TextAlign.center,
                        ),
                      ),
                    ),
                ],
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.person_outline),
            onPressed: () => context.push(AppRoutes.profile),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildCitySelector(
              label: 'من',
              value: params.originCity,
              onChanged: (v) => ref.read(searchParamsProvider.notifier).state =
                  params.copyWith(originCity: v),
            ),
            const SizedBox(height: 12),
            _buildCitySelector(
              label: 'إلى',
              value: params.destinationCity,
              onChanged: (v) => ref.read(searchParamsProvider.notifier).state =
                  params.copyWith(destinationCity: v),
            ),
            const SizedBox(height: 12),
            _buildDatePicker(context, params),
            const SizedBox(height: 12),
            _buildSeatsStepper(params),
            const SizedBox(height: 20),

            // ---- فلاتر الميزات الخاصة ----
            _buildFilterSwitch(
              icon: Icons.recycling,
              label: 'راجع فاضي فقط',
              value: params.returnEmptyOnly,
              color: AppColors.returnEmptyTrip,
              onChanged: (v) => ref.read(searchParamsProvider.notifier).state =
                  params.copyWith(returnEmptyOnly: v),
            ),
            // فلتر "سيدات فقط" يظهر للراكبات فقط - نفس القاعدة المفروضة
            // في الاستعلام والـ Security Rules، هنا مجرد إخفاء غير مربك للرجالة.
            if (isFemale) ...[
              const SizedBox(height: 8),
              _buildFilterSwitch(
                icon: Icons.female,
                label: 'سيدات فقط',
                value: params.womenOnlyFilter,
                color: AppColors.womenOnly,
                onChanged: (v) => ref.read(searchParamsProvider.notifier).state =
                    params.copyWith(womenOnlyFilter: v),
              ),
            ],

            const SizedBox(height: 28),
            AppButton(
              label: 'ابحث عن رحلة',
              onPressed: params.originCity.isEmpty || params.destinationCity.isEmpty
                  ? null
                  : () => context.push(AppRoutes.searchResults),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCitySelector({
    required String label,
    required String value,
    required ValueChanged<String> onChanged,
  }) {
    final governorates = ref.watch(activeGovernorateNamesProvider);
    return DropdownButtonFormField<String>(
      initialValue: value.isEmpty ? null : value,
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: const Icon(Icons.location_on_outlined),
      ),
      items: governorates
          .map((c) => DropdownMenuItem(value: c, child: Text(c)))
          .toList(),
      onChanged: (v) => onChanged(v ?? ''),
    );
  }

  Widget _buildDatePicker(BuildContext context, TripSearchParams params) {
    final dateFormat = DateFormat('EEEE، d MMMM yyyy', 'ar');
    return InkWell(
      onTap: () async {
        final picked = await showDatePicker(
          context: context,
          initialDate: params.date,
          firstDate: DateTime.now(),
          lastDate: DateTime.now().add(const Duration(days: 90)),
        );
        if (picked != null) {
          ref.read(searchParamsProvider.notifier).state =
              params.copyWith(date: picked);
        }
      },
      child: InputDecorator(
        decoration: const InputDecoration(
          labelText: 'التاريخ',
          prefixIcon: Icon(Icons.calendar_today_outlined),
        ),
        child: Text(dateFormat.format(params.date)),
      ),
    );
  }

  Widget _buildSeatsStepper(TripSearchParams params) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        const Text('عدد الركاب'),
        Row(
          children: [
            IconButton(
              icon: const Icon(Icons.remove_circle_outline),
              onPressed: params.seatsNeeded > 1
                  ? () => ref.read(searchParamsProvider.notifier).state =
                      params.copyWith(seatsNeeded: params.seatsNeeded - 1)
                  : null,
            ),
            Text('${params.seatsNeeded}',
                style: Theme.of(context).textTheme.titleMedium),
            IconButton(
              icon: const Icon(Icons.add_circle_outline),
              onPressed: params.seatsNeeded < 8
                  ? () => ref.read(searchParamsProvider.notifier).state =
                      params.copyWith(seatsNeeded: params.seatsNeeded + 1)
                  : null,
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildFilterSwitch({
    required IconData icon,
    required String label,
    required bool value,
    required Color color,
    required ValueChanged<bool> onChanged,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
      decoration: BoxDecoration(
        border: Border.all(color: color.withValues(alpha: 0.3)),
        borderRadius: BorderRadius.circular(12),
      ),
      child: SwitchListTile(
        contentPadding: EdgeInsets.zero,
        secondary: Icon(icon, color: color),
        title: Text(label),
        value: value,
        activeThumbColor: color,
        onChanged: onChanged,
      ),
    );
  }
}
