# بناء الـ APK عبر GitHub Actions (من غير Flutter على جهازك خالص)

هنستخدم سيرفرات GitHub المجانية عشان تبني الـ APK بدل جهازك. الميزة: مش
محتاج تحمّل Flutter (1.7 جيجا) ولا تتعامل مع مشاكل PATH خالص.

---

## المرحلة 1: جهّز ملفات Firebase (مرة واحدة بس)

### 1.1 سجّل تطبيق Android في Firebase
1. روح لمشروعك على https://console.firebase.google.com
2. من ⚙️ (جنب "Project Overview") → **Project settings**
3. انزل لـ **Your apps** → دوس أيقونة **Android**
4. في **Android package name** اكتب بالظبط:
   ```
   com.mosafer.app
   ```
5. سيبها تكمل، هتقولك "Download google-services.json" → حمّله

### 1.2 حط الملف في مكانه
انسخ `google-services.json` اللي نزلته، وحطه هنا بالظبط:
```
mosafer_app/android/app/google-services.json
```

### 1.3 جهّز firebase_options.dart
1. من نفس صفحة **Project settings** اللي إنت فيها، هتلاقي تحت
   "SDK setup and configuration" قيم زي: `apiKey`, `appId`,
   `messagingSenderId`, `projectId`, `storageBucket`
2. افتح `lib/firebase_options.template.dart`
3. املأ القيم الخمسة دي مكان النصوص "ضع_قيمة_...هنا"
4. احفظ الملف باسم جديد: `lib/firebase_options.dart` (يعني هيبقى عندك
   الملفين: القديم Template والجديد المملوء - سيب الاتنين، مش هيأثروا)

---

## المرحلة 2: جهّز ملف .env

انسخ `.env.example` وسمّي النسخة `.env` في نفس المجلد الرئيسي، واملأ فيه
بيانات Cloudinary اللي عملتها قبل كده:
```
CLOUDINARY_CLOUD_NAME=اسم_الحساب_بتاعك
CLOUDINARY_UPLOAD_PRESET=mosafer_unsigned
```

---

## المرحلة 3: ارفع المشروع على GitHub

### 3.1 لو معندكش Git متثبت
حمّله من https://git-scm.com/downloads (تثبيت عادي Next, Next)

### 3.2 اعمل Repository جديد على GitHub
1. روح https://github.com/new
2. اسم الـ Repository: `mosafer-app`
3. **مهم:** اختار **Private** (عشان بيانات Firebase متبقاش ظاهرة للعامة)
4. متضفش README أو .gitignore من هنا (عندنا بالفعل)
5. دوس **Create repository**

### 3.3 من جوه مجلد المشروع، في Terminal عادي (مش لازم Administrator)
```bash
cd مسار/mosafer_app
git init
git add .
git commit -m "أول نسخة من مسافر"
git branch -M main
git remote add origin https://github.com/اسم_حسابك/mosafer-app.git
git push -u origin main
```
لو طلب منك تسجيل دخول، هيفتحلك المتصفح تسجّل بحساب GitHub بتاعك عادي.

---

## المرحلة 4: شغّل البناء

بمجرد ما الـ `push` يخلص، GitHub هيشغّل البناء **أوتوماتيك** (الملف
`.github/workflows/build-apk.yml` بيعمل كده لوحده). عشان تتابعه:

1. روح لصفحة الـ Repository بتاعك على GitHub
2. دوس تبويب **Actions** فوق
3. هتلاقي عملية شغالة اسمها "بناء APK لمسافر" - دوس عليها تتابع التقدم
   (بياخد حوالي 5-10 دقايق أول مرة)

---

## المرحلة 5: حمّل الـ APK

1. لما العملية تخلص (علامة ✅ خضرا)، دوس عليها
2. انزل لتحت لحد قسم **Artifacts**
3. دوس على **mosafer-app-release** عشان تنزّله (هيجيلك ملف zip فيه الـ APK)
4. فك الضغط، هتلاقي `app-release.apk` — انقله لموبايلك وثبّته

---

## لو حصل خطأ في الـ Build (علامة ❌ حمرا)
1. دوس على العملية اللي فشلت
2. دوس على خطوة "بناء APK" (اللي جنبها ❌)
3. انسخ رسالة الخطأ **كاملة** من آخر الصفحة وابعتهالي، وهساعدك نحلها فورًا
