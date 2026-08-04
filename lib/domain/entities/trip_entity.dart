import 'package:equatable/equatable.dart';

enum TripStatus { pending, active, full, completed, cancelled }

class TripEntity extends Equatable {
  final String id;
  final String driverId;
  final TripStatus status;

  final String originCity;
  final String originGovernorate;
  final double originLat;
  final double originLng;

  final String destinationCity;
  final String destinationGovernorate;
  final double destinationLat;
  final double destinationLng;

  final DateTime departureTime;
  final DateTime? estimatedArrivalTime;
  final int estimatedDurationMinutes;

  final double pricePerSeat;
  final int totalSeats;
  final int availableSeats;

  final bool isReturnEmptyTrip; // راجع فاضي
  final bool isWomenOnly; // رحلات السيدات فقط
  final String carType;

  const TripEntity({
    required this.id,
    required this.driverId,
    required this.status,
    required this.originCity,
    required this.originGovernorate,
    required this.originLat,
    required this.originLng,
    required this.destinationCity,
    required this.destinationGovernorate,
    required this.destinationLat,
    required this.destinationLng,
    required this.departureTime,
    this.estimatedArrivalTime,
    required this.estimatedDurationMinutes,
    required this.pricePerSeat,
    required this.totalSeats,
    required this.availableSeats,
    this.isReturnEmptyTrip = false,
    this.isWomenOnly = false,
    required this.carType,
  });

  bool get hasAvailableSeats => availableSeats > 0;
  bool get isBookable => status == TripStatus.active && hasAvailableSeats;

  @override
  List<Object?> get props => [
        id,
        driverId,
        status,
        originCity,
        destinationCity,
        departureTime,
        pricePerSeat,
        availableSeats,
        isReturnEmptyTrip,
        isWomenOnly,
      ];
}
