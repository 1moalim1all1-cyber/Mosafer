import '../entities/static_page_entity.dart';

abstract class StaticPagesRepository {
  Stream<StaticPageEntity> watchPage(String pageId);
  Future<void> updatePage(String pageId, {required String title, required String content});

  Stream<List<FaqItemEntity>> watchFaqItems();
  Future<void> updateFaqItems(List<FaqItemEntity> items);
}
