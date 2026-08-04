import 'package:flutter/material.dart';

/// نظام ألوان "مسافر" — هوية بصرية مصرية دافئة ومميزة،
/// بعيدة عن التقليد الحرفي لألوان Uber (الأسود) أو Careem (الأخضر) أو BlaBlaCar (الأزرق الفاتح).
///
/// الفكرة: كحلي عميق (ثقة + أمان + احترافية) + برتقالي دافئ (طاقة + سفر + دفء مصري)
class AppColors {
  AppColors._();

  // ---- الألوان الأساسية (Brand) ----
  static const Color primary = Color(0xFF0B2545); // كحلي عميق
  static const Color primaryLight = Color(0xFF1B3A6B);
  static const Color primaryDark = Color(0xFF061831);

  static const Color accent = Color(0xFFFF8C42); // برتقالي دافئ
  static const Color accentLight = Color(0xFFFFA766);
  static const Color accentDark = Color(0xFFE06F26);

  // ---- ألوان الميزات الخاصة (لازم تكون مميزة بصريًا وواضحة من نظرة واحدة) ----
  static const Color returnEmptyTrip = Color(0xFF2E9E6C); // أخضر - "راجع فاضي"
  static const Color womenOnly = Color(0xFFB5487A); // وردي عنابي - "سيدات فقط"

  // ---- حالة النجاح / الخطأ / التحذير ----
  static const Color success = Color(0xFF2E9E6C);
  static const Color error = Color(0xFFD64545);
  static const Color warning = Color(0xFFE0A62E);
  static const Color info = Color(0xFF3B82C4);

  // ---- الوضع الفاتح (Light Mode) ----
  static const Color lightBackground = Color(0xFFF7F8FA);
  static const Color lightSurface = Color(0xFFFFFFFF);
  static const Color lightTextPrimary = Color(0xFF1A1D23);
  static const Color lightTextSecondary = Color(0xFF6B7280);
  static const Color lightBorder = Color(0xFFE5E7EB);

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
