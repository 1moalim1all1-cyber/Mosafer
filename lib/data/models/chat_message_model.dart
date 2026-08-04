import 'package:cloud_firestore/cloud_firestore.dart';
import '../../domain/entities/chat_message_entity.dart';

class ChatMessageModel extends ChatMessageEntity {
  const ChatMessageModel({
    required super.id,
    required super.senderId,
    required super.type,
    required super.content,
    super.isRead,
    required super.createdAt,
  });

  factory ChatMessageModel.fromMap(String id, Map<String, dynamic> map) {
    return ChatMessageModel(
      id: id,
      senderId: map['senderId'] ?? '',
      type: MessageType.values.firstWhere(
        (t) => t.name == (map['type'] ?? 'text'),
        orElse: () => MessageType.text,
      ),
      content: map['content'] ?? '',
      isRead: map['isRead'] ?? false,
      createdAt: (map['createdAt'] is Timestamp)
          ? (map['createdAt'] as Timestamp).toDate()
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'senderId': senderId,
      'type': type.name,
      'content': content,
      'isRead': isRead,
      'createdAt': FieldValue.serverTimestamp(),
    };
  }
}

class ChatModel extends ChatEntity {
  const ChatModel({
    required super.id,
    required super.tripId,
    required super.passengerId,
    required super.driverId,
    super.lastMessage,
    super.lastMessageAt,
    super.typingUsers,
  });

  factory ChatModel.fromMap(String id, Map<String, dynamic> map) {
    final typingMap = (map['typingUsers'] as Map<String, dynamic>?) ?? {};
    return ChatModel(
      id: id,
      tripId: map['tripId'] ?? '',
      passengerId: map['passengerId'] ?? '',
      driverId: map['driverId'] ?? '',
      lastMessage: map['lastMessage'],
      lastMessageAt: map['lastMessageAt'] != null
          ? (map['lastMessageAt'] as Timestamp).toDate()
          : null,
      typingUsers: typingMap.map((k, v) => MapEntry(k, v == true)),
    );
  }
}
