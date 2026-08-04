// ملف مؤقت (Template) - املأ القيم من Firebase Console بدل ما تستخدم
// flutterfire CLI (تجنّبًا للحاجة لتثبيت Flutter محليًا).
//
// فين تلاقي القيم دي:
// Firebase Console -> اختار مشروعك -> ⚙️ Project settings -> انزل لتحت
// لحد "Your apps" -> لو مفيش تطبيق Android مضاف، دوس على أيقونة Android
// وسجّل (Android package name = com.mosafer.app بالظبط زي ما هو مكتوب
// في android/app/build.gradle.kts) -> هيديك القيم دي كلها جاهزة، أو
// تلاقيها تاني في "SDK setup and configuration" لو التطبيق مسجّل بالفعل.

import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'dart:io' show Platform;

class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (Platform.isAndroid) {
      return android;
    }
    throw UnsupportedError(
      'DefaultFirebaseOptions مُعدّة لأندرويد بس في المشروع ده حاليًا.',
    );
  }

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'ضع_قيمة_apiKey_هنا',
    appId: 'ضع_قيمة_appId_هنا',
    messagingSenderId: 'ضع_قيمة_messagingSenderId_هنا',
    projectId: 'ضع_قيمة_projectId_هنا',
    storageBucket: 'ضع_قيمة_storageBucket_هنا', // مثال: mosafer-xxxxx.appspot.com
  );
}
