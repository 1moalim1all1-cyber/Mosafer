import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../driver/providers/driver_providers.dart';
import '../../auth/providers/auth_providers.dart';
import '../../shared/widgets/app_button.dart';
import '../../../core/theme/app_colors.dart';

class AdminDriverReviewScreen extends ConsumerStatefulWidget {
  final String driverId;
  const AdminDriverReviewScreen({super.key, required this.driverId});

  @override
  ConsumerState<AdminDriverReviewScreen> createState() =>
      _AdminDriverReviewScreenState();
}

class _AdminDriverReviewScreenState extends ConsumerState<AdminDriverReviewScreen> {
  bool _isLoading = false;

  Future<void> _approve() async {
    setState(() => _isLoading = true);
    try {
      await ref.read(driverRepositoryProvider).approveDriver(widget.driverId);
      if (mounted) context.pop();
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(const SnackBar(content: Text('حصل خطأ، حاول تاني')));
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _reject() async {
    final reasonController = TextEditingController();
    final reason = await showDialog<String>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('سبب الرفض'),
        content: TextField(
          controller: reasonController,
          decoration: const InputDecoration(hintText: 'مثال: صورة البطاقة غير واضحة'),
          maxLines: 3,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('إلغاء'),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(reasonController.text.trim()),
            child: const Text('رفض'),
          ),
        ],
      ),
    );
    if (reason == null || reason.isEmpty) return;

    setState(() => _isLoading = true);
    try {
      await ref.read(driverRepositoryProvider).rejectDriver(widget.driverId, reason);
      if (mounted) context.pop();
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(const SnackBar(content: Text('حصل خطأ، حاول تاني')));
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final userAsync = ref.watch(FutureProvider.autoDispose(
      (ref) => ref.read(authRepositoryProvider).fetchUserProfile(widget.driverId),
    ));

    return Scaffold(
      appBar: AppBar(title: const Text('مراجعة السائق')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            userAsync.when(
              loading: () => const CircularProgressIndicator(),
              error: (_, __) => const Text('تعذّر تحميل بيانات المستخدم'),
              data: (u) => Text(
                u?.fullName ?? widget.driverId,
                style: Theme.of(context).textTheme.headlineMedium,
              ),
            ),
            const SizedBox(height: 20),
            _DriverDocsGrid(driverId: widget.driverId),
            const SizedBox(height: 24),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: _isLoading ? null : _reject,
                    child: const Text('رفض'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: AppButton(
                    label: 'اعتماد السائق',
                    isLoading: _isLoading,
                    onPressed: _approve,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

/// عرض مصغّر لمستندات السائق - بيقرا من نفس الـ Provider اللي بيستخدمه
/// السائق نفسه لكن هنا بنطلب أي سائق عن طريق fetchUserProfile-جهة الأدمن.
class _DriverDocsGrid extends ConsumerWidget {
  final String driverId;
  const _DriverDocsGrid({required this.driverId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final driverAsync = ref.watch(
      FutureProvider.autoDispose((ref) => ref.read(driverRepositoryProvider).getDriverProfile(driverId)),
    );

    return driverAsync.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (_, __) => const Text('تعذّر تحميل المستندات'),
      data: (driver) {
        if (driver == null) return const Text('مفيش مستندات مرفوعة');

        final docs = <String, String?>{
          'بطاقة الرقم القومي': driver.nationalIdImageUrl,
          'رخصة القيادة': driver.licenseImageUrl,
          'رخصة السيارة': driver.vehicleLicenseImageUrl,
          'صورة السيارة': driver.vehicleImageUrl,
          'صورة التحقق الشخصي': driver.selfieVerificationUrl,
        };

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (driver.vehicle != null) ...[
              Text('بيانات السيارة', style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: 6),
              Text(
                '${driver.vehicle!.make} ${driver.vehicle!.model} - ${driver.vehicle!.year}\n'
                'اللون: ${driver.vehicle!.color} - اللوحة: ${driver.vehicle!.plateNumber}\n'
                'المقاعد: ${driver.vehicle!.seats}',
              ),
              const SizedBox(height: 16),
            ],
            Text('المستندات', style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 8),
            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              mainAxisSpacing: 10,
              crossAxisSpacing: 10,
              childAspectRatio: 1,
              children: docs.entries.map((entry) {
                final url = entry.value;
                return Column(
                  children: [
                    Expanded(
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(10),
                        child: url == null
                            ? Container(
                                color: AppColors.lightBackground,
                                child: const Icon(Icons.image_not_supported_outlined),
                              )
                            : Image.network(url, fit: BoxFit.cover, width: double.infinity),
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(entry.key, style: Theme.of(context).textTheme.bodySmall,
                        textAlign: TextAlign.center),
                  ],
                );
              }).toList(),
            ),
          ],
        );
      },
    );
  }
}
