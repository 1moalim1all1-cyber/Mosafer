import '../entities/trip_entity.dart';
import '../entities/trip_search_params.dart';

abstract class TripRepository {
  /// البحث عن الرحلات حسب المعايير - الفلترة الجندرية على "سيدات فقط"
  /// بتتفرض هنا على مستوى الاستعلام نفسه، مش بس شكل في الواجهة، وده متوافق
  /// مع نفس القاعدة المفروضة في firestore.rules.
  Future<List<TripEntity>> searchTrips({
    required TripSearchParams params,
    required String requesterGender, // 'male' | 'female'
  });

  Future<TripEntity?> getTripById(String tripId);

  Stream<TripEntity?> watchTrip(String tripId);

  Future<String> createTrip(TripEntity trip);

  Future<void> updateTrip(TripEntity trip);

  Future<void> cancelTrip(String tripId);

  /// رحلات السائق (لعرضها في لوحته)
  Stream<List<TripEntity>> watchDriverTrips(String driverId);
}
