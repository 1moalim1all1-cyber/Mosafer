import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../driver/providers/driver_providers.dart';
import '../../auth/providers/auth_providers.dart';
import '../../../core/theme/app_colors.dart';

class AdminDriverQueueScreen extends ConsumerWidget {
  const AdminDriverQueueScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final pendingAsync = ref.watch(adminPendingDriversProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('مراجعة السائقين')),
      body: pendingAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (_, __) => const Center(child: Text('حصل خطأ في تحميل الطابور')),
        data: (drivers) {
          if (drivers.isEmpty) {
            return const Center(child: Text('مفيش سائقين بانتظار المراجعة دلوقتي'));
          }
          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: drivers.length,
            itemBuilder: (context, index) {
              final driver = drivers[index];
              return Card(
                margin: const EdgeInsets.only(bottom: 10),
                child: ListTile(
                  onTap: () => context.push('/admin/drivers/${driver.uid}'),
                  leading: const CircleAvatar(
                    backgroundColor: AppColors.warning,
                    child: Icon(Icons.person_outline, color: Colors.white),
                  ),
                  title: Consumer(
                    builder: (context, ref, _) {
                      final userAsync = ref.watch(FutureProvider.autoDispose(
                        (ref) => ref.read(authRepositoryProvider).fetchUserProfile(driver.uid),
                      ));
                      return userAsync.when(
                        loading: () => const Text('جاري التحميل...'),
                        error: (_, __) => Text(driver.uid),
                        data: (u) => Text(u?.fullName ?? driver.uid),
                      );
                    },
                  ),
                  subtitle: Text(driver.vehicle != null
                      ? '${driver.vehicle!.make} ${driver.vehicle!.model}'
                      : 'بيانات السيارة ناقصة'),
                  trailing: const Icon(Icons.chevron_left),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
