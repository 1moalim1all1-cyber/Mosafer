import '../entities/chat_message_entity.dart';

abstract class ChatRepository {
  /// إنشاء/إيجاد شات لرحلة معيّنة بين راكب وسائق - الـ ID بيتبنى بشكل ثابت
  /// من tripId و passengerId عشان نفس المحادثة تتلاقي دايمًا مهما فتحها مين.
  String buildChatId({required String tripId, required String passengerId});

  Future<void> ensureChatExists({
    required String chatId,
    required String tripId,
    required String passengerId,
    required String driverId,
  });

  Stream<ChatEntity?> watchChat(String chatId);

  Stream<List<ChatMessageEntity>> watchMessages(String chatId);

  Future<void> sendTextMessage({
    required String chatId,
    required String senderId,
    required String text,
  });

  Future<void> sendImageMessage({
    required String chatId,
    required String senderId,
    required String imageUrl,
  });

  Future<void> sendLocationMessage({
    required String chatId,
    required String senderId,
    required double lat,
    required double lng,
  });

  Future<void> markMessagesAsRead({
    required String chatId,
    required String currentUserId,
  });

  Future<void> setTyping({
    required String chatId,
    required String userId,
    required bool isTyping,
  });
}
