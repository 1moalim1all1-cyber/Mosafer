import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../providers/auth_providers.dart';
import '../../../core/routing/app_router.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/theme/app_colors.dart';

class SplashScreen extends ConsumerWidget {
  const SplashScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authStateChangesProvider);

    authState.whenData((user) {
      // بنستنى الفريم الحالي يخلص رسم نفسه الأول، وبعدين ننقل المستخدم -
      // ده بيمنع مشاكل تنقّل وسط عملية بناء الواجهة (Build).
      WidgetsBinding.instance.addPostFrameCallback((_) async {
        if (!context.mounted) return;
        if (user == null) {
          final prefs = await SharedPreferences.getInstance();
          final seenOnboarding = prefs.getBool(AppConstants.keyOnboardingSeen) ?? false;
          if (!context.mounted) return;
          context.go(seenOnboarding ? AppRoutes.login : AppRoutes.onboarding);
        } else {
          // التوجيه لاحقًا هيتفرّع حسب الدور (راكب/سائق) في Phase 3
          context.go(AppRoutes.home);
        }
      });
    });

    return const Scaffold(
      backgroundColor: AppColors.primary,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.directions_car_filled, color: Colors.white, size: 64),
            SizedBox(height: 16),
            Text(
              'مسافر',
              style: TextStyle(
                color: Colors.white,
                fontSize: 28,
                fontWeight: FontWeight.bold,
              ),
            ),
            SizedBox(height: 24),
            CircularProgressIndicator(color: AppColors.accent),
          ],
        ),
      ),
    );
  }
}
