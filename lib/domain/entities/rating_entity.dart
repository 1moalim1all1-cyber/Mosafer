import 'package:equatable/equatable.dart';

enum RatingDirection { passengerToDriver, driverToPassenger }

class RatingEntity extends Equatable {
  final String id;
  final String tripId;
  final String bookingId;
  final String fromUserId;
  final String toUserId;
  final RatingDirection direction;
  final int stars;
  final String? comment;
  final DateTime createdAt;

  const RatingEntity({
    required this.id,
    required this.tripId,
    required this.bookingId,
    required this.fromUserId,
    required this.toUserId,
    required this.direction,
    required this.stars,
    this.comment,
    required this.createdAt,
  });

  @override
  List<Object?> get props => [id, tripId, bookingId, fromUserId, toUserId];
}
