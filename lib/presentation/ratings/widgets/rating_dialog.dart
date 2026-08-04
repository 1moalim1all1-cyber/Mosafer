import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../providers/rating_providers.dart';
import '../../../domain/entities/rating_entity.dart';
import '../../../core/theme/app_colors.dart';

/// نافذة تقييم بعد انتهاء الرحلة - قابلة لإعادة الاستخدام من الراكب
/// (يقيّم السائق) أو من السائق (يقيّم الراكب) عبر نفس الـ Widget.
Future<void> showRatingDialog(
  BuildContext context,
  WidgetRef ref, {
  required String tripId,
  required String bookingId,
  required String fromUserId,
  required String toUserId,
  required RatingDirection direction,
  required String otherPartyName,
}) async {
  int selectedStars = 5;
  final commentController = TextEditingController();

  await showDialog(
    context: context,
    barrierDismissible: false,
    builder: (context) => StatefulBuilder(
      builder: (context, setState) => AlertDialog(
        title: Text('قيّم $otherPartyName'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(5, (index) {
                final starValue = index + 1;
                return IconButton(
                  icon: Icon(
                    starValue <= selectedStars ? Icons.star : Icons.star_border,
                    color: AppColors.ratingStar,
                    size: 32,
                  ),
                  onPressed: () => setState(() => selectedStars = starValue),
                );
              }),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: commentController,
              decoration: const InputDecoration(hintText: 'تعليق (اختياري)'),
              maxLines: 2,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('لاحقًا'),
          ),
          Consumer(
            builder: (context, ref, _) {
              final isSubmitting = ref.watch(ratingSubmittingProvider);
              return ElevatedButton(
                onPressed: isSubmitting
                    ? null
                    : () async {
                        ref.read(ratingSubmittingProvider.notifier).state = true;
                        try {
                          await ref.read(ratingRepositoryProvider).submitRating(
                                tripId: tripId,
                                bookingId: bookingId,
                                fromUserId: fromUserId,
                                toUserId: toUserId,
                                direction: direction,
                                stars: selectedStars,
                                comment: commentController.text.trim().isEmpty
                                    ? null
                                    : commentController.text.trim(),
                              );
                          if (context.mounted) Navigator.of(context).pop();
                        } finally {
                          ref.read(ratingSubmittingProvider.notifier).state = false;
                        }
                      },
                child: isSubmitting
                    ? const SizedBox(
                        width: 18,
                        height: 18,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Text('إرسال'),
              );
            },
          ),
        ],
      ),
    ),
  );
}
