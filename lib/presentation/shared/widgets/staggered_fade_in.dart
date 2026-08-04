import 'package:flutter/material.dart';

/// غلاف خفيف بيدي أي عنصر (كارت، صف، إلخ) ظهور تدريجي ناعم (تلاشي +
/// انزلاق لأعلى) لما يتحط في القوائم، بتأخير بسيط حسب ترتيبه (index)
/// عشان يظهروا واحد ورا التاني بإحساس "حي" - بدون أي تكلفة أداء حقيقية
/// لأنها حركة implicit بسيطة (TweenAnimationBuilder) مش AnimationController
/// دايم شغال، فبتخلص وتقف تمامًا بعد أول ظهور.
class StaggeredFadeIn extends StatelessWidget {
  final int index;
  final Widget child;
  final Duration baseDelay;

  const StaggeredFadeIn({
    super.key,
    required this.index,
    required this.child,
    this.baseDelay = const Duration(milliseconds: 40),
  });

  @override
  Widget build(BuildContext context) {
    // بنحدد أقصى تأخير عشان قوائم طويلة جدًا ميبقاش فيها انتظار طويل
    final delayMs = (baseDelay.inMilliseconds * index).clamp(0, 400);

    return TweenAnimationBuilder<double>(
      key: ValueKey('staggered_$index'),
      tween: Tween(begin: 0, end: 1),
      duration: Duration(milliseconds: 350 + delayMs),
      curve: Curves.easeOutCubic,
      builder: (context, value, child) {
        return Opacity(
          opacity: value,
          child: Transform.translate(
            offset: Offset(0, (1 - value) * 16),
            child: child,
          ),
        );
      },
      child: child,
    );
  }
}
