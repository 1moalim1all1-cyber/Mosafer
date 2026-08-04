import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl_phone_field/intl_phone_field.dart';

import '../providers/auth_providers.dart';
import '../../../domain/entities/user_entity.dart';
import '../../../data/repositories/auth_repository_impl.dart';
import '../../shared/widgets/app_text_field.dart';
import '../../shared/widgets/app_button.dart';
import '../../../core/routing/app_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/utils/phone_auth_helper.dart';

class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({super.key});

  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _passwordController = TextEditingController();

  String _phoneNumber = '';
  Gender _gender = Gender.male;

  @override
  void dispose() {
    _nameController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    if (_phoneNumber.isEmpty || _phoneNumber.length < 8) {
      ref.read(authErrorProvider.notifier).state = 'من فضلك أدخل رقم هاتف صحيح';
      return;
    }

    final role = ref.read(selectedRoleProvider) ?? UserRole.passenger;

    ref.read(authLoadingProvider.notifier).state = true;
    ref.read(authErrorProvider.notifier).state = null;

    try {
      await ref.read(authRepositoryProvider).registerWithEmail(
            fullName: _nameController.text,
            email: syntheticEmailFromPhone(_phoneNumber),
            phone: _phoneNumber,
            password: _passwordController.text,
            role: role,
            gender: _gender,
          );

      if (!mounted) return;

      // السائق يتوجّه مباشرة لرفع مستندات الاعتماد، الراكب يدخل الرئيسية على طول
      if (role == UserRole.driver) {
        context.go(AppRoutes.driverDocuments);
      } else {
        context.go(AppRoutes.home);
      }
    } on AuthException catch (e) {
      final message = e.message.contains('مستخدم بالفعل')
          ? 'رقم الهاتف ده مسجّل بحساب بالفعل، جرّب تسجّل الدخول'
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
    final role = ref.watch(selectedRoleProvider) ?? UserRole.passenger;

    return Scaffold(
      appBar: AppBar(
        title: Text(role == UserRole.driver
            ? 'إنشاء حساب سائق'
            : 'إنشاء حساب راكب'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                AppTextField(
                  controller: _nameController,
                  label: 'الاسم بالكامل',
                  validator: (v) =>
                      (v == null || v.trim().length < 3) ? 'أدخل اسم صحيح' : null,
                ),
                const SizedBox(height: 16),
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
                  validator: (v) => (v == null || v.length < 6)
                      ? 'كلمة المرور 6 حروف على الأقل'
                      : null,
                ),
                const SizedBox(height: 20),
                Text('النوع', style: Theme.of(context).textTheme.labelLarge),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Expanded(
                      child: _GenderChip(
                        label: 'ذكر',
                        selected: _gender == Gender.male,
                        onTap: () => setState(() => _gender = Gender.male),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: _GenderChip(
                        label: 'أنثى',
                        selected: _gender == Gender.female,
                        onTap: () => setState(() => _gender = Gender.female),
                      ),
                    ),
                  ],
                ),
                if (error != null) ...[
                  const SizedBox(height: 16),
                  Text(error,
                      style: const TextStyle(color: AppColors.error)),
                ],
                const SizedBox(height: 28),
                AppButton(
                  label: 'إنشاء الحساب',
                  isLoading: isLoading,
                  onPressed: _submit,
                ),
                const SizedBox(height: 8),
                Center(
                  child: Wrap(
                    alignment: WrapAlignment.center,
                    children: [
                      const Text('بالتسجيل إنت موافق على '),
                      GestureDetector(
                        onTap: () => context.push('/page/terms'),
                        child: const Text('الشروط والأحكام',
                            style: TextStyle(
                                color: AppColors.primary, fontWeight: FontWeight.bold)),
                      ),
                      const Text(' و '),
                      GestureDetector(
                        onTap: () => context.push('/page/privacy'),
                        child: const Text('سياسة الخصوصية',
                            style: TextStyle(
                                color: AppColors.primary, fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 12),
                TextButton(
                  onPressed: () => context.go(AppRoutes.login),
                  child: const Text('عندك حساب بالفعل؟ سجّل الدخول'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _GenderChip extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onTap;

  const _GenderChip({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14),
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: selected
              ? AppColors.primary.withValues(alpha: 0.1)
              : Colors.transparent,
          border: Border.all(
            color: selected ? AppColors.primary : AppColors.lightBorder,
            width: selected ? 1.6 : 1,
          ),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Text(label),
      ),
    );
  }
}
