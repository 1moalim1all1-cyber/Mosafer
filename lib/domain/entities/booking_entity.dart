import 'package:equatable/equatable.dart';

enum BookingStatus { pending, confirmed, rejected, cancelled, completed }

enum PaymentMethod { cash, card, wallet }

enum PaymentStatus { pending, paid, refunded }

class BookingEntity extends Equatable {
  final String id;
  final String tripId;
  final String passengerId;
  final String driverId;
  final int seatsBooked;
  final BookingStatus status;
  final double totalPrice;
  final PaymentMethod paymentMethod;
  final PaymentStatus paymentStatus;
  final DateTime createdAt;

  const BookingEntity({
    required this.id,
    required this.tripId,
    required this.passengerId,
    required this.driverId,
    required this.seatsBooked,
    required this.status,
    required this.totalPrice,
    required this.paymentMethod,
    required this.paymentStatus,
    required this.createdAt,
  });

  @override
  List<Object?> get props => [id, tripId, passengerId, status, seatsBooked];
}
