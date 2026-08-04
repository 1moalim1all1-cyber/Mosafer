#!/bin/bash
# سكريبت بناء APK لمشروع مسافر - شغّله من جوه مجلد mosafer_app
set -e

echo "🔍 التأكد من وجود Flutter SDK..."
if ! command -v flutter &> /dev/null; then
    echo "❌ Flutter SDK مش متثبت. حمّله من https://flutter.dev أولاً"
    exit 1
fi

echo "🔍 التأكد من وجود ملف .env..."
if [ ! -f .env ]; then
    echo "❌ ملف .env مش موجود. انسخ .env.example باسم .env واملأ بيانات Cloudinary"
    exit 1
fi

echo "🔍 التأكد من ربط Firebase..."
if [ ! -f lib/firebase_options.dart ]; then
    echo "❌ lib/firebase_options.dart مش موجود. شغّل: flutterfire configure"
    exit 1
fi

echo "📦 تثبيت المكتبات..."
flutter pub get

echo "🌍 توليد ملفات الترجمة..."
flutter gen-l10n

echo "🧹 فحص الكود (Analyze)..."
flutter analyze || echo "⚠️  فيه تحذيرات - راجعها فوق، مش لازم تكون أخطاء قاطعة للبناء"

echo "🔨 بناء APK (release)..."
flutter build apk --release

echo ""
echo "✅ خلصنا! الملف موجود في:"
echo "   build/app/outputs/flutter-apk/app-release.apk"
echo ""
echo "لتثبيته على موبايلك مباشرة وهو متوصل بالـ USB:"
echo "   flutter install"
