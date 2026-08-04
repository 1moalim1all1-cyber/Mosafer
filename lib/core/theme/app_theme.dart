import 'package:flutter/material.dart';
import 'app_colors.dart';
import 'app_typography.dart';

/// انتقال ناعم موحّد (تلاشي + انزلاق خفيف لأعلى) بيتطبّق تلقائيًا على
/// كل شاشة في التطبيق عن طريق ThemeData.pageTransitionsTheme - مفيش
/// داعي نعدّل كل شاشة لوحدها، التغيير هنا بيغطي كل التطبيق مرة واحدة.
class _SmoothPageTransitionsBuilder extends PageTransitionsBuilder {
  const _SmoothPageTransitionsBuilder();

  @override
  Widget buildTransitions<T>(
    PageRoute<T> route,
    BuildContext context,
    Animation<double> animation,
    Animation<double> secondaryAnimation,
    Widget child,
  ) {
    final curved = CurvedAnimation(parent: animation, curve: Curves.easeOutCubic);
    return FadeTransition(
      opacity: curved,
      child: SlideTransition(
        position: Tween<Offset>(
          begin: const Offset(0, 0.04),
          end: Offset.zero,
        ).animate(curved),
        child: child,
      ),
    );
  }
}

final PageTransitionsTheme appPageTransitionsTheme = PageTransitionsTheme(
  builders: {
    TargetPlatform.android: const _SmoothPageTransitionsBuilder(),
    TargetPlatform.iOS: const _SmoothPageTransitionsBuilder(),
    TargetPlatform.windows: const _SmoothPageTransitionsBuilder(),
    TargetPlatform.macOS: const _SmoothPageTransitionsBuilder(),
    TargetPlatform.linux: const _SmoothPageTransitionsBuilder(),
  },
);

class AppTheme {
  AppTheme._();

  static const double radiusS = 8;
  static const double radiusM = 14;
  static const double radiusL = 20;

  static ThemeData light({required bool isArabic}) {
    final textTheme = AppTypography.textTheme(isArabic);
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      scaffoldBackgroundColor: AppColors.lightBackground,
      pageTransitionsTheme: appPageTransitionsTheme,
      colorScheme: const ColorScheme.light(
        primary: AppColors.primary,
        secondary: AppColors.accent,
        error: AppColors.error,
        surface: AppColors.lightSurface,
      ),
      textTheme: textTheme.apply(
        bodyColor: AppColors.lightTextPrimary,
        displayColor: AppColors.lightTextPrimary,
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: AppColors.lightSurface,
        foregroundColor: AppColors.lightTextPrimary,
        elevation: 0,
        centerTitle: true,
        titleTextStyle: textTheme.titleLarge,
      ),
      cardTheme: CardThemeData(
        color: AppColors.lightSurface,
        elevation: 3,
        shadowColor: AppColors.primary.withValues(alpha: 0.12),
        surfaceTintColor: Colors.transparent,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(radiusM),
          side: const BorderSide(color: AppColors.lightBorder),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          elevation: 4,
          shadowColor: AppColors.primary.withValues(alpha: 0.35),
          padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 24),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(radiusM),
          ),
          textStyle: textTheme.labelLarge,
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.lightSurface,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(radiusM),
          borderSide: const BorderSide(color: AppColors.lightBorder),
        ),
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      ),
    );
  }

  static ThemeData dark({required bool isArabic}) {
    final textTheme = AppTypography.textTheme(isArabic);
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: AppColors.darkBackground,
      pageTransitionsTheme: appPageTransitionsTheme,
      colorScheme: const ColorScheme.dark(
        primary: AppColors.accent,
        secondary: AppColors.primaryLight,
        error: AppColors.error,
        surface: AppColors.darkSurface,
      ),
      textTheme: textTheme.apply(
        bodyColor: AppColors.darkTextPrimary,
        displayColor: AppColors.darkTextPrimary,
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: AppColors.darkSurface,
        foregroundColor: AppColors.darkTextPrimary,
        elevation: 0,
        centerTitle: true,
        titleTextStyle: textTheme.titleLarge,
      ),
      cardTheme: CardThemeData(
        color: AppColors.darkSurface,
        elevation: 3,
        shadowColor: Colors.black.withValues(alpha: 0.4),
        surfaceTintColor: Colors.transparent,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(radiusM),
          side: const BorderSide(color: AppColors.darkBorder),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.accent,
          foregroundColor: Colors.white,
          elevation: 4,
          shadowColor: AppColors.accent.withValues(alpha: 0.35),
          padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 24),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(radiusM),
          ),
          textStyle: textTheme.labelLarge,
        ),
      ),
    );
  }
}
