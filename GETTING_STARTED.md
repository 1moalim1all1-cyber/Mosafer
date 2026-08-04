# دليل التشغيل من الصفر — مسافر | Mosafer (الطريقة المجانية بالكامل)

> اتبع الخطوات بالترتيب، من غير ما تقفز أي خطوة. في آخر أي مرحلة فيها خطر
> غلط، حطينالك علامة ⚠️.

---

## المرحلة 1: تثبيت الأدوات (مرة واحدة بس على جهازك)

### 1.1 تثبيت Flutter SDK
1. روح على https://docs.flutter.dev/get-started/install
2. اختار نظام التشغيل بتاعك (Windows / macOS / Linux)
3. اتبع خطوات التثبيت هناك بالظبط (بتحمّل ملف وتفكه في مكان وتضيفه لـ PATH)

### 1.2 تثبيت Android Studio
1. روح على https://developer.android.com/studio
2. حمّل وثبّت بشكل عادي (Next, Next, Install)
3. أول ما يفتح، خليه يحمّل Android SDK الافتراضي (هيقترحه عليك تلقائي)

### 1.3 التأكد إن كل حاجة سليمة
افتح Terminal (أو CMD/PowerShell على ويندوز) واكتب:
```bash
flutter doctor
```
هتشوف قائمة فيها ✅ أو ❌. لو فيه ❌ جنب "Android toolchain"، اكتب:
```bash
flutter doctor --android-licenses
```
واقبل كل حاجة بـ `y`. أعد `flutter doctor` تاني للتأكد إن كل حاجة بقت ✅
(أو على الأقل Flutter وAndroid toolchain وAndroid Studio).

---

## المرحلة 2: إنشاء مشروع Firebase (مجاني 100%، من غير بطاقة)

### 2.1 افتح
```
https://console.firebase.google.com
```
سجّل دخول بحساب Google (Gmail) بتاعك.

### 2.2 أنشئ مشروع جديد
1. دوس **Add project** / **إنشاء مشروع**
2. اكتب اسم زي `Mosafer`
3. Google Analytics: سيبها أو اقفلها، مش فارقة
4. دوس **Create project** واستنى لحد ما يخلص

### 2.3 فعّل تسجيل الدخول
1. من القائمة الجانبية: **Build → Authentication**
2. دوس **Get started**
3. اختار **Email/Password** من القائمة
4. فعّلها من الزرار العلوي (**Enable**) واحفظ

### 2.4 فعّل قاعدة البيانات
1. من القائمة الجانبية: **Build → Firestore Database**
2. دوس **Create database**
3. اختار **Start in production mode**
4. اختار أقرب منطقة جغرافية (زي `eur3`)

⚠️ **متعملش أي حاجة تانية دلوقتي** — متفعّلش Blaze، ومتحطش بطاقة. سيبها كده.

---

## المرحلة 3: إنشاء حساب Cloudinary (مجاني 100%، من غير بطاقة)

### 3.1 سجّل حساب
```
https://cloudinary.com/users/register/free
```
بإيميلك أو بحساب Google مباشرة.

### 3.2 انسخ الـ Cloud name
من الصفحة الرئيسية (Dashboard) بعد الدخول، هتلاقي **Cloud name** في نص
الصفحة — انسخه في مكان، هتحتاجه بعد شوية.

### 3.3 اعمل Upload Preset
1. من الأسفل في القائمة الجانبية: **Settings** (⚙️)
2. تبويب **Upload**
3. انزل لحد **Upload presets** → دوس **Add upload preset**
4. **Signing Mode**: اختار **Unsigned**
5. غيّر الاسم (Preset name) لـ: `mosafer_unsigned`
6. دوس **Save**

---

## المرحلة 4: تجهيز المشروع على جهازك

### 4.1 فك ضغط الملف
فك ضغط `mosafer_app.zip` اللي بعتهولك في أي مكان تحب (Desktop مثلاً).

### 4.2 افتح Terminal جوه المجلد
```bash
cd مسار/المجلد/mosafer_app
```

### 4.3 اعمل ملف .env
انسخ `.env.example` وسمّي النسخة `.env`، وافتحه واملأ:
```
CLOUDINARY_CLOUD_NAME=الاسم_اللي_نسخته_من_خطوة_3.2
CLOUDINARY_UPLOAD_PRESET=mosafer_unsigned
```

### 4.4 اربط المشروع بـ Firebase
```bash
dart pub global activate flutterfire_cli
flutterfire configure
```
هيفتحلك Terminal تفاعلي:
- اختار حساب Google بتاعك
- اختار مشروع `Mosafer` اللي عملته في المرحلة 2
- لما يسألك عن المنصات (Platforms)، اختار **android** بس (Space للاختيار،
  Enter للتأكيد) — مش محتاجين iOS/web دلوقتي

هيولّد ملف `lib/firebase_options.dart` تلقائيًا.

### 4.5 فعّل الإعدادات دي في main.dart
افتح `lib/main.dart`، دوّر على السطر ده وشيل التعليق (الـ `//`) من قبله:
```dart
options: DefaultFirebaseOptions.currentPlatform,
```

### 4.6 ثبّت المكتبات
```bash
flutter pub get
```

### 4.7 ولّد ملفات الترجمة
```bash
flutter gen-l10n
```

---

## المرحلة 5: التشغيل

### الطريقة الأسهل (تجربة مباشرة على موبايلك)
1. وصّل موبايل أندرويد بالكابل
2. فعّل **خيارات المطورين** على الموبايل (من Settings → About Phone → دوس
   على "Build number" 7 مرات متتالية)
3. من داخل خيارات المطورين، فعّل **USB Debugging**
4. في التيرمينال:
```bash
flutter run
```
هيثبت التطبيق على موبايلك مباشرة ويشغّله.

### أو: بناء ملف APK تنقله بنفسك
```bash
flutter build apk --release
```
الملف هيبقى هنا:
```
build/app/outputs/flutter-apk/app-release.apk
```

---

## لو حصل أي خطأ
انسخ **النص الكامل** للخطأ (مش سكرين شوت) وابعتهولي، وهساعدك تحلها فورًا.

## تذكير مهم
إنت شغال دلوقتي على خطة **Spark** (مجانية 100%). التسجيل والدخول وتصفح
الرحلات هيشتغلوا. الحجز والدفع والإشعارات والتقييمات مش هيشتغلوا لحد ما
تفعّل خطة **Blaze** لاحقًا (بطاقة كضمان بس، صفر تكلفة فعلية) وتنشر
Cloud Functions.
