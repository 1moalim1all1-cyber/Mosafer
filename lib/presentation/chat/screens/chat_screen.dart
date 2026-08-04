import 'dart:async';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import 'package:geolocator/geolocator.dart';

import '../providers/chat_providers.dart';
import '../widgets/message_bubble.dart';
import '../../auth/providers/auth_providers.dart';
import '../../../core/config/cloudinary_service.dart';
import '../../../core/theme/app_colors.dart';

class ChatScreen extends ConsumerStatefulWidget {
  final String chatId;
  const ChatScreen({super.key, required this.chatId});

  @override
  ConsumerState<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends ConsumerState<ChatScreen> {
  final _textController = TextEditingController();
  Timer? _typingResetTimer;

  @override
  void initState() {
    super.initState();
    // نعلّم كل الرسائل اللي لسه مقروتش لغاية الآن كمقروءة أول ما الشات يتفتح
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final user = ref.read(currentUserProvider);
      if (user != null) {
        ref.read(chatRepositoryProvider).markMessagesAsRead(
              chatId: widget.chatId,
              currentUserId: user.uid,
            );
      }
    });
  }

  @override
  void dispose() {
    _typingResetTimer?.cancel();
    _textController.dispose();
    super.dispose();
  }

  void _onTextChanged(String value) {
    final user = ref.read(currentUserProvider);
    if (user == null) return;

    ref.read(chatRepositoryProvider).setTyping(
          chatId: widget.chatId,
          userId: user.uid,
          isTyping: value.isNotEmpty,
        );

    _typingResetTimer?.cancel();
    _typingResetTimer = Timer(const Duration(seconds: 3), () {
      ref.read(chatRepositoryProvider).setTyping(
            chatId: widget.chatId,
            userId: user.uid,
            isTyping: false,
          );
    });
  }

  Future<void> _sendText() async {
    final text = _textController.text.trim();
    if (text.isEmpty) return;
    final user = ref.read(currentUserProvider);
    if (user == null) return;

    _textController.clear();
    await ref.read(chatRepositoryProvider).sendTextMessage(
          chatId: widget.chatId,
          senderId: user.uid,
          text: text,
        );
    ref.read(chatRepositoryProvider).setTyping(
          chatId: widget.chatId,
          userId: user.uid,
          isTyping: false,
        );
  }

  Future<void> _sendImage() async {
    final user = ref.read(currentUserProvider);
    if (user == null) return;

    final picked = await ImagePicker().pickImage(source: ImageSource.gallery, imageQuality: 80);
    if (picked == null) return;

    ref.read(chatImageUploadingProvider.notifier).state = true;
    try {
      final url = await CloudinaryService.instance.uploadImage(
        imageFile: File(picked.path),
        folder: 'mosafer/chat/${widget.chatId}',
      );
      await ref.read(chatRepositoryProvider).sendImageMessage(
            chatId: widget.chatId,
            senderId: user.uid,
            imageUrl: url,
          );
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('فشل إرسال الصورة، حاول تاني')),
        );
      }
    } finally {
      if (mounted) ref.read(chatImageUploadingProvider.notifier).state = false;
    }
  }

  Future<void> _sendLocation() async {
    final user = ref.read(currentUserProvider);
    if (user == null) return;

    try {
      final permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        final requested = await Geolocator.requestPermission();
        if (requested == LocationPermission.denied) return;
      }
      final position = await Geolocator.getCurrentPosition();
      await ref.read(chatRepositoryProvider).sendLocationMessage(
            chatId: widget.chatId,
            senderId: user.uid,
            lat: position.latitude,
            lng: position.longitude,
          );
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('تعذّر الوصول لموقعك، تأكد من صلاحيات الموقع')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final currentUser = ref.watch(currentUserProvider);
    final messagesAsync = ref.watch(chatMessagesProvider(widget.chatId));
    final chatAsync = ref.watch(chatDetailsProvider(widget.chatId));
    final isUploadingImage = ref.watch(chatImageUploadingProvider);

    if (currentUser == null) return const SizedBox.shrink();

    return Scaffold(
      appBar: AppBar(
        title: chatAsync.when(
          data: (chat) => Text(
            chat != null && chat.otherUserTyping(currentUser.uid)
                ? 'بيكتب دلوقتي...'
                : 'المحادثة',
          ),
          loading: () => const Text('المحادثة'),
          error: (_, __) => const Text('المحادثة'),
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: messagesAsync.when(
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (_, __) => const Center(child: Text('حصل خطأ في تحميل الرسائل')),
              data: (messages) {
                if (messages.isEmpty) {
                  return const Center(child: Text('ابدأ المحادثة دلوقتي'));
                }
                return ListView.builder(
                  reverse: true,
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  itemCount: messages.length,
                  itemBuilder: (context, index) {
                    final message = messages[index];
                    return MessageBubble(
                      message: message,
                      isMe: message.senderId == currentUser.uid,
                    );
                  },
                );
              },
            ),
          ),
          if (isUploadingImage)
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 6),
              child: LinearProgressIndicator(),
            ),
          _buildInputBar(),
        ],
      ),
    );
  }

  Widget _buildInputBar() {
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
        child: Row(
          children: [
            IconButton(
              icon: const Icon(Icons.location_on_outlined, color: AppColors.primary),
              onPressed: _sendLocation,
            ),
            IconButton(
              icon: const Icon(Icons.image_outlined, color: AppColors.primary),
              onPressed: _sendImage,
            ),
            Expanded(
              child: TextField(
                controller: _textController,
                onChanged: _onTextChanged,
                decoration: InputDecoration(
                  hintText: 'اكتب رسالتك...',
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(24)),
                ),
                onSubmitted: (_) => _sendText(),
              ),
            ),
            const SizedBox(width: 6),
            CircleAvatar(
              backgroundColor: AppColors.primary,
              child: IconButton(
                icon: const Icon(Icons.send, color: Colors.white, size: 18),
                onPressed: _sendText,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
