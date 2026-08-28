# مسافر | Mosafer - نسخة React

## نظرة عامة
مسافر تطبيق ويب متكامل لحجز ومشاركة الرحلات، يربط بين السائقين والركاب بسهولة وأمان.

## الميزات الرئيسية

### 👤 للمستخدمين (الركاب)
- 🔐 تسجيل وتسجيل دخول آمن
- 🔍 البحث عن رحلات بمرونة
- 💳 نظام محفظة إلكترونية
- ⭐ تقييم وتقيم السائقين
- 💬 ��ظام شات مباشر
- 🎫 إدارة الحجوزات
- ❤️ حفظ الرحلات المفضلة

### 🚗 للسائقين
- 📋 إنشاء رحلات مخصصة
- 📊 لوحة تحكم شاملة
- 👁️ إدارة الحجوزات
- 💰 نظام الأرباح والسحب
- 🛡️ التحقق الأمني والمستندات

### 👨‍💼 للإدارة
- 📈 إحصائيات شاملة
- 👥 إدارة المستخدمين والسائقين
- 🎟️ نظام الكوبونات والعروض
- 📍 إدارة المحافظات والمناطق
- 🛠️ الإعدادات والتكوينات

## التقنيات المستخدمة

### Frontend
- **React 19** - UI Framework
- **TypeScript** - Type Safety
- **Tailwind CSS** - Styling
- **React Router v7** - Navigation
- **React Hook Form** - Form Management
- **React Query** - State Management
- **i18n** - Internationalization (AR/EN)

### Backend Services
- **Firebase** - Authentication & Realtime Database
- **Firestore** - Cloud Database
- **Leaflet** - Maps Integration

### Build Tools
- **Vite** - Build Tool
- **Capacitor** - Mobile App Wrapper
- **Oxlint** - Code Linting

## المشروع الحالي - المرحلة 1 ✅

### ✨ المنجز
- ✅ نظام التسجيل والدخول (Firebase Authentication)
- ✅ الصفحة الرئيسية ونموذج البحث
- ✅ نظام التصميم الكامل
- ✅ اتصال Firebase
- ✅ جميع الـ Types والـ Interfaces
- ✅ Custom Hooks الكاملة
- ✅ مكونات UI متقدمة
- ✅ نظام الترجمة (العربية والإنجليزية)
- ✅ Utils وHelper Functions

### 🚀 المرحلة 2 (قادمة)
- نتائج البحث والفلاتر
- تفاصيل الرحلة الكاملة
- نظام الحجز والدفع
- لوحة السائق والركاب
- نظام الإشعارات
- نظام الشات والرسائل

## الإعداد والتشغيل

### المتطلبات
- Node.js 18+
- npm أو yarn

### خطوات التثبيت

```bash
# استنساخ المستودع
git clone https://github.com/1moalim1all1-cyber/Mosafer.git
cd Mosafer

# تثبيت المكتبات
npm install

# نسخ متغيرات البيئة
cp .env.example .env

# تعديل .env ببيانات Firebase الفعلية
# ثم قم بحفظ الملف

# تشغيل التطبيق
npm run dev
```

### البناء والنشر

```bash
# بناء النسخة الإنتاجية
npm run build

# معاينة النسخة المبنية
npm run preview

# للتطبيقات المحمولة (Capacitor)
npm run build:app
```

## بنية المشروع

```
src/
├── components/          # مكونات React
│   ├── ui/             # مكونات UI الأساسية
│   └── ...             # مكونات أخرى
├── pages/              # صفحات التطبيق
├── types/              # Type Definitions
├── hooks/              # Custom React Hooks
├── contexts/           # React Contexts
├── lib/                # Utility Functions
├── locales/            # ملفات الترجمة
├── constants/          # الثوابت
├── config/             # التكوينات
├── routes/             # Route Guards
├── assets/             # الصور والملفات الثابتة
└── main.tsx            # نقطة الدخول
```

## متغيرات البيئة

```env
# Firebase
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# App
VITE_APP_URL=http://localhost:5173
VITE_API_URL=http://localhost:3000
VITE_ENV=development
```

## ال��ساهمة

1. Fork المستودع
2. إنشاء فرع للميزة الجديدة (`git checkout -b feature/amazing-feature`)
3. Commit التغييرات (`git commit -m 'Add amazing feature'`)
4. Push الفرع (`git push origin feature/amazing-feature`)
5. فتح Pull Request

## الترخيص

هذا المشروع مرخص تحت MIT License

## التواصل

- 📧 البريد: 1moalim1all1@gmail.com
- 🐙 GitHub: [@1moalim1all1-cyber](https://github.com/1moalim1all1-cyber)

---

**صُنع بـ ❤️ من قِبل فريق Mosafer**
