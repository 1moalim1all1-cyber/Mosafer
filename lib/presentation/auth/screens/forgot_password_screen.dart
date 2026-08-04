import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../admin/providers/admin_providers.dart';
import '../../../core/theme/app_colors.dart';

/// ملحوظة معمارية: بما إن التسجيل بقى برقم الموبايل (زي ما طلب المستخدم)
/// مش بريد إلكتروني حقيقي، خدمة "استرجاع كلمة المرور عبر رابط إيميل"
/// المدمجة في Firebase مبقتش تقدر تشتغل (البريد الداخلي المُولَّد من رقم
/// الهاتف مش صندوق حقيقي). الحل المؤقت هنا: توجيه واضح لدعم فني بشري،
/// لحد ما نضيف تحقق SMS OTP حقيقي في مرحلة لاحقة لو احتجناه.
class ForgotPasswordScreen extends ConsumerWidget {
  const ForgotPasswordScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final settingsAsync = ref.watch(adminAppSettingsProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('استعادة كلمة المرور')),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.support_agent_outlined, size: 64, color: AppColors.primary),
              const SizedBox(height: 20),
              Text(
                'تواصل مع الدعم لاستعادة حسابك',
                style: Theme.of(context).textTheme.titleLarge,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 10),
              Text(
                'بما إن حسابك مسجّل برقم الهاتف، فريق الدعم هيتأكد من هويتك ويساعدك '
                'تستعيد حسابك يدويًا لحد ما نفعّل الاستعادة الأوتوماتيكية قريبًا.',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyMedium,
              ),
              const SizedBox(height: 24),
              settingsAsync.when(
                loading: () => const CircularProgressIndicator(),
                error: (_, __) => const SizedBox.shrink(),
                data: (settings) {
                  final hasWhatsapp = (settings.whatsappNumber ?? '').isNotEmpty;
                  final hasEmail = settings.supportEmail.isNotEmpty;
                  if (!hasWhatsapp && !hasEmail) {
                    return const Text(
                      'تواصل مع فريق مسافر عبر وسائل التواصل في التطبيق',
                      style: TextStyle(color: AppColors.lightTextSecondary),
                    );
                  }
                  return Column(
                    children: [
                      if (hasWhatsapp)
                        _ContactRow(icon: Icons.chat, label: settings.whatsappNumber!),
                      if (hasEmail)
                        _ContactRow(icon: Icons.email_outlined, label: settings.supportEmail),
                    ],
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ContactRow extends StatelessWidget {
  final IconData icon;
  final String label;
  const _ContactRow({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 18, color: AppColors.primary),
          const SizedBox(width: 8),
          Text(label, style: Theme.of(context).textTheme.bodyMedium),
        ],
      ),
    );
  }
}
