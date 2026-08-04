import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../domain/entities/chat_message_entity.dart';
import '../../../domain/repositories/chat_repository.dart';
import '../../../data/repositories/chat_repository_impl.dart';

final chatRepositoryProvider = Provider<ChatRepository>((ref) {
  return ChatRepositoryImpl();
});

final chatDetailsProvider =
    StreamProvider.autoDispose.family<ChatEntity?, String>((ref, chatId) {
  return ref.read(chatRepositoryProvider).watchChat(chatId);
});

final chatMessagesProvider = StreamProvider.autoDispose
    .family<List<ChatMessageEntity>, String>((ref, chatId) {
  return ref.read(chatRepositoryProvider).watchMessages(chatId);
});

final chatImageUploadingProvider = StateProvider<bool>((ref) => false);
