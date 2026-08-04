import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../providers/auth_providers.dart';
import '../../../domain/entities/user_entity.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/routing/app_router.dart';

class RoleSelectionScreen extends ConsumerWidget {
  const RoleSelectionScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(title: const Text('هتستخدم مسافر كإيه؟')),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            const SizedBox(height: 12),
            Text(
              'اختار الدور المناسب، ممكن تضيف الدور التاني لاحقًا من إعدادات حسابك',
              style: Theme.of(context).textTheme.bodyMedium,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 32),
            _RoleCard(
              icon: Icons.person_outline,
              title: 'راكب',
              subtitle: 'دوّر على رحلة واحجز مقعدك',
              color: AppColors.primary,
              onTap: () {
                ref.read(selectedRoleProvider.notifier).state =
                    UserRole.passenger;
                context.push(AppRoutes.register);
              },
            ),
            const SizedBox(height: 16),
            _RoleCard(
              icon: Icons.directions_car_outlined,
              title: 'سائق',
              subtitle: 'شارك مقاعدك الفاضية واكسب دخل إضافي',
              color: AppColors.accent,
              onTap: () {
                ref.read(selectedRoleProvider.notifier).state =
                    UserRole.driver;
                context.push(AppRoutes.register);
              },
            ),
          ],
        ),
      ),
    );
  }
}

class _RoleCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final Color color;
  final VoidCallback onTap;

  const _RoleCard({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          border: Border.all(color: color.withValues(alpha: 0.3)),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Row(
          children: [
            CircleAvatar(
              radius: 26,
              backgroundColor: color.withValues(alpha: 0.12),
              child: Icon(icon, color: color),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: Theme.of(context).textTheme.titleLarge),
                  const SizedBox(height: 4),
                  Text(subtitle,
                      style: Theme.of(context).textTheme.bodySmall),
                ],
              ),
            ),
            const Icon(Icons.arrow_forward_ios, size: 16),
          ],
        ),
      ),
    );
  }
}
