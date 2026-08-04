import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../domain/entities/driver_entity.dart';
import '../../../domain/repositories/driver_repository.dart';
import '../../../data/repositories/driver_repository_impl.dart';
import '../../auth/providers/auth_providers.dart';

final driverRepositoryProvider = Provider<DriverRepository>((ref) {
  return DriverRepositoryImpl();
});

/// حالة اعتماد السائق الحالي (Stream حية عشان لو الأدمن وافق، الشاشة تتحدّث فورًا)
final driverStatusProvider = StreamProvider.autoDispose<DriverEntity?>((ref) {
  final user = ref.watch(currentUserProvider);
  if (user == null) return const Stream.empty();
  return ref.read(driverRepositoryProvider).watchDriverStatus(user.uid);
});

final driverDocsUploadLoadingProvider = StateProvider<bool>((ref) => false);
final driverDocsUploadErrorProvider = StateProvider<String?>((ref) => null);

final createTripLoadingProvider = StateProvider<bool>((ref) => false);
final createTripErrorProvider = StateProvider<String?>((ref) => null);

/// طابور السائقين بانتظار المراجعة - تستخدمها لوحة الإدارة (Phase 9)
final adminPendingDriversProvider =
    StreamProvider.autoDispose<List<DriverEntity>>((ref) {
  return ref.read(driverRepositoryProvider).watchPendingDrivers();
});
