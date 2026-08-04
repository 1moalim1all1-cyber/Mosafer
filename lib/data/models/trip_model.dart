import 'package:cloud_firestore/cloud_firestore.dart';
import '../../domain/entities/trip_entity.dart';

class TripModel extends TripEntity {
  const TripModel({
    required super.id,
    required super.driverId,
    required super.status,
    required super.originCity,
    required super.originGovernorate,
    required super.originLat,
    required super.originLng,
    required super.destinationCity,
    required super.destinationGovernorate,
    required super.destinationLat,
    required super.destinationLng,
    required super.departureTime,
    super.estimatedArrivalTime,
    required super.estimatedDurationMinutes,
    required super.pricePerSeat,
    required super.totalSeats,
    required super.availableSeats,
    super.isReturnEmptyTrip,
    super.isWomenOnly,
    required super.carType,
    super.driverLiveLat,
    super.driverLiveLng,
    super.driverLiveUpdatedAt,
  });

  factory TripModel.fromMap(String id, Map<String, dynamic> map) {
    return TripModel(
      id: id,
      driverId: map['driverId'] ?? '',
      status: TripStatus.values.firstWhere(
        (s) => s.name == (map['status'] ?? 'pending'),
        orElse: () => TripStatus.pending,
      ),
      originCity: map['originCity'] ?? '',
      originGovernorate: map['originGovernorate'] ?? '',
      originLat: (map['originLat'] ?? 0).toDouble(),
      originLng: (map['originLng'] ?? 0).toDouble(),
      destinationCity: map['destinationCity'] ?? '',
      destinationGovernorate: map['destinationGovernorate'] ?? '',
      destinationLat: (map['destinationLat'] ?? 0).toDouble(),
      destinationLng: (map['destinationLng'] ?? 0).toDouble(),
      departureTime: (map['departureTime'] as Timestamp).toDate(),
      estimatedArrivalTime: map['estimatedArrivalTime'] != null
          ? (map['estimatedArrivalTime'] as Timestamp).toDate()
          : null,
      estimatedDurationMinutes: map['estimatedDurationMinutes'] ?? 0,
      pricePerSeat: (map['pricePerSeat'] ?? 0).toDouble(),
      totalSeats: map['totalSeats'] ?? 0,
      availableSeats: map['availableSeats'] ?? 0,
      isReturnEmptyTrip: map['isReturnEmptyTrip'] ?? false,
      isWomenOnly: map['isWomenOnly'] ?? false,
      carType: map['carType'] ?? '',
      driverLiveLat: map['driverLiveLat'] != null ? (map['driverLiveLat']).toDouble() : null,
      driverLiveLng: map['driverLiveLng'] != null ? (map['driverLiveLng']).toDouble() : null,
      driverLiveUpdatedAt: map['driverLiveUpdatedAt'] != null
          ? (map['driverLiveUpdatedAt'] as Timestamp).toDate()
          : null,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'driverId': driverId,
      'status': status.name,
      'originCity': originCity,
      'originGovernorate': originGovernorate,
      'originLat': originLat,
      'originLng': originLng,
      'destinationCity': destinationCity,
      'destinationGovernorate': destinationGovernorate,
      'destinationLat': destinationLat,
      'destinationLng': destinationLng,
      'departureTime': Timestamp.fromDate(departureTime),
      'estimatedArrivalTime': estimatedArrivalTime != null
          ? Timestamp.fromDate(estimatedArrivalTime!)
          : null,
      'estimatedDurationMinutes': estimatedDurationMinutes,
      'pricePerSeat': pricePerSeat,
      'totalSeats': totalSeats,
      'availableSeats': availableSeats,
      'isReturnEmptyTrip': isReturnEmptyTrip,
      'isWomenOnly': isWomenOnly,
      'carType': carType,
    };
  }

  /// Map خاص بإنشاء رحلة جديدة بس - فيه createdAt (مايتكررش عند التعديل)
  Map<String, dynamic> toCreateMap() => {
        ...toMap(),
        'createdAt': FieldValue.serverTimestamp(),
      };
}
