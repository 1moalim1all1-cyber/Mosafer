import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../domain/entities/admin_entities.dart';
import '../../../domain/repositories/admin_config_repository.dart';
import '../../../data/repositories/admin_config_repository_impl.dart';

final adminConfigRepositoryProvider = Provider<AdminConfigRepository>((ref) {
  return AdminConfigRepositoryImpl();
});

final adminDashboardStatsProvider =
    FutureProvider.autoDispose<AdminDashboardStats>((ref) {
  return ref.read(adminConfigRepositoryProvider).fetchDashboardStats();
});

final adminGovernoratesProvider =
    StreamProvider.autoDispose<List<GovernorateEntity>>((ref) {
  return ref.read(adminConfigRepositoryProvider).watchGovernorates();
});

final adminCarTypesProvider = StreamProvider.autoDispose<List<CarTypeEntity>>((ref) {
  return ref.read(adminConfigRepositoryProvider).watchCarTypes();
});

final adminCouponsProvider = StreamProvider.autoDispose<List<CouponEntity>>((ref) {
  return ref.read(adminConfigRepositoryProvider).watchCoupons();
});

final adminAppSettingsProvider = StreamProvider.autoDispose<AppSettingsEntity>((ref) {
  return ref.read(adminConfigRepositoryProvider).watchAppSettings();
});
