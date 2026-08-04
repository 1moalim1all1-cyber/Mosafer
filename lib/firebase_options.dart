// ملف إعدادات Firebase - القيم دي عامة (Public) بطبيعتها في أي تطبيق
// Firebase، الحماية الفعلية موجودة في firestore.rules مش في إخفاء الملف ده.

import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart' show kIsWeb;

class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    // بنفرّق بين الويب والأندرويد بس عبر kIsWeb (مش dart:io Platform)،
    // عشان الملف ده يتصنّف صح للويب من غير أي مشاكل - dart:io أصلاً
    // مش متاحة للويب خالص وبتكسر البناء لو اتستوردت هنا.
    return kIsWeb ? web : android;
  }

  // قيم تطبيق "ويب" من Firebase Console
  static const FirebaseOptions web = FirebaseOptions(
    apiKey: 'AIzaSyDbrbDg3z9IDn_o6rxWkVQH3Z0oIlDDgXM',
    appId: '1:506602326195:web:d84d1a8b0e072bd92308c6',
    messagingSenderId: '506602326195',
    projectId: 'mosafer-c43be',
    authDomain: 'mosafer-c43be.firebaseapp.com',
    storageBucket: 'mosafer-c43be.firebasestorage.app',
    measurementId: 'G-201F285L1N',
  );

  // قيم تطبيق "أندرويد" - لسه محتاجة تتملأ لما تيجي تبني APK.
  // سجّل تطبيق Android في نفس مشروع Firebase (mosafer-c43be) بـ
  // package name = com.mosafer.app، وهات القيم من هناك.
  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'ضع_قيمة_apiKey_هنا',
    appId: 'ضع_قيمة_appId_هنا',
    messagingSenderId: 'ضع_قيمة_messagingSenderId_هنا',
    projectId: 'mosafer-c43be',
    storageBucket: 'mosafer-c43be.firebasestorage.app',
  );
}
