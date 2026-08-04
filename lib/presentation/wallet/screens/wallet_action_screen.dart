import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../providers/wallet_providers.dart';
import '../../auth/providers/auth_providers.dart';
import '../../shared/widgets/app_text_field.dart';
import '../../shared/widgets/app_button.dart';
import '../../../core/theme/app_colors.dart';

enum WalletActionType { deposit, withdraw }

class WalletActionScreen extends ConsumerStatefulWidget {
  final WalletActionType actionType;
  const WalletActionScreen({super.key, required this.actionType});

  @override
  ConsumerState<WalletActionScreen> createState() => _WalletActionScreenState();
}

class _WalletActionScreenState extends ConsumerState<WalletActionScreen> {
  final _amountController = TextEditingController();
  bool _submitted = false;

  bool get _isDeposit => widget.actionType == WalletActionType.deposit;

  Future<void> _submit() async {
    final amount = double.tryParse(_amountController.text);
    if (amount == null || amount <= 0) {
      ref.read(walletActionErrorProvider.notifier).state = 'أدخل مبلغ صحيح';
      return;
    }

    final user = ref.read(currentUserProvider);
    if (user == null) return;

    ref.read(walletActionLoadingProvider.notifier).state = true;
    ref.read(walletActionErrorProvider.notifier).state = null;

    try {
      if (_isDeposit) {
        await ref
            .read(walletRepositoryProvider)
            .requestDeposit(uid: user.uid, amount: amount);
      } else {
        await ref
            .read(walletRepositoryProvider)
            .requestWithdraw(uid: user.uid, amount: amount);
      }
      setState(() => _submitted = true);
    } catch (_) {
      ref.read(walletActionErrorProvider.notifier).state = 'حصل خطأ، حاول تاني';
    } finally {
      if (mounted) ref.read(walletActionLoadingProvider.notifier).state = false;
    }
  }

  @override
  Widget build(BuildContext context) {
    final isLoading = ref.watch(walletActionLoadingProvider);
    final error = ref.watch(walletActionErrorProvider);

    return Scaffold(
      appBar: AppBar(title: Text(_isDeposit ? 'إيداع في المحفظة' : 'سحب من المحفظة')),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: _submitted ? _buildSuccess(context) : _buildForm(isLoading, error),
      ),
    );
  }

  Widget _buildForm(bool isLoading, String? error) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // ---- ملحوظة صريحة: مفيش بوابة دفع حقيقية متصلة لسه ----
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: AppColors.info.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Text(
            _isDeposit
                ? 'الطلب هيتراجع من فريق مسافر ويتحول لرصيدك بعد التأكيد يدويًا '
                  'لحد ما بوابة الدفع الإلكتروني تتفعّل بالكامل'
                : 'طلب السحب هيتراجع ويوصلك المبلغ بعد الموافقة',
            style: Theme.of(context).textTheme.bodySmall,
          ),
        ),
        const SizedBox(height: 20),
        AppTextField(
          controller: _amountController,
          label: 'المبلغ (ج.م)',
          keyboardType: TextInputType.number,
        ),
        if (error != null) ...[
          const SizedBox(height: 12),
          Text(error, style: const TextStyle(color: AppColors.error)),
        ],
        const SizedBox(height: 24),
        AppButton(
          label: _isDeposit ? 'إرسال طلب الإيداع' : 'إرسال طلب السحب',
          isLoading: isLoading,
          onPressed: _submit,
        ),
      ],
    );
  }

  Widget _buildSuccess(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.check_circle_outline, size: 56, color: AppColors.success),
          const SizedBox(height: 16),
          Text('تم إرسال طلبك بنجاح', style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 8),
          const Text('هيتراجع الطلب وتوصلك النتيجة في سجل عمليات المحفظة'),
          const SizedBox(height: 20),
          TextButton(
            onPressed: () => context.pop(),
            child: const Text('رجوع للمحفظة'),
          ),
        ],
      ),
    );
  }
}
