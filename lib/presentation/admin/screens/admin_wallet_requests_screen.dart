import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../wallet/providers/wallet_providers.dart';
import '../../auth/providers/auth_providers.dart';
import '../../../domain/entities/wallet_transaction_entity.dart';
import '../../../core/theme/app_colors.dart';

final _adminPendingWalletRequestsProvider =
    StreamProvider.autoDispose<List<AdminWalletRequest>>((ref) {
  return ref.read(walletRepositoryProvider).watchPendingRequestsForAdmin();
});

class AdminWalletRequestsScreen extends ConsumerWidget {
  const AdminWalletRequestsScreen({super.key});

  Future<void> _resolve(
    WidgetRef ref,
    BuildContext context,
    AdminWalletRequest request,
    bool approve,
  ) async {
    try {
      await ref.read(walletRepositoryProvider).resolveRequest(
            userId: request.userId,
            transactionId: request.transaction.id,
            approve: approve,
          );
    } catch (_) {
      if (context.mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(const SnackBar(content: Text('حصل خطأ، حاول تاني')));
      }
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final requestsAsync = ref.watch(_adminPendingWalletRequestsProvider);
    final dateFormat = DateFormat('d MMM - hh:mm a', 'ar');

    return Scaffold(
      appBar: AppBar(title: const Text('طلبات المحفظة')),
      body: requestsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (_, __) => const Center(child: Text('حصل خطأ في تحميل الطلبات')),
        data: (requests) {
          if (requests.isEmpty) {
            return const Center(child: Text('مفيش طلبات معلّقة دلوقتي'));
          }
          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: requests.length,
            itemBuilder: (context, index) {
              final r = requests[index];
              final isDeposit = r.transaction.type == WalletTransactionType.deposit;

              return Card(
                margin: const EdgeInsets.only(bottom: 10),
                child: Padding(
                  padding: const EdgeInsets.all(14),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Consumer(
                            builder: (context, ref, _) {
                              final userAsync = ref.watch(FutureProvider.autoDispose(
                                (ref) => ref
                                    .read(authRepositoryProvider)
                                    .fetchUserProfile(r.userId),
                              ));
                              return userAsync.when(
                                loading: () => const Text('...'),
                                error: (_, __) => Text(r.userId),
                                data: (u) => Text(u?.fullName ?? r.userId,
                                    style: Theme.of(context).textTheme.titleMedium),
                              );
                            },
                          ),
                          Container(
                            padding:
                                const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: (isDeposit ? AppColors.success : AppColors.warning)
                                  .withValues(alpha: 0.12),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              isDeposit ? 'إيداع' : 'سحب',
                              style: TextStyle(
                                color: isDeposit ? AppColors.success : AppColors.warning,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Text(
                        '${r.transaction.amount.toStringAsFixed(0)} ج.م',
                        style: Theme.of(context).textTheme.headlineMedium,
                      ),
                      Text(dateFormat.format(r.transaction.createdAt),
                          style: Theme.of(context).textTheme.bodySmall),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Expanded(
                            child: OutlinedButton(
                              onPressed: () => _resolve(ref, context, r, false),
                              child: const Text('رفض'),
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: ElevatedButton(
                              onPressed: () => _resolve(ref, context, r, true),
                              child: const Text('اعتماد'),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
