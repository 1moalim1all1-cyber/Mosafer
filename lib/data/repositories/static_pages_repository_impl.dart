import 'package:cloud_firestore/cloud_firestore.dart';

import '../../core/constants/app_constants.dart';
import '../../domain/entities/static_page_entity.dart';
import '../../domain/repositories/static_pages_repository.dart';

class StaticPagesRepositoryImpl implements StaticPagesRepository {
  final FirebaseFirestore _firestore;

  StaticPagesRepositoryImpl({FirebaseFirestore? firestore})
      : _firestore = firestore ?? FirebaseFirestore.instance;

  CollectionReference<Map<String, dynamic>> get _pagesRef =>
      _firestore.collection(AppConstants.pagesCollection);

  @override
  Stream<StaticPageEntity> watchPage(String pageId) {
    return _pagesRef.doc(pageId).snapshots().map((doc) {
      final fallback = DefaultPagesContent.pages[pageId] ??
          StaticPageEntity(id: pageId, title: pageId, content: '');
      if (!doc.exists || doc.data() == null) return fallback;
      final data = doc.data()!;
      return StaticPageEntity(
        id: pageId,
        title: data['title'] ?? fallback.title,
        content: data['content'] ?? fallback.content,
      );
    });
  }

  @override
  Future<void> updatePage(String pageId, {required String title, required String content}) {
    return _pagesRef.doc(pageId).set({'title': title, 'content': content}, SetOptions(merge: true));
  }

  @override
  Stream<List<FaqItemEntity>> watchFaqItems() {
    return _pagesRef.doc('faq').snapshots().map((doc) {
      if (!doc.exists || doc.data()?['items'] == null) {
        return DefaultPagesContent.faqItems;
      }
      final items = (doc.data()!['items'] as List)
          .map((e) => FaqItemEntity(
                question: e['question'] ?? '',
                answer: e['answer'] ?? '',
              ))
          .toList();
      return items.isEmpty ? DefaultPagesContent.faqItems : items;
    });
  }

  @override
  Future<void> updateFaqItems(List<FaqItemEntity> items) {
    return _pagesRef.doc('faq').set({
      'items': items.map((e) => {'question': e.question, 'answer': e.answer}).toList(),
    }, SetOptions(merge: true));
  }
}
