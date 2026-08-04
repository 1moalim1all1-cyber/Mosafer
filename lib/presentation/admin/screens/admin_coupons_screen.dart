import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../providers/admin_providers.dart';
import '../../../domain/entities/admin_entities.dart';
import '../../../core/theme/app_colors.dart';

class AdminCouponsScreen extends ConsumerWidget {
  const AdminCouponsScreen({super.key});

  Future<void> _showCouponDialog(
    BuildContext context,
    WidgetRef ref, {
    CouponEntity? existing,
  }) async {
    final codeController = TextEditingController(text: existing?.code ?? '');
    final valueController =
        TextEditingController(text: existing?.value.toString() ?? '');
    final maxUsesController =
        TextEditingController(text: existing?.maxUses.toString() ?? '100');
    var discountType = existing?.discountType ?? CouponDiscountType.percentage;

    final saved = await showDialog<bool>(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setState) => AlertDialog(
          title: Text(existing == null ? 'كوبون جديد' : 'تعديل الكوبون'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: codeController,
                decoration: const InputDecoration(labelText: 'كود الكوبون'),
                textCapitalization: TextCapitalization.characters,
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<CouponDiscountType>(
                initialValue: discountType,
                decoration: const InputDecoration(labelText: 'نوع الخصم'),
                items: const [
                  DropdownMenuItem(
                      value: CouponDiscountType.percentage, child: Text('نسبة مئوية %')),
                  DropdownMenuItem(
                      value: CouponDiscountType.fixed, child: Text('مبلغ ثابت ج.م')),
                ],
                onChanged: (v) => setState(() => discountType = v!),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: valueController,
                decoration: const InputDecoration(labelText: 'قيمة الخصم'),
                keyboardType: TextInputType.number,
              ),
              const SizedBox(height: 12),
              TextField(
                controller: maxUsesController,
                decoration: const InputDecoration(labelText: 'أقصى عدد استخدامات'),
                keyboardType: TextInputType.number,
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(false),
              child: const Text('إلغاء'),
            ),
            TextButton(
              onPressed: () => Navigator.of(context).pop(true),
              child: const Text('حفظ'),
            ),
          ],
        ),
      ),
    );

    if (saved != true) return;
    final repo = ref.read(adminConfigRepositoryProvider);
    final coupon = CouponEntity(
      id: existing?.id ?? '',
      code: codeController.text.trim(),
      discountType: discountType,
      value: double.tryParse(valueController.text) ?? 0,
      maxUses: int.tryParse(maxUsesController.text) ?? 100,
      usedCount: existing?.usedCount ?? 0,
      isActive: existing?.isActive ?? true,
    );

    if (existing == null) {
      await repo.addCoupon(coupon);
    } else {
      await repo.updateCoupon(coupon);
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final couponsAsync = ref.watch(adminCouponsProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('الكوبونات والعروض')),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showCouponDialog(context, ref),
        child: const Icon(Icons.add),
      ),
      body: couponsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (_, __) => const Center(child: Text('حصل خطأ')),
        data: (coupons) {
          if (coupons.isEmpty) {
            return const Center(child: Text('لسه مفيش كوبونات'));
          }
          return ListView.builder(
            itemCount: coupons.length,
            itemBuilder: (context, index) {
              final c = coupons[index];
              final discountLabel = c.discountType == CouponDiscountType.percentage
                  ? '${c.value.toStringAsFixed(0)}%'
                  : '${c.value.toStringAsFixed(0)} ج.م';
              return ListTile(
                onTap: () => _showCouponDialog(context, ref, existing: c),
                leading: CircleAvatar(
                  backgroundColor: c.isActive
                      ? AppColors.accent.withValues(alpha: 0.12)
                      : AppColors.lightBackground,
                  child: const Icon(Icons.local_offer_outlined),
                ),
                title: Text(c.code),
                subtitle: Text('خصم $discountLabel · استخدم ${c.usedCount}/${c.maxUses}'),
                trailing: IconButton(
                  icon: const Icon(Icons.delete_outline, color: AppColors.error),
                  onPressed: () => ref.read(adminConfigRepositoryProvider).deleteCoupon(c.id),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
