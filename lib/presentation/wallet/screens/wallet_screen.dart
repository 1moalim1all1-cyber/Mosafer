import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../providers/wallet_providers.dart';
import '../widgets/wallet_transaction_tile.dart';
import '../../shared/widgets/app_button.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/routing/app_router.dart';
import '../../shared/widgets/app_bottom_nav.dart';

class WalletScreen extends ConsumerWidget {
  const WalletScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final balanceAsync = ref.watch(walletBalanceProvider);
    final transactionsAsync = ref.watch(walletTransactionsProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('المحفظة')),
      bottomNavigationBar: const AppBottomNav(currentIndex: 2),
      body: Column(
        children: [
          Container(
            width: double.infinity,
            margin: const EdgeInsets.all(20),
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [AppColors.primary, AppColors.primaryLight],
                begin: Alignment.topRight,
                end: Alignment.bottomLeft,
              ),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('الرصيد الحالي',
                    style: TextStyle(color: Colors.white70, fontSize: 14)),
                const SizedBox(height: 8),
                balanceAsync.when(
                  loading: () => const SizedBox(
                    height: 32,
                    width: 32,
                    child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                  ),
                  error: (_, __) => const Text('--',
                      style: TextStyle(color: Colors.white, fontSize: 32)),
                  data: (balance) => Text(
                    '${balance.toStringAsFixed(0)} ج.م',
                    style: const TextStyle(
                        color: Colors.white, fontSize: 32, fontWeight: FontWeight.bold),
                  ),
                ),
                const SizedBox(height: 20),
                Row(
                  children: [
                    Expanded(
                      child: AppButton(
                        label: 'إيداع',
                        outlined: true,
                        onPressed: () => context.push(AppRoutes.walletDeposit),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: AppButton(
                        label: 'سحب',
                        outlined: true,
                        onPressed: () => context.push(AppRoutes.walletWithdraw),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Align(
              alignment: Alignment.centerRight,
              child: Text('سجل العمليات',
                  style: Theme.of(context).textTheme.titleMedium),
            ),
          ),
          const SizedBox(height: 8),
          Expanded(
            child: transactionsAsync.when(
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (_, __) => const Center(child: Text('حصل خطأ في تحميل العمليات')),
              data: (transactions) {
                if (transactions.isEmpty) {
                  return const Center(child: Text('لسه مفيش عمليات على محفظتك'));
                }
                return ListView.builder(
                  itemCount: transactions.length,
                  itemBuilder: (context, index) =>
                      WalletTransactionTile(transaction: transactions[index]),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
