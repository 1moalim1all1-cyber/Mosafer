import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../providers/admin_providers.dart';
import '../widgets/simple_named_list_screen.dart';

class AdminGovernoratesScreen extends ConsumerWidget {
  const AdminGovernoratesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final governoratesAsync = ref.watch(adminGovernoratesProvider);
    final repo = ref.read(adminConfigRepositoryProvider);

    return governoratesAsync.when(
      loading: () => const Scaffold(body: Center(child: CircularProgressIndicator())),
      error: (_, __) => const Scaffold(body: Center(child: Text('حصل خطأ'))),
      data: (governorates) => SimpleNamedListScreen(
        title: 'إدارة المحافظات',
        addHint: 'اسم المحافظة',
        items: governorates
            .map((g) => SimpleNamedItem(id: g.id, name: g.name, isActive: g.isActive))
            .toList(),
        onAdd: (name) => repo.addGovernorate(name),
        onUpdate: (id, name, isActive) =>
            repo.updateGovernorate(id, name: name, isActive: isActive),
        onDelete: (id) => repo.deleteGovernorate(id),
      ),
    );
  }
}
