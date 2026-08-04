import 'package:flutter/material.dart';

/// نظام ألوان "مسافر" — هوية فاخرة عصرية: أسود عميق (فخامة وثقة) +
/// ذهبي دافئ (تميّز وقيمة) + بني كخلفية ثانوية (دفء وثبات)، بإحساس
/// خدمة نقل راقية بدل الشكل الابتدائي القديم.
class AppColors {
  AppColors._();

  // ---- الألوان الأساسية (Brand) ----
  static const Color primary = Color(0xFF16130F); // أسود دافئ (مش أسود خالص)
  static const Color primaryLight = Color(0xFF2A241C);
  static const Color primaryDark = Color(0xFF0A0805);

  static const Color accent = Color(0xFFC9A052); // ذهبي فاخر
  static const Color accentLight = Color(0xFFDCC080);
  static const Color accentDark = Color(0xFFA9813A);

  // لون ثالث بني للخلفيات والتفاصيل الثانوية
  static const Color tertiary = Color(0xFF6B4B32);
  static const Color tertiaryLight = Color(0xFF8A6A48);

  // ---- ألوان الميزات الخاصة (لازم تكون مميزة بصريًا وواضحة من نظرة واحدة) ----
  static const Color returnEmptyTrip = Color(0xFF2E9E6C); // أخضر - "راجع فاضي"
  static const Color womenOnly = Color(0xFFB5487A); // وردي عنابي - "سيدات فقط"

  // ---- حالة النجاح / الخطأ / التحذير ----
  static const Color success = Color(0xFF2E9E6C);
  static const Color error = Color(0xFFD64545);
  static const Color warning = Color(0xFFE0A62E);
  static const Color info = Color(0xFF3B82C4);

  // ---- الوضع الفاتح (Light Mode) ----
  static const Color lightBackground = Color(0xFFFAF7F2); // كريمي دافئ
  static const Color lightSurface = Color(0xFFFFFFFF);
  static const Color lightTextPrimary = Color(0xFF1A1D23);
  static const Color lightTextSecondary = Color(0xFF6B7280);
  static const Color lightBorder = Color(0xFFE8E0D3);

  // ---- الوضع الداكن (Dark Mode) ----
  static const Color darkBackground = Color(0xFF0D1117);
  static const Color darkSurface = Color(0xFF161B22);
  static const Color darkTextPrimary = Color(0xFFF0F2F5);
  static const Color darkTextSecondary = Color(0xFF9CA3AF);
  static const Color darkBorder = Color(0xFF2A3038);

  // ---- تقييم النجوم ----
  static const Color ratingStar = Color(0xFFFFB020);

  // ---- Trust Score Badge (حسب المستوى) ----
  static const Color trustBronze = Color(0xFFB08D57);
  static const Color trustSilver = Color(0xFFA8AEB8);
  static const Color trustGold = Color(0xFFD4AF37);
}
