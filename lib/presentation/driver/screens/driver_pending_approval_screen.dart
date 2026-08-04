import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../providers/driver_providers.dart';
import '../../shared/widgets/app_button.dart';
import '../../../domain/entities/driver_entity.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/routing/app_router.dart';

class DriverPendingApprovalScreen extends ConsumerWidget {
  const DriverPendingApprovalScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final statusAsync = ref.watch(driverStatusProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('حالة الاعتماد')),
      body: statusAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (_, __) => const Center(child: Text('حصل خطأ في تحميل الحالة')),
        data: (driver) {
          if (driver == null ||
              driver.verificationStatus == VerificationStatus.notSubmitted) {
            return _buildNotSubmitted(context);
          }

          switch (driver.verificationStatus) {
            case VerificationStatus.pending:
              return _buildPending(context);
            case VerificationStatus.approved:
              return _buildApproved(context);
            case VerificationStatus.rejected:
              return _buildRejected(context, driver.rejectionReason);
            case VerificationStatus.notSubmitted:
              return _buildNotSubmitted(context);
          }
        },
      ),
    );
  }

  Widget _buildNotSubmitted(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.upload_file, size: 64, color: AppColors.lightTextSecondary),
            const SizedBox(height: 16),
            const Text('لسه ما رفعتش مستنداتك'),
            const SizedBox(height: 20),
            AppButton(
              label: 'رفع المستندات دلوقتي',
              onPressed: () => context.go(AppRoutes.driverDocuments),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPending(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const CircularProgressIndicator(color: AppColors.warning),
            const SizedBox(height: 20),
            Text('مستنداتك تحت المراجعة', style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 8),
            const Text(
              'فريق مسافر بيراجع مستنداتك، عادةً بتاخد أقل من 24 ساعة، هتوصلك '
              'إشعار فور ما يتم الاعتماد',
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildApproved(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.check_circle, size: 64, color: AppColors.success),
            const SizedBox(height: 16),
            Text('تم اعتماد حسابك 🎉', style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 8),
            const Text('تقدر دلوقتي تنشر رحلاتك وتبدأ تكسب'),
            const SizedBox(height: 20),
            AppButton(
              label: 'الذهاب للوحة السائق',
              onPressed: () => context.go(AppRoutes.driverDashboard),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRejected(BuildContext context, String? reason) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.cancel_outlined, size: 64, color: AppColors.error),
            const SizedBox(height: 16),
            Text('للأسف مستنداتك اتراجعت', style: Theme.of(context).textTheme.titleLarge),
            if (reason != null) ...[
              const SizedBox(height: 8),
              Text(reason, textAlign: TextAlign.center),
            ],
            const SizedBox(height: 20),
            AppButton(
              label: 'إعادة رفع المستندات',
              onPressed: () => context.go(AppRoutes.driverDocuments),
            ),
          ],
        ),
      ),
    );
  }
}
