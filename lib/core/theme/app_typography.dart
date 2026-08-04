import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// نظام الطباعة: Cairo للعناوين (وزن أثقل وحضور بصري أقوى)
/// و IBM Plex Sans Arabic للنصوص (وضوح أعلى في الفقرات الطويلة).
/// google_fonts مجانية بالكامل ولا تحتاج تحميل ملفات خطوط يدويًا.
class AppTypography {
  AppTypography._();

  static TextTheme textTheme(bool isArabic) {
    final headlineFont = isArabic ? GoogleFonts.cairo : GoogleFonts.inter;
    final bodyFont =
        isArabic ? GoogleFonts.ibmPlexSansArabic : GoogleFonts.inter;

    return TextTheme(
      displayLarge: headlineFont(fontSize: 32, fontWeight: FontWeight.w700),
      displayMedium: headlineFont(fontSize: 28, fontWeight: FontWeight.w700),
      headlineLarge: headlineFont(fontSize: 24, fontWeight: FontWeight.w600),
      headlineMedium: headlineFont(fontSize: 20, fontWeight: FontWeight.w600),
      titleLarge: headlineFont(fontSize: 18, fontWeight: FontWeight.w600),
      titleMedium: bodyFont(fontSize: 16, fontWeight: FontWeight.w500),
      bodyLarge: bodyFont(fontSize: 16, fontWeight: FontWeight.w400),
      bodyMedium: bodyFont(fontSize: 14, fontWeight: FontWeight.w400),
      bodySmall: bodyFont(fontSize: 12, fontWeight: FontWeight.w400),
      labelLarge: bodyFont(fontSize: 14, fontWeight: FontWeight.w600),
      labelSmall: bodyFont(fontSize: 11, fontWeight: FontWeight.w500),
    );
  }
}
