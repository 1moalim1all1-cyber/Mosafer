import 'dart:math' as math;
import 'package:flutter/material.dart';

import '../../../core/theme/app_colors.dart';

/// أيقونة سيارة "شبه-3D" بدون أي ملفات نماذج ثلاثية الأبعاد حقيقية -
/// بنستخدم Matrix4 بمنظور (Perspective) + دوران خفيف حول محور Y + طفو
/// رأسي + ظل بيكبر ويصغر عكسيًا، وده بيدي إحساس عمق وحركة حية من غير
/// أي أصول (Assets) خارجية أو مكتبات 3D تقيلة.
class Animated3DCar extends StatefulWidget {
  final double size;
  const Animated3DCar({super.key, this.size = 180});

  @override
  State<Animated3DCar> createState() => _Animated3DCarState();
}

class _Animated3DCarState extends State<Animated3DCar>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 4),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        final t = _controller.value * 2 * math.pi;

        // دوران خفيف حول محور Y (يمين-شمال) بحدود واقعية عشان الأيقونة
        // تفضل واضحة، مش لف كامل يخلّيها تختفي
        final rotationY = math.sin(t) * 0.35;

        // طفو رأسي ناعم لأعلى وأسفل
        final floatOffset = math.sin(t * 1.3) * 10;

        // الظل بيكبر لما السيارة "تنزل" ويصغر لما "تعلي" - إحساس عمق حقيقي
        final shadowScale = 1.0 - (floatOffset / 40).abs();

        return Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Transform(
              alignment: Alignment.center,
              transform: Matrix4.identity()
                ..setEntry(3, 2, 0.0012) // منظور (Perspective)
                ..rotateY(rotationY)
                ..translate(0.0, floatOffset),
              child: Icon(
                Icons.directions_car_filled_rounded,
                size: widget.size,
                color: Colors.white,
                shadows: [
                  Shadow(
                    color: AppColors.accent.withValues(alpha: 0.6),
                    blurRadius: 30,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
            // الظل الأرضي - Ellipse شفاف بيتغيّر حجمه مع حركة السيارة
            Transform.scale(
              scaleX: shadowScale,
              child: Container(
                width: widget.size * 0.55,
                height: 14,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(20),
                  gradient: RadialGradient(
                    colors: [
                      Colors.black.withValues(alpha: 0.28),
                      Colors.black.withValues(alpha: 0.0),
                    ],
                  ),
                ),
              ),
            ),
          ],
        );
      },
    );
  }
}
