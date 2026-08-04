import 'package:equatable/equatable.dart';

enum NotificationType {
  bookingAccepted,
  bookingRejected,
  newBookingRequest,
  tripStarted,
  tripCompleted,
  newMessage,
  promotion,
  walletUpdate,
  adminAlert,
}

class NotificationEntity extends Equatable {
  final String id;
  final NotificationType type;
  final String title;
  final String body;
  final String? relatedId; // tripId أو chatId أو bookingId حسب النوع
  final bool isRead;
  final DateTime createdAt;

  const NotificationEntity({
    required this.id,
    required this.type,
    required this.title,
    required this.body,
    this.relatedId,
    this.isRead = false,
    required this.createdAt,
  });

  @override
  List<Object?> get props => [id, type, title, isRead];
}
