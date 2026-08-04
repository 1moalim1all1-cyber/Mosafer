import 'package:flutter/material.dart';

/// نظام ألوان "مسافر" - Design System حديث بمعايير التطبيقات العالمية
/// (BlaBlaCar, Airbnb, Booking, Uber). القيم دي محددة بالضبط زي ما
/// اتطلب، مش اجتهاد شخصي - أي تغيير هنا بيطبّق على كل زرار وكارت
/// وحقل إدخال في التطبيق تلقائيًا لأن كل حاجة بتقرا من هنا.
class AppColors {
  AppColors._();

  // ---- الألوان الأساسية (Brand) ----
  static const Color primary = Color(0xFF2563EB); // أزرق أساسي
  static const Color primaryDark = Color(0xFF1D4ED8); // Hover/Active - أغمق
  static const Color primaryLight = Color(0xFF60A5FA); // للتدرجات والخلفيات الفاتحة

  // نفس الأزرق الأساسي بدون لون تمييزي تاني - Design System أحادي اللون
  // الأساسي، متماسك، مش مبعثر بين أكتر من هوية لونية
  static const Color accent = primary;
  static const Color accentLight = primaryLight;
  static const Color accentDark = primaryDark;

  // الثانوي (Dark Navy) - للعناصر الثانوية والوضع الداكن
  static const Color tertiary = Color(0xFF0F172A);
  static const Color tertiaryLight = Color(0xFF334155);

  // ---- ألوان الميزات الخاصة (لازم تكون مميزة بصريًا وواضحة من نظرة واحدة) ----
  static const Color returnEmptyTrip = Color(0xFF16A34A); // نفس Success
  static const Color womenOnly = Color(0xFFDB2777); // وردي مميز واضح

  // ---- حالات النظام ----
  static const Color success = Color(0xFF16A34A);
  static const Color error = Color(0xFFDC2626);
  static const Color warning = Color(0xFFF59E0B);
  static const Color info = Color(0xFF3B82F6);
  static const Color disabled = Color(0xFFCBD5E1);

  // ---- الوضع الفاتح (Light Mode) ----
  static const Color lightBackground = Color(0xFFF8FAFC);
  static const Color lightSurface = Color(0xFFFFFFFF);
  static const Color lightTextPrimary = Color(0xFF0F172A);
  static const Color lightTextSecondary = Color(0xFF64748B);
  static const Color lightBorder = Color(0xFFE2E8F0);

  // ---- الوضع الداكن (Dark Mode) - مبني على نفس عائلة الألوان
  // (Slate) بتاعت الوضع الفاتح عشان الهوية تفضل متماسكة بين الوضعين ----
  static const Color darkBackground = Color(0xFF0F172A);
  static const Color darkSurface = Color(0xFF1E293B);
  static const Color darkTextPrimary = Color(0xFFF1F5F9);
  static const Color darkTextSecondary = Color(0xFF94A3B8);
  static const Color darkBorder = Color(0xFF334155);

  // ---- تقييم النجوم ----
  static const Color ratingStar = Color(0xFFF59E0B);

  // ---- Trust Score Badge (حسب المستوى) ----
  static const Color trustBronze = Color(0xFFB08D57);
  static const Color trustSilver = Color(0xFF94A3B8);
  static const Color trustGold = Color(0xFFF59E0B);
}
