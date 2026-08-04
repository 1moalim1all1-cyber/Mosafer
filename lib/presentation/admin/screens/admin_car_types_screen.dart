import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../providers/admin_providers.dart';
import '../widgets/simple_named_list_screen.dart';

class AdminCarTypesScreen extends ConsumerWidget {
  const AdminCarTypesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final carTypesAsync = ref.watch(adminCarTypesProvider);
    final repo = ref.read(adminConfigRepositoryProvider);

    return carTypesAsync.when(
      loading: () => const Scaffold(body: Center(child: CircularProgressIndicator())),
      error: (_, __) => const Scaffold(body: Center(child: Text('حصل خطأ'))),
      data: (carTypes) => SimpleNamedListScreen(
        title: 'إدارة أنواع السيارات',
        addHint: 'اسم نوع السيارة (مثال: اقتصادية)',
        items: carTypes
            .map((c) => SimpleNamedItem(id: c.id, name: c.name, isActive: c.isActive))
            .toList(),
        onAdd: (name) => repo.addCarType(name),
        onUpdate: (id, name, isActive) =>
            repo.updateCarType(id, name: name, isActive: isActive),
        onDelete: (id) => repo.deleteCarType(id),
      ),
    );
  }
}
