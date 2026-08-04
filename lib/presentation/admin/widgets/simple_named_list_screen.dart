import 'package:flutter/material.dart';

import '../../../core/theme/app_colors.dart';

class SimpleNamedItem {
  final String id;
  final String name;
  final bool isActive;
  const SimpleNamedItem({required this.id, required this.name, required this.isActive});
}

/// شاشة عامة لإدارة أي قائمة من الشكل (اسم + حالة تفعيل) - زي المحافظات
/// وأنواع السيارات. بتوفّر تكرار كتير لأن الشكل والمنطق متطابقين تمامًا.
class SimpleNamedListScreen extends StatelessWidget {
  final String title;
  final String addHint;
  final List<SimpleNamedItem> items;
  final Future<void> Function(String name) onAdd;
  final Future<void> Function(String id, String name, bool isActive) onUpdate;
  final Future<void> Function(String id) onDelete;

  const SimpleNamedListScreen({
    super.key,
    required this.title,
    required this.addHint,
    required this.items,
    required this.onAdd,
    required this.onUpdate,
    required this.onDelete,
  });

  Future<void> _showAddDialog(BuildContext context) async {
    final controller = TextEditingController();
    final name = await showDialog<String>(
      context: context,
      builder: (_) => AlertDialog(
        title: Text(addHint),
        content: TextField(controller: controller, autofocus: true),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('إلغاء'),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(controller.text.trim()),
            child: const Text('إضافة'),
          ),
        ],
      ),
    );
    if (name != null && name.isNotEmpty) {
      await onAdd(name);
    }
  }

  Future<void> _showEditDialog(BuildContext context, SimpleNamedItem item) async {
    final controller = TextEditingController(text: item.name);
    bool isActive = item.isActive;

    final result = await showDialog<bool>(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setState) => AlertDialog(
          title: const Text('تعديل'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(controller: controller, autofocus: true),
              SwitchListTile(
                title: const Text('مفعّل'),
                value: isActive,
                onChanged: (v) => setState(() => isActive = v),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(false),
              child: const Text('إلغاء'),
            ),
            TextButton(
              onPressed: () => Navigator.of(context).pop(true),
              child: const Text('حفظ'),
            ),
          ],
        ),
      ),
    );

    if (result == true && controller.text.trim().isNotEmpty) {
      await onUpdate(item.id, controller.text.trim(), isActive);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(title)),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showAddDialog(context),
        child: const Icon(Icons.add),
      ),
      body: items.isEmpty
          ? const Center(child: Text('القائمة فاضية دلوقتي'))
          : ListView.builder(
              itemCount: items.length,
              itemBuilder: (context, index) {
                final item = items[index];
                return ListTile(
                  title: Text(item.name),
                  leading: CircleAvatar(
                    backgroundColor: item.isActive
                        ? AppColors.success.withValues(alpha: 0.12)
                        : AppColors.lightBackground,
                    child: Icon(
                      item.isActive ? Icons.check : Icons.close,
                      color: item.isActive ? AppColors.success : AppColors.lightTextSecondary,
                    ),
                  ),
                  onTap: () => _showEditDialog(context, item),
                  trailing: IconButton(
                    icon: const Icon(Icons.delete_outline, color: AppColors.error),
                    onPressed: () => onDelete(item.id),
                  ),
                );
              },
            ),
    );
  }
}
