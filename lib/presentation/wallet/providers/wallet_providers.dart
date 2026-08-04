import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../domain/repositories/wallet_repository.dart';
import '../../../data/repositories/wallet_repository_impl.dart';
import '../../auth/providers/auth_providers.dart';

final walletRepositoryProvider = Provider<WalletRepository>((ref) {
  return WalletRepositoryImpl();
});

final walletBalanceProvider = StreamProvider.autoDispose<double>((ref) {
  final user = ref.watch(currentUserProvider);
  if (user == null) return const Stream.empty();
  return ref.read(walletRepositoryProvider).watchBalance(user.uid);
});

final walletTransactionsProvider = StreamProvider.autoDispose((ref) {
  final user = ref.watch(currentUserProvider);
  if (user == null) return const Stream.empty();
  return ref.read(walletRepositoryProvider).watchTransactions(user.uid);
});

final walletActionLoadingProvider = StateProvider<bool>((ref) => false);
final walletActionErrorProvider = StateProvider<String?>((ref) => null);
