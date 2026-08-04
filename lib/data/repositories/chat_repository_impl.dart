import 'package:cloud_firestore/cloud_firestore.dart';

import '../../core/constants/app_constants.dart';
import '../../domain/entities/chat_message_entity.dart';
import '../../domain/repositories/chat_repository.dart';
import '../models/chat_message_model.dart';

class ChatRepositoryImpl implements ChatRepository {
  final FirebaseFirestore _firestore;

  ChatRepositoryImpl({FirebaseFirestore? firestore})
      : _firestore = firestore ?? FirebaseFirestore.instance;

  CollectionReference<Map<String, dynamic>> get _chatsRef =>
      _firestore.collection(AppConstants.chatsCollection);

  @override
  String buildChatId({required String tripId, required String passengerId}) {
    return '${tripId}_$passengerId';
  }

  @override
  Future<void> ensureChatExists({
    required String chatId,
    required String tripId,
    required String passengerId,
    required String driverId,
  }) async {
    final doc = _chatsRef.doc(chatId);
    final snap = await doc.get();
    if (!snap.exists) {
      await doc.set({
        'tripId': tripId,
        'passengerId': passengerId,
        'driverId': driverId,
        'lastMessage': null,
        'lastMessageAt': null,
        'typingUsers': {},
        'createdAt': FieldValue.serverTimestamp(),
      });
    }
  }

  @override
  Stream<ChatEntity?> watchChat(String chatId) {
    return _chatsRef.doc(chatId).snapshots().map((doc) {
      if (!doc.exists || doc.data() == null) return null;
      return ChatModel.fromMap(doc.id, doc.data()!);
    });
  }

  @override
  Stream<List<ChatMessageEntity>> watchMessages(String chatId) {
    return _chatsRef
        .doc(chatId)
        .collection(AppConstants.messagesSubCollection)
        .orderBy('createdAt', descending: true)
        .limit(100)
        .snapshots()
        .map((snap) => snap.docs
            .map((d) => ChatMessageModel.fromMap(d.id, d.data()))
            .toList());
  }

  Future<void> _sendMessage({
    required String chatId,
    required String senderId,
    required MessageType type,
    required String content,
  }) async {
    final chatDoc = _chatsRef.doc(chatId);
    final messageDoc = chatDoc.collection(AppConstants.messagesSubCollection).doc();

    final model = ChatMessageModel(
      id: '',
      senderId: senderId,
      type: type,
      content: content,
      createdAt: DateTime.now(),
    );

    final batch = _firestore.batch();
    batch.set(messageDoc, model.toMap());

    final previewText = switch (type) {
      MessageType.text => content,
      MessageType.image => '📷 صورة',
      MessageType.location => '📍 موقع',
    };
    batch.update(chatDoc, {
      'lastMessage': previewText,
      'lastMessageAt': FieldValue.serverTimestamp(),
      'typingUsers.$senderId': false,
    });

    await batch.commit();
  }

  @override
  Future<void> sendTextMessage({
    required String chatId,
    required String senderId,
    required String text,
  }) {
    return _sendMessage(
      chatId: chatId,
      senderId: senderId,
      type: MessageType.text,
      content: text.trim(),
    );
  }

  @override
  Future<void> sendImageMessage({
    required String chatId,
    required String senderId,
    required String imageUrl,
  }) {
    return _sendMessage(
      chatId: chatId,
      senderId: senderId,
      type: MessageType.image,
      content: imageUrl,
    );
  }

  @override
  Future<void> sendLocationMessage({
    required String chatId,
    required String senderId,
    required double lat,
    required double lng,
  }) {
    return _sendMessage(
      chatId: chatId,
      senderId: senderId,
      type: MessageType.location,
      content: '$lat,$lng',
    );
  }

  @override
  Future<void> markMessagesAsRead({
    required String chatId,
    required String currentUserId,
  }) async {
    final unread = await _chatsRef
        .doc(chatId)
        .collection(AppConstants.messagesSubCollection)
        .where('isRead', isEqualTo: false)
        .where('senderId', isNotEqualTo: currentUserId)
        .get();

    if (unread.docs.isEmpty) return;

    final batch = _firestore.batch();
    for (final doc in unread.docs) {
      batch.update(doc.reference, {'isRead': true});
    }
    await batch.commit();
  }

  @override
  Future<void> setTyping({
    required String chatId,
    required String userId,
    required bool isTyping,
  }) async {
    await _chatsRef.doc(chatId).update({'typingUsers.$userId': isTyping});
  }
}
