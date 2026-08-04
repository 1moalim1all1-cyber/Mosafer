import 'package:cloud_firestore/cloud_firestore.dart';

import '../../core/constants/app_constants.dart';
import '../../domain/entities/trip_entity.dart';
import '../../domain/entities/trip_search_params.dart';
import '../../domain/repositories/trip_repository.dart';
import '../models/trip_model.dart';

class TripRepositoryImpl implements TripRepository {
  final FirebaseFirestore _firestore;

  TripRepositoryImpl({FirebaseFirestore? firestore})
      : _firestore = firestore ?? FirebaseFirestore.instance;

  CollectionReference<Map<String, dynamic>> get _tripsRef =>
      _firestore.collection(AppConstants.tripsCollection);

  @override
  Future<List<TripEntity>> searchTrips({
    required TripSearchParams params,
    required String requesterGender,
  }) async {
    final startOfDay = DateTime(
        params.date.year, params.date.month, params.date.day);
    final endOfDay = startOfDay.add(const Duration(days: 1));

    Query<Map<String, dynamic>> query = _tripsRef
        .where('status', isEqualTo: TripStatus.active.name)
        .where('originCity', isEqualTo: params.originCity)
        .where('destinationCity', isEqualTo: params.destinationCity)
        .where('departureTime', isGreaterThanOrEqualTo: Timestamp.fromDate(startOfDay))
        .where('departureTime', isLessThan: Timestamp.fromDate(endOfDay));

    // ---- قاعدة أمان مزدوجة لرحلات "سيدات فقط" ----
    // الرجالة ميشوفوش رحلات السيدات نهائيًا، بغض النظر عن حالة الفلتر،
    // وده بيتفرض هنا على مستوى الاستعلام نفسه (مش الواجهة فقط)،
    // بالتوازي مع نفس القاعدة في firestore.rules كطبقة حماية مزدوجة.
    if (requesterGender == 'male') {
      query = query.where('isWomenOnly', isEqualTo: false);
    } else if (params.womenOnlyFilter) {
      query = query.where('isWomenOnly', isEqualTo: true);
    }

    if (params.returnEmptyOnly) {
      query = query.where('isReturnEmptyTrip', isEqualTo: true);
    }

    query = query.orderBy('departureTime');

    final snapshot = await query.get();

    return snapshot.docs
        .map((doc) => TripModel.fromMap(doc.id, doc.data()))
        .where((trip) => trip.availableSeats >= params.seatsNeeded)
        .toList();
  }

  @override
  Future<TripEntity?> getTripById(String tripId) async {
    final doc = await _tripsRef.doc(tripId).get();
    if (!doc.exists || doc.data() == null) return null;
    return TripModel.fromMap(doc.id, doc.data()!);
  }

  @override
  Stream<TripEntity?> watchTrip(String tripId) {
    return _tripsRef.doc(tripId).snapshots().map((doc) {
      if (!doc.exists || doc.data() == null) return null;
      return TripModel.fromMap(doc.id, doc.data()!);
    });
  }

  @override
  Future<String> createTrip(TripEntity trip) async {
    final model = TripModel(
      id: '',
      driverId: trip.driverId,
      status: trip.status,
      originCity: trip.originCity,
      originGovernorate: trip.originGovernorate,
      originLat: trip.originLat,
      originLng: trip.originLng,
      destinationCity: trip.destinationCity,
      destinationGovernorate: trip.destinationGovernorate,
      destinationLat: trip.destinationLat,
      destinationLng: trip.destinationLng,
      departureTime: trip.departureTime,
      estimatedArrivalTime: trip.estimatedArrivalTime,
      estimatedDurationMinutes: trip.estimatedDurationMinutes,
      pricePerSeat: trip.pricePerSeat,
      totalSeats: trip.totalSeats,
      availableSeats: trip.availableSeats,
      isReturnEmptyTrip: trip.isReturnEmptyTrip,
      isWomenOnly: trip.isWomenOnly,
      carType: trip.carType,
    );
    final doc = await _tripsRef.add(model.toCreateMap());
    return doc.id;
  }

  @override
  Future<void> updateTrip(TripEntity trip) async {
    final model = TripModel(
      id: trip.id,
      driverId: trip.driverId,
      status: trip.status,
      originCity: trip.originCity,
      originGovernorate: trip.originGovernorate,
      originLat: trip.originLat,
      originLng: trip.originLng,
      destinationCity: trip.destinationCity,
      destinationGovernorate: trip.destinationGovernorate,
      destinationLat: trip.destinationLat,
      destinationLng: trip.destinationLng,
      departureTime: trip.departureTime,
      estimatedArrivalTime: trip.estimatedArrivalTime,
      estimatedDurationMinutes: trip.estimatedDurationMinutes,
      pricePerSeat: trip.pricePerSeat,
      totalSeats: trip.totalSeats,
      availableSeats: trip.availableSeats,
      isReturnEmptyTrip: trip.isReturnEmptyTrip,
      isWomenOnly: trip.isWomenOnly,
      carType: trip.carType,
    );
    await _tripsRef.doc(trip.id).update(model.toMap());
  }

  @override
  Future<void> cancelTrip(String tripId) async {
    await _tripsRef.doc(tripId).update({'status': TripStatus.cancelled.name});
  }

  @override
  Stream<List<TripEntity>> watchDriverTrips(String driverId) {
    return _tripsRef
        .where('driverId', isEqualTo: driverId)
        .orderBy('departureTime', descending: true)
        .snapshots()
        .map((snap) =>
            snap.docs.map((d) => TripModel.fromMap(d.id, d.data())).toList());
  }

  @override
  Future<void> updateLiveLocation({
    required String tripId,
    required double lat,
    required double lng,
  }) async {
    await _tripsRef.doc(tripId).update({
      'driverLiveLat': lat,
      'driverLiveLng': lng,
      'driverLiveUpdatedAt': Timestamp.now(),
    });
  }

  @override
  Future<void> stopLiveLocation(String tripId) async {
    await _tripsRef.doc(tripId).update({
      'driverLiveLat': null,
      'driverLiveLng': null,
      'driverLiveUpdatedAt': null,
    });
  }
}
