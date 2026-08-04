import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../providers/static_pages_providers.dart';

class StaticPageScreen extends ConsumerWidget {
  final String pageId;
  const StaticPageScreen({super.key, required this.pageId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final pageAsync = ref.watch(staticPageProvider(pageId));

    return Scaffold(
      appBar: AppBar(
        title: pageAsync.maybeWhen(
          data: (page) => Text(page.title),
          orElse: () => const Text(''),
        ),
      ),
      body: pageAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (_, __) => const Center(child: Text('حصل خطأ في تحميل الصفحة')),
        data: (page) => SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Text(
            page.content,
            style: Theme.of(context).textTheme.bodyLarge?.copyWith(height: 1.8),
          ),
        ),
      ),
    );
  }
}
