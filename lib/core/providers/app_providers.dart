import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Provider للغة الحالية (يبدأ بالعربية كلغة افتراضية)
final localeProvider = StateProvider<Locale>((ref) => const Locale('ar'));

/// Provider لوضع الثيم (فاتح/داكن/حسب النظام) - قابل للتبديل يدويًا
/// من شاشة البروفايل، ومحفوظ في SharedPreferences عشان يفضل زي ما
/// المستخدم سابه بعد ما يقفل التطبيق ويفتحه تاني.
final themeModeProvider = StateProvider<ThemeMode>((ref) => ThemeMode.system);
