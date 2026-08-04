import 'package:flutter/material.dart';

/// نظام ألوان "مسافر" - القيم دي محددة بالضبط زي ما اتطلب (نفس روح
/// موقع الدليل الشامل)، مش اجتهاد شخصي.
class AppColors {
  AppColors._();

  // ---- الألوان الأساسية (Brand) ----
  static const Color primary = Color(0xFF1E40AF);
  static const Color primaryDark = Color(0xFF1D4ED8); // Hover
  static const Color primaryLight = Color(0xFFDBEAFE); // خلفيات وعناصر ثانوية

  static const Color accent = primary;
  static const Color accentLight = primaryLight;
  static const Color accentDark = primaryDark;

  static const Color tertiary = Color(0xFF111827);
  static const Color tertiaryLight = Color(0xFF374151);

  // ---- ألوان الميزات الخاصة ----
  static const Color returnEmptyTrip = Color(0xFF22C55E);
  static const Color womenOnly = Color(0xFFDB2777);

  // ---- حالات النظام ----
  static const Color success = Color(0xFF22C55E);
  static const Color error = Color(0xFFEF4444);
  static const Color warning = Color(0xFFF59E0B);
  static const Color info = Color(0xFF1E40AF);
  static const Color disabled = Color(0xFFCBD5E1);

  // ---- الوضع الفاتح (Light Mode) ----
  static const Color lightBackground = Color(0xFFF8FAFC);
  static const Color lightSurface = Color(0xFFFFFFFF);
  static const Color lightTextPrimary = Color(0xFF111827);
  static const Color lightTextSecondary = Color(0xFF6B7280);
  static const Color lightBorder = Color(0xFFE5E7EB);

  // ---- الوضع الداكن (Dark Mode) ----
  static const Color darkBackground = Color(0xFF0F172A);
  static const Color darkSurface = Color(0xFF1E293B);
  static const Color darkTextPrimary = Color(0xFFF1F5F9);
  static const Color darkTextSecondary = Color(0xFF94A3B8);
  static const Color darkBorder = Color(0xFF334155);

  // ---- تقييم النجوم ----
  static const Color ratingStar = Color(0xFFF59E0B);

  // ---- Trust Score Badge ----
  static const Color trustBronze = Color(0xFFB08D57);
  static const Color trustSilver = Color(0xFF94A3B8);
  static const Color trustGold = Color(0xFFF59E0B);
}
