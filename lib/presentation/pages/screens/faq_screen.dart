import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../providers/static_pages_providers.dart';

class FaqScreen extends ConsumerWidget {
  const FaqScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final faqAsync = ref.watch(faqItemsProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('الأسئلة الشائعة')),
      body: faqAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (_, __) => const Center(child: Text('حصل خطأ في تحميل الأسئلة')),
        data: (items) => ListView.builder(
          padding: const EdgeInsets.symmetric(vertical: 8),
          itemCount: items.length,
          itemBuilder: (context, index) {
            final item = items[index];
            return ExpansionTile(
              title: Text(item.question, style: Theme.of(context).textTheme.titleMedium),
              children: [
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                  child: Align(
                    alignment: Alignment.centerRight,
                    child: Text(item.answer, style: Theme.of(context).textTheme.bodyMedium),
                  ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}
