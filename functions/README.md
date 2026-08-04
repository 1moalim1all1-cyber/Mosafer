# Cloud Functions - مسافر

## الإعداد أول مرة

```bash
cd functions
npm install
```

## التشغيل محليًا (Emulator) قبل النشر - مهم تجربه الأول

```bash
firebase emulators:start --only functions,firestore
```

هيديك روابط الـ Emulator UI تقدر تتابع منها استدعاءات الـ Functions ومحتوى
Firestore وقت الاختبار، من غير ما تلمس بيانات حقيقية أو تستهلك حصتك المجانية.

لو عايز تطبيق Flutter يتكلم مع الـ Emulator بدل السيرفر الحقيقي وقت
الاختبار، ضيف السطر ده في `main.dart` بعد `Firebase.initializeApp`:
```dart
FirebaseFunctions.instance.useFunctionsEmulator('localhost', 5001);
```

## النشر الفعلي

```bash
firebase deploy --only functions
```

أول نشر ممكن ياخد كام دقيقة. Firebase هيطلب منك تفعيل خطة Blaze لو لسه
معملتهاش (زي ما اتفقنا، صفر تكلفة فعلية طول ما تحت الحصة المجانية).

## الدوال المتاحة

| الدالة | النوع | الوظيفة |
|---|---|---|
| `createBooking` | Callable | إنشاء حجز بالكامل (فحص المقاعد + خصم المحفظة لو لازم) |
| `respondToBooking` | Callable | قبول/رفض السائق للحجز + استرداد تلقائي |
| `cancelBooking` | Callable | إلغاء الراكب لحجزه بنفسه |
| `markTripCompleted` | Callable | إنهاء الرحلة + تحويل الأرباح لمحفظة السائق |
| `approveDriver` / `rejectDriver` | Callable (Admin فقط) | اعتماد/رفض مستندات السائق - هتستخدمها لوحة الإدارة في Phase 9 |
| `onBookingCreated` | Firestore Trigger | إشعار السائق بطلب حجز جديد |
| `onBookingStatusChanged` | Firestore Trigger | إشعار الراكب بقبول/رفض حجزه |
| `onNewChatMessage` | Firestore Trigger | إشعار الطرف التاني في المحادثة |
| `scheduledTripReminder` | Scheduled (كل 15 دقيقة) | تذكير الركاب قبل الرحلة بساعة |

## متغيرات مهمة
مفيش أي مفاتيح API لازم تتحط يدويًا هنا - Cloud Functions بتستخدم صلاحيات
Admin SDK المدمجة تلقائيًا في بيئة Firebase، ومفيش داعي لأي `.env` داخل
مجلد `functions/`.
