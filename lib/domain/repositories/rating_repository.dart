import '../entities/rating_entity.dart';

abstract class RatingRepository {
  Future<void> submitRating({
    required String tripId,
    required String bookingId,
    required String fromUserId,
    required String toUserId,
    required RatingDirection direction,
    required int stars,
    String? comment,
  });

  /// هل المستخدم قيّم الحجز ده قبل كده؟ (لمنع تكرار التقييم من الواجهة)
  Future<bool> hasRated({required String bookingId, required String fromUserId});
}
