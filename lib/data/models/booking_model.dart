import 'package:cloud_firestore/cloud_firestore.dart';
import '../../domain/entities/booking_entity.dart';

class BookingModel extends BookingEntity {
  const BookingModel({
    required super.id,
    required super.tripId,
    required super.passengerId,
    required super.driverId,
    required super.seatsBooked,
    required super.status,
    required super.totalPrice,
    required super.paymentMethod,
    required super.paymentStatus,
    required super.createdAt,
  });

  factory BookingModel.fromMap(String id, Map<String, dynamic> map) {
    return BookingModel(
      id: id,
      tripId: map['tripId'] ?? '',
      passengerId: map['passengerId'] ?? '',
      driverId: map['driverId'] ?? '',
      seatsBooked: map['seatsBooked'] ?? 1,
      status: BookingStatus.values.firstWhere(
        (s) => s.name == (map['status'] ?? 'pending'),
        orElse: () => BookingStatus.pending,
      ),
      totalPrice: (map['totalPrice'] ?? 0).toDouble(),
      paymentMethod: PaymentMethod.values.firstWhere(
        (p) => p.name == (map['paymentMethod'] ?? 'cash'),
        orElse: () => PaymentMethod.cash,
      ),
      paymentStatus: PaymentStatus.values.firstWhere(
        (p) => p.name == (map['paymentStatus'] ?? 'pending'),
        orElse: () => PaymentStatus.pending,
      ),
      createdAt: (map['createdAt'] is Timestamp)
          ? (map['createdAt'] as Timestamp).toDate()
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'tripId': tripId,
      'passengerId': passengerId,
      'driverId': driverId,
      'seatsBooked': seatsBooked,
      'status': status.name,
      'totalPrice': totalPrice,
      'paymentMethod': paymentMethod.name,
      'paymentStatus': paymentStatus.name,
      'createdAt': FieldValue.serverTimestamp(),
    };
  }
}
