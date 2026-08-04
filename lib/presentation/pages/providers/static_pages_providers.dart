import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../domain/entities/static_page_entity.dart';
import '../../../domain/repositories/static_pages_repository.dart';
import '../../../data/repositories/static_pages_repository_impl.dart';

final staticPagesRepositoryProvider = Provider<StaticPagesRepository>((ref) {
  return StaticPagesRepositoryImpl();
});

final staticPageProvider =
    StreamProvider.autoDispose.family<StaticPageEntity, String>((ref, pageId) {
  return ref.read(staticPagesRepositoryProvider).watchPage(pageId);
});

final faqItemsProvider = StreamProvider.autoDispose<List<FaqItemEntity>>((ref) {
  return ref.read(staticPagesRepositoryProvider).watchFaqItems();
});
