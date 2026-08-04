import 'package:flutter/material.dart';

/// نظام ألوان "مسافر" — هوية بصرية عصرية وجذابة: تيل عميق (ثقة + حركة)
/// + كورال دافئ (طاقة + دعوة للفعل)، بعيدة عن كحلي الشكل الرسمي القديم
/// وعن ألوان المنافسين المباشرين (أسود Uber، أخضر Careem، أزرق BlaBlaCar).
class AppColors {
  AppColors._();

  // ---- الألوان الأساسية (Brand) ----
  static const Color primary = Color(0xFF0D5C63); // تيل عميق
  static const Color primaryLight = Color(0xFF15807F);
  static const Color primaryDark = Color(0xFF083D42);

  static const Color accent = Color(0xFFFF6B4A); // كورال دافئ
  static const Color accentLight = Color(0xFFFF8C6E);
  static const Color accentDark = Color(0xFFE0492C);

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
