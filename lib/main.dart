import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:intl/date_symbol_data_local.dart';

import 'core/theme/app_theme.dart';
import 'core/routing/app_router.dart';
import 'core/constants/app_constants.dart';
import 'core/services/fcm_service.dart';
import 'core/providers/app_providers.dart';
import 'firebase_options.dart';
import 'l10n/generated/app_localizations.dart';
import 'presentation/auth/providers/auth_providers.dart';
import 'presentation/notifications/providers/notification_providers.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // تحميل متغيرات البيئة (Cloudinary وغيرها)
  await dotenv.load(fileName: '.env');

  // تهيئة بيانات التاريخ باللغة العربية (أسماء الأيام والشهور) - بيُستخدم
  // في كل مكان بيعرض وقت/تاريخ الرحلة زي DateFormat('...', 'ar')
  await initializeDateFormatting('ar');

  // تهيئة Firebase - lib/firebase_options.dart لازم تعمله من firebase_options.template.dart
  // (املأ القيم من Firebase Console واحفظ الملف باسم firebase_options.dart)
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );

  // استرجاع اللغة ووضع الألوان المحفوظين من قبل (لو المستخدم غيّرهم قبل كده)
  final prefs = await SharedPreferences.getInstance();
  final savedLanguage = prefs.getString(AppConstants.keyLanguage) ?? 'ar';
  final savedThemeMode = prefs.getString(AppConstants.keyThemeMode);
  final initialThemeMode = ThemeMode.values.firstWhere(
    (m) => m.name == savedThemeMode,
    orElse: () => ThemeMode.system,
  );

  runApp(
    ProviderScope(
      overrides: [
        localeProvider.overrideWith((ref) => Locale(savedLanguage)),
        themeModeProvider.overrideWith((ref) => initialThemeMode),
      ],
      child: const MosaferApp(),
    ),
  );
}

class MosaferApp extends ConsumerWidget {
  const MosaferApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final locale = ref.watch(localeProvider);
    final themeMode = ref.watch(themeModeProvider);
    final isArabic = locale.languageCode == 'ar';
    final router = ref.watch(goRouterProvider);

    // أول ما المستخدم يسجّل دخول، نجهّز إشعارات الجهاز (صلاحية + FCM Token)
    ref.listen(authStateChangesProvider, (previous, next) {
      final user = next.valueOrNull;
      if (user != null && previous?.valueOrNull?.uid != user.uid) {
        FcmService.instance.initialize(
          userId: user.uid,
          notificationRepository: ref.read(notificationRepositoryProvider),
        );
      }
    });

    return MaterialApp.router(
      title: AppConstants.appName,
      debugShowCheckedModeBanner: false,

      // ---- دعم اللغتين والاتجاه (RTL/LTR) ----
      locale: locale,
      supportedLocales: const [
        Locale('ar'), // العربية - اللغة الافتراضية
        Locale('en'), // الإنجليزية
      ],
      localizationsDelegates: const [
        AppLocalizations.delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      // Flutter بيحدد الاتجاه (RTL/LTR) أوتوماتيك حسب الـ Locale المختارة،
      // العربية بتاخد RTL تلقائيًا والإنجليزية LTR بدون أي كود إضافي.

      // ---- الثيمات ----
      theme: AppTheme.light(isArabic: isArabic),
      darkTheme: AppTheme.dark(isArabic: isArabic),
      themeMode: themeMode,

      // ---- التنقل ----
      routerConfig: router,
    );
  }
}
