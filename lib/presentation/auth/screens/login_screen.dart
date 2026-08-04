import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl_phone_field/intl_phone_field.dart';

import '../providers/auth_providers.dart';
import '../../../data/repositories/auth_repository_impl.dart';
import '../../shared/widgets/app_text_field.dart';
import '../../shared/widgets/app_button.dart';
import '../../../core/routing/app_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/utils/phone_auth_helper.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _passwordController = TextEditingController();

  String _phoneNumber = '';

  @override
  void dispose() {
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    if (_phoneNumber.isEmpty || _phoneNumber.length < 8) {
      ref.read(authErrorProvider.notifier).state = 'من فضلك أدخل رقم هاتف صحيح';
      return;
    }

    ref.read(authLoadingProvider.notifier).state = true;
    ref.read(authErrorProvider.notifier).state = null;

    try {
      await ref.read(authRepositoryProvider).loginWithEmail(
            email: syntheticEmailFromPhone(_phoneNumber),
            password: _passwordController.text,
          );
      if (!mounted) return;
      context.go(AppRoutes.home);
    } on AuthException catch (e) {
      final message = e.message.contains('البريد الإلكتروني أو كلمة المرور')
          ? 'رقم الهاتف أو كلمة المرور غلط'
          : e.message;
      ref.read(authErrorProvider.notifier).state = message;
    } finally {
      if (mounted) ref.read(authLoadingProvider.notifier).state = false;
    }
  }

  @override
  Widget build(BuildContext context) {
    final isLoading = ref.watch(authLoadingProvider);
    final error = ref.watch(authErrorProvider);

    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 32),
                Container(
                  width: 84,
                  height: 84,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: const LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [AppColors.primary, AppColors.primaryLight],
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.primary.withValues(alpha: 0.3),
                        blurRadius: 20,
                        offset: const Offset(0, 8),
                      ),
                    ],
                  ),
                  child: const Icon(Icons.directions_car_filled_rounded,
                      color: Colors.white, size: 42),
                ),
                const SizedBox(height: 20),
                Text('أهلاً بيك تاني',
                    style: Theme.of(context).textTheme.headlineLarge),
                const SizedBox(height: 4),
                Text('سجّل دخولك وكمّل رحلتك',
                    style: Theme.of(context).textTheme.bodyMedium),
                const SizedBox(height: 32),
                Text('رقم الهاتف',
                    style: Theme.of(context).textTheme.labelLarge),
                const SizedBox(height: 8),
                IntlPhoneField(
                  initialCountryCode: 'EG',
                  decoration: const InputDecoration(border: OutlineInputBorder()),
                  onChanged: (phone) => _phoneNumber = phone.completeNumber,
                ),
                const SizedBox(height: 16),
                AppTextField(
                  controller: _passwordController,
                  label: 'كلمة المرور',
                  isPassword: true,
                  validator: (v) =>
                      (v == null || v.isEmpty) ? 'أدخل كلمة المرور' : null,
                ),
                Align(
                  alignment: Alignment.centerLeft,
                  child: TextButton(
                    onPressed: () => context.push(AppRoutes.forgotPassword),
                    child: const Text('نسيت كلمة المرور؟'),
                  ),
                ),
                if (error != null) ...[
                  const SizedBox(height: 8),
                  Text(error,
                      style: const TextStyle(color: AppColors.error)),
                ],
                const SizedBox(height: 20),
                AppButton(
                  label: 'تسجيل الدخول',
                  isLoading: isLoading,
                  onPressed: _submit,
                ),
                const SizedBox(height: 16),
                Center(
                  child: TextButton(
                    onPressed: () => context.push(AppRoutes.roleSelection),
                    child: const Text('معندكش حساب؟ سجّل دلوقتي'),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
