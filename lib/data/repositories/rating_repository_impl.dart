import 'package:cloud_firestore/cloud_firestore.dart';

import '../../core/constants/app_constants.dart';
import '../../domain/entities/rating_entity.dart';
import '../../domain/repositories/rating_repository.dart';

class RatingRepositoryImpl implements RatingRepository {
  final FirebaseFirestore _firestore;

  RatingRepositoryImpl({FirebaseFirestore? firestore})
      : _firestore = firestore ?? FirebaseFirestore.instance;

  CollectionReference<Map<String, dynamic>> get _ratingsRef =>
      _firestore.collection(AppConstants.ratingsCollection);

  @override
  Future<void> submitRating({
    required String tripId,
    required String bookingId,
    required String fromUserId,
    required String toUserId,
    required RatingDirection direction,
    required int stars,
    String? comment,
  }) async {
    // تحديث المُقيَّم (avgRating و totalTrips) بيحصل تلقائيًا عبر
    // Cloud Function Trigger (onRatingCreated) - العميل هنا بس بيسجّل
    // التقييم الخام، مش بيحسب المتوسط بنفسه (منعًا للتلاعب في التقييمات).
    await _ratingsRef.add({
      'tripId': tripId,
      'bookingId': bookingId,
      'fromUserId': fromUserId,
      'toUserId': toUserId,
      'direction': direction.name,
      'stars': stars,
      'comment': comment,
      'isReported': false,
      'createdAt': FieldValue.serverTimestamp(),
    });
  }

  @override
  Future<bool> hasRated({required String bookingId, required String fromUserId}) async {
    final snap = await _ratingsRef
        .where('bookingId', isEqualTo: bookingId)
        .where('fromUserId', isEqualTo: fromUserId)
        .limit(1)
        .get();
    return snap.docs.isNotEmpty;
  }
}
