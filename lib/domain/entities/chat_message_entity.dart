import 'package:equatable/equatable.dart';

enum MessageType { text, image, location }

class ChatMessageEntity extends Equatable {
  final String id;
  final String senderId;
  final MessageType type;
  final String content; // نص، أو رابط صورة Cloudinary، أو "lat,lng" للموقع
  final bool isRead;
  final DateTime createdAt;

  const ChatMessageEntity({
    required this.id,
    required this.senderId,
    required this.type,
    required this.content,
    this.isRead = false,
    required this.createdAt,
  });

  @override
  List<Object?> get props => [id, senderId, type, content, isRead];
}

class ChatEntity extends Equatable {
  final String id;
  final String tripId;
  final String passengerId;
  final String driverId;
  final String? lastMessage;
  final DateTime? lastMessageAt;
  final Map<String, bool> typingUsers;

  const ChatEntity({
    required this.id,
    required this.tripId,
    required this.passengerId,
    required this.driverId,
    this.lastMessage,
    this.lastMessageAt,
    this.typingUsers = const {},
  });

  bool otherUserTyping(String currentUid) {
    final otherUid = currentUid == passengerId ? driverId : passengerId;
    return typingUsers[otherUid] ?? false;
  }

  @override
  List<Object?> get props => [id, tripId, passengerId, driverId, lastMessage];
}
