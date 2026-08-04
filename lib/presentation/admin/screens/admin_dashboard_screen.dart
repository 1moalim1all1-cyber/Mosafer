import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../providers/admin_providers.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/routing/app_router.dart';

class AdminDashboardScreen extends ConsumerWidget {
  const AdminDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final statsAsync = ref.watch(adminDashboardStatsProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('لوحة الإدارة')),
      body: RefreshIndicator(
        onRefresh: () async => ref.invalidate(adminDashboardStatsProvider),
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('نظرة عامة', style: Theme.of(context).textTheme.titleLarge),
              const SizedBox(height: 12),
              statsAsync.when(
                loading: () => const Center(child: CircularProgressIndicator()),
                error: (_, __) => const Text('تعذّر تحميل الإحصائيات'),
                data: (stats) => GridView.count(
                  crossAxisCount: 2,
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  mainAxisSpacing: 12,
                  crossAxisSpacing: 12,
                  childAspectRatio: 1.5,
                  children: [
                    _StatCard(
                        label: 'رحلات نشطة', value: stats.activeTrips, color: AppColors.success),
                    _StatCard(
                        label: 'سائقين بانتظار المراجعة',
                        value: stats.pendingDrivers,
                        color: AppColors.warning),
                    _StatCard(
                        label: 'حجوزات اليوم', value: stats.todayBookings, color: AppColors.info),
                    _StatCard(
                        label: 'إجمالي المستخدمين',
                        value: stats.totalUsers,
                        color: AppColors.primary),
                  ],
                ),
              ),
              const SizedBox(height: 28),
              Text('الإدارة', style: Theme.of(context).textTheme.titleLarge),
              const SizedBox(height: 12),
              _AdminMenuTile(
                icon: Icons.badge_outlined,
                title: 'مراجعة السائقين',
                onTap: () => context.push('/admin/drivers'),
              ),
              _AdminMenuTile(
                icon: Icons.account_balance_wallet_outlined,
                title: 'طلبات المحفظة',
                onTap: () => context.push('/admin/wallet-requests'),
              ),
              _AdminMenuTile(
                icon: Icons.map_outlined,
                title: 'المحافظات',
                onTap: () => context.push('/admin/governorates'),
              ),
              _AdminMenuTile(
                icon: Icons.directions_car_outlined,
                title: 'أنواع السيارات',
                onTap: () => context.push('/admin/car-types'),
              ),
              _AdminMenuTile(
                icon: Icons.local_offer_outlined,
                title: 'الكوبونات والعروض',
                onTap: () => context.push('/admin/coupons'),
              ),
              _AdminMenuTile(
                icon: Icons.settings_outlined,
                title: 'الإعدادات العامة',
                onTap: () => context.push('/admin/settings'),
              ),
              const SizedBox(height: 20),
              Center(
                child: TextButton(
                  onPressed: () => context.go(AppRoutes.home),
                  child: const Text('الخروج من لوحة الإدارة'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String label;
  final int value;
  final Color color;
  const _StatCard({required this.label, required this.value, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: color.withValues(alpha: 0.25)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text('$value',
              style: Theme.of(context)
                  .textTheme
                  .headlineLarge
                  ?.copyWith(color: color, fontWeight: FontWeight.bold)),
          const SizedBox(height: 4),
          Text(label, style: Theme.of(context).textTheme.bodySmall),
        ],
      ),
    );
  }
}

class _AdminMenuTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final VoidCallback onTap;
  const _AdminMenuTile({required this.icon, required this.title, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: Icon(icon, color: AppColors.primary),
        title: Text(title),
        trailing: const Icon(Icons.chevron_left),
        onTap: onTap,
      ),
    );
  }
}
