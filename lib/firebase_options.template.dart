// ملف مؤقت (Template) - املأ القيم من Firebase Console بدل ما تستخدم
// flutterfire CLI (تجنّبًا للحاجة لتثبيت Flutter محليًا).
//
// فين تلاقي القيم دي:
// Firebase Console -> اختار مشروعك -> ⚙️ Project settings -> انزل لتحت
// لحد "Your apps" -> سجّل تطبيق ويب (أيقونة </>) وتطبيق أندرويد لو لسه
// معملتهمش، وهيديك القيم دي كلها جاهزة لكل واحد فيهم.

import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart' show kIsWeb;

class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    // بنفرّق بين الويب والأندرويد بس عبر kIsWeb (مش dart:io Platform)،
    // عشان الملف ده يتصنّف صح للويب من غير أي مشاكل - dart:io أصلاً
    // مش متاحة للويب خالص وبتكسر البناء لو اتستوردت هنا.
    return kIsWeb ? web : android;
  }

  // القيم دي من تسجيل تطبيق "ويب" (أيقونة </>) في Firebase Console
  static const FirebaseOptions web = FirebaseOptions(
    apiKey: 'ضع_قيمة_apiKey_هنا',
    appId: 'ضع_قيمة_appId_هنا',
    messagingSenderId: 'ضع_قيمة_messagingSenderId_هنا',
    projectId: 'ضع_قيمة_projectId_هنا',
    authDomain: 'ضع_قيمة_authDomain_هنا', // مثال: mosafer-xxxxx.firebaseapp.com
    storageBucket: 'ضع_قيمة_storageBucket_هنا',
  );

  // القيم دي من تسجيل تطبيق "أندرويد" في Firebase Console
  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'ضع_قيمة_apiKey_هنا',
    appId: 'ضع_قيمة_appId_هنا',
    messagingSenderId: 'ضع_قيمة_messagingSenderId_هنا',
    projectId: 'ضع_قيمة_projectId_هنا',
    storageBucket: 'ضع_قيمة_storageBucket_هنا', // مثال: mosafer-xxxxx.appspot.com
  );
}

