import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';

import '../../../core/theme/app_colors.dart';

/// غلاف Shimmer موحّد لكل التطبيق - بيلف أي شكل هيكلي (Skeleton) ويدّيه
/// حركة لمعان بدل ما يكون شكل ثابت جامد، وده اللي التطبيقات الاحترافية
/// (BlaBlaCar, Uber, InDrive) بتستخدمه أثناء تحميل البيانات بدل دائرة
/// تحميل بسيطة في نص الشاشة.
class AppShimmer extends StatelessWidget {
  final Widget child;
  const AppShimmer({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Shimmer.fromColors(
      baseColor: isDark ? AppColors.darkSurface : AppColors.lightBorder,
      highlightColor: isDark ? AppColors.darkBorder : AppColors.lightBackground,
      period: const Duration(milliseconds: 1400),
      child: child,
    );
  }
}

/// مستطيل هيكلي بسيط - لبنة البناء الأساسية لكل الـ Skeletons
class SkeletonBox extends StatelessWidget {
  final double width;
  final double height;
  final double borderRadius;

  const SkeletonBox({
    super.key,
    this.width = double.infinity,
    required this.height,
    this.borderRadius = 8,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(borderRadius),
      ),
    );
  }
}

/// شكل هيكلي لبطاقة رحلة - مطابق تمامًا لأبعاد TripCard الحقيقية عشان
/// الانتقال من التحميل للبيانات الفعلية يبقى سلس بدون "قفزة" في التخطيط
class TripCardSkeleton extends StatelessWidget {
  const TripCardSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    return AppShimmer(
      child: Card(
        margin: const EdgeInsets.only(bottom: 12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const SkeletonBox(width: 44, height: 44, borderRadius: 22),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: const [
                        SkeletonBox(width: 100, height: 14),
                        SizedBox(height: 6),
                        SkeletonBox(width: 60, height: 12),
                      ],
                    ),
                  ),
                  const SkeletonBox(width: 50, height: 20),
                ],
              ),
              const SizedBox(height: 16),
              const SkeletonBox(height: 16, width: 180),
              const SizedBox(height: 20),
              const Divider(height: 1),
              const SizedBox(height: 12),
              Row(
                children: const [
                  SkeletonBox(width: 70, height: 12),
                  SizedBox(width: 16),
                  SkeletonBox(width: 70, height: 12),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// قائمة من Skeletons لحد ما البيانات الحقيقية توصل
class TripListSkeleton extends StatelessWidget {
  final int count;
  const TripListSkeleton({super.key, this.count = 4});

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: count,
      itemBuilder: (context, index) => const TripCardSkeleton(),
    );
  }
}
