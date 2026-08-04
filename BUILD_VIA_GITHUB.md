# بناء الـ APK عبر GitHub Actions (من غير Flutter على جهازك خالص)

هنستخدم سيرفرات GitHub المجانية عشان تبني الـ APK بدل جهازك. الميزة: مش
محتاج تحمّل Flutter (1.7 جيجا) ولا تتعامل مع مشاكل PATH خالص.

---

## المرحلة 1: جهّز ملف Firebase (مرة واحدة بس)

### 1.1 سجّل تطبيق Android في Firebase (بدون تحميل أي ملف)
1. روح لمشروعك على https://console.firebase.google.com
2. من ⚙️ (جنب "Project Overview") → **Project settings**
3. انزل لـ **Your apps** → دوس أيقونة **Android**
4. في **Android package name** اكتب بالظبط:
   ```
   com.mosafer.app
   ```
5. دوس **Register app** واستمر، **مفيش داعي تحمّل أي ملف** — سيبها كده
   وارجع لصفحة Project settings

### 1.2 جهّز firebase_options.dart
1. من نفس صفحة **Project settings**، هتلاقي تحت "Your apps" التطبيق اللي
   سجلته، دوس عليه وهتلاقي قيم زي: `apiKey`, `appId`, `messagingSenderId`,
   `projectId`, `storageBucket`
2. افتح `lib/firebase_options.template.dart`
3. املأ القيم الخمسة دي مكان النصوص "ضع_قيمة_...هنا"
4. احفظ الملف باسم جديد: `lib/firebase_options.dart` (سيب الملف القديم
   الـ Template زي ما هو، مش هيأثر على حاجة)

> ملحوظة: مش محتاجين `google-services.json` خالص - `firebase_options.dart`
> بيدي كل البيانات اللي Firebase محتاجها مباشرة، وده أبسط وأقل عرضة
> لمشاكل توافق إصدارات Gradle.

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

---

# بديل أبسط بكتير: نسخة الويب (تشتغل في المتصفح)

نسخة الويب مالهاش علاقة خالص بمشاكل Android/Gradle - أسهل وأسرع تجربة.

## المرحلة الإضافية: سجّل تطبيق ويب في Firebase
1. نفس صفحة **Project settings** في Firebase Console
2. تحت **Your apps** → دوس أيقونة **</>** (Web)
3. اكتب اسم زي `Mosafer Web` ودوس **Register app**
4. هيديك القيم دي: `apiKey`, `appId`, `messagingSenderId`, `projectId`,
   `authDomain`, `storageBucket`
5. افتح `lib/firebase_options.template.dart` (لو لسه معملتوش)، املأ **قسم
   web** بالقيم دي (بالإضافة لقسم android لو محتاجه)، واحفظه
   `lib/firebase_options.dart`

## فعّل GitHub Pages في الـ Repository
1. من صفحة الـ Repository على GitHub → **Settings**
2. من القائمة الجانبية → **Pages**
3. تحت **Build and deployment** → **Source**: اختار **GitHub Actions**

## ادفع الكود
```bash
git add .
git commit -m "نسخة الويب"
git push
```

## تابع النشر
1. تبويب **Actions** → هتلاقي عملية اسمها **"بناء ونشر نسخة الويب"**
2. لما تخلص بعلامة ✅، روح لـ **Settings → Pages** تاني، هتلاقي رابط
   الموقع فوق (زي `https://1moalim1all1-cyber.github.io/Mosafer/`)
3. افتح الرابط في أي متصفح — التطبيق هيشتغل مباشرة من غير تثبيت أي حاجة

## ملحوظة
بعض الميزات (زي الإشعارات الحقيقية Push على الموبايل) خاصة بتطبيق
الموبايل بس. نسخة الويب مثالية للتجربة السريعة ومعاينة الشاشات والتدفق
العام، مش بديل كامل عن الـ APK للاستخدام الفعلي.
