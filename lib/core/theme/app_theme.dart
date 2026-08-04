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
  static const double radiusButton = 12;

  /// نمط زرار موحّد بيغطي كل الحالات المطلوبة (Default, Hover, Pressed/Active,
  /// Focus, Disabled) - مبني على WidgetStateProperty عشان يشتغل صح على
  /// الويب (فأرة) والموبايل (لمس) في نفس الوقت من نفس الكود.
  static ButtonStyle _filledButtonStyle({
    required Color base,
    required Color hover,
    required Color foreground,
  }) {
    return ButtonStyle(
      backgroundColor: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.disabled)) return AppColors.disabled;
        if (states.contains(WidgetState.pressed)) return hover;
        if (states.contains(WidgetState.hovered)) return hover;
        return base;
      }),
      foregroundColor: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.disabled)) return AppColors.lightTextSecondary;
        return foreground;
      }),
      elevation: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.disabled)) return 0;
        if (states.contains(WidgetState.pressed)) return 1;
        if (states.contains(WidgetState.hovered)) return 6;
        return 3;
      }),
      shadowColor: WidgetStateProperty.all(base.withValues(alpha: 0.35)),
      overlayColor: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.focused)) return Colors.white.withValues(alpha: 0.12);
        return null;
      }),
      padding: WidgetStateProperty.all(
        const EdgeInsets.symmetric(vertical: 16, horizontal: 24),
      ),
      shape: WidgetStateProperty.all(
        RoundedRectangleBorder(borderRadius: BorderRadius.circular(radiusButton)),
      ),
      // إطار تركيز واضح (Focus Ring) لتصفح لوحة المفاتيح على الويب
      side: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.focused)) {
          return BorderSide(color: base.withValues(alpha: 0.5), width: 2);
        }
        return null;
      }),
    );
  }

  /// نمط الزرار الثانوي (Secondary): خلفية بيضاء، حدود وخط بلون أساسي،
  /// وHover بخلفية زرقاء فاتحة شفافة.
  static ButtonStyle _outlinedButtonStyle({
    required Color base,
    required Color hoverBackground,
  }) {
    return ButtonStyle(
      backgroundColor: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.disabled)) return Colors.transparent;
        if (states.contains(WidgetState.pressed)) return hoverBackground;
        if (states.contains(WidgetState.hovered)) return hoverBackground;
        return Colors.transparent;
      }),
      foregroundColor: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.disabled)) return AppColors.disabled;
        return base;
      }),
      side: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.disabled)) {
          return const BorderSide(color: AppColors.disabled, width: 1.5);
        }
        if (states.contains(WidgetState.focused)) {
          return BorderSide(color: base, width: 2.5);
        }
        return BorderSide(color: base, width: 1.5);
      }),
      padding: WidgetStateProperty.all(
        const EdgeInsets.symmetric(vertical: 16, horizontal: 24),
      ),
      shape: WidgetStateProperty.all(
        RoundedRectangleBorder(borderRadius: BorderRadius.circular(radiusButton)),
      ),
    );
  }

  static ThemeData light({required bool isArabic}) {
    final textTheme = AppTypography.textTheme(isArabic);
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      scaffoldBackgroundColor: AppColors.lightBackground,
      pageTransitionsTheme: appPageTransitionsTheme,
      colorScheme: const ColorScheme.light(
        primary: AppColors.primary,
        secondary: AppColors.tertiary,
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
        elevation: 2,
        shadowColor: AppColors.lightTextPrimary.withValues(alpha: 0.08),
        surfaceTintColor: Colors.transparent,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(radiusM),
          side: const BorderSide(color: AppColors.lightBorder),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: _filledButtonStyle(
          base: AppColors.primary,
          hover: AppColors.primaryDark,
          foreground: Colors.white,
        ).copyWith(textStyle: WidgetStateProperty.all(textTheme.labelLarge)),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: _outlinedButtonStyle(
          base: AppColors.primary,
          hoverBackground: AppColors.primaryLight.withValues(alpha: 0.12),
        ).copyWith(textStyle: WidgetStateProperty.all(textTheme.labelLarge)),
      ),
      textButtonTheme: TextButtonThemeData(
        style: ButtonStyle(
          foregroundColor: WidgetStateProperty.resolveWith((states) {
            if (states.contains(WidgetState.disabled)) return AppColors.disabled;
            if (states.contains(WidgetState.hovered)) return AppColors.primaryDark;
            return AppColors.primary;
          }),
          overlayColor: WidgetStateProperty.all(AppColors.primaryLight.withValues(alpha: 0.1)),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.lightSurface,
        labelStyle: const TextStyle(color: AppColors.lightTextSecondary),
        hintStyle: const TextStyle(color: AppColors.disabled),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(radiusM),
          borderSide: const BorderSide(color: AppColors.lightBorder),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(radiusM),
          borderSide: const BorderSide(color: AppColors.lightBorder),
        ),
        // إطار تركيز واضح بلون أساسي وسمك أكبر - المستخدم يعرف فورًا
        // إنه في الحقل ده دلوقتي
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(radiusM),
          borderSide: const BorderSide(color: AppColors.primary, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(radiusM),
          borderSide: const BorderSide(color: AppColors.error, width: 1.5),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(radiusM),
          borderSide: const BorderSide(color: AppColors.error, width: 2),
        ),
        disabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(radiusM),
          borderSide: const BorderSide(color: AppColors.disabled),
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
        primary: AppColors.primaryLight,
        secondary: AppColors.tertiaryLight,
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
        elevation: 2,
        shadowColor: Colors.black.withValues(alpha: 0.4),
        surfaceTintColor: Colors.transparent,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(radiusM),
          side: const BorderSide(color: AppColors.darkBorder),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: _filledButtonStyle(
          base: AppColors.primaryLight,
          hover: AppColors.primary,
          foreground: AppColors.darkBackground,
        ).copyWith(textStyle: WidgetStateProperty.all(textTheme.labelLarge)),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: _outlinedButtonStyle(
          base: AppColors.primaryLight,
          hoverBackground: AppColors.primaryLight.withValues(alpha: 0.15),
        ).copyWith(textStyle: WidgetStateProperty.all(textTheme.labelLarge)),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.darkSurface,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(radiusM),
          borderSide: const BorderSide(color: AppColors.darkBorder),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(radiusM),
          borderSide: const BorderSide(color: AppColors.primaryLight, width: 2),
        ),
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      ),
    );
  }

  // ---- أنماط أزرار إضافية جاهزة للاستخدام المباشر (Danger / Success) ----
  // مش جزء من الـ Theme العام (عشان معظم الأزرار الافتراضية أساسي/ثانوي)،
  // لكن متاحة لأي شاشة تحتاج زرار "احذف" أو "تأكيد" بلون واضح دلاليًا.
  static ButtonStyle dangerButtonStyle() => _filledButtonStyle(
        base: AppColors.error,
        hover: const Color(0xFFB91C1C),
        foreground: Colors.white,
      );

  static ButtonStyle successButtonStyle() => _filledButtonStyle(
        base: AppColors.success,
        hover: const Color(0xFF15803D),
        foreground: Colors.white,
      );
}
