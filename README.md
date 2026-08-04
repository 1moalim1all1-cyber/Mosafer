# مسافر | Mosafer - نسخة React

## الحالة الحالية (Phase 1 - جربتها وبنيتها فعليًا بنجاح)
- ✅ تسجيل حساب / تسجيل دخول برقم الموبايل (نفس منطق نسخة Flutter بالظبط)
- ✅ الصفحة الرئيسية بنموذج بحث
- ✅ نظام تصميم كامل (ألوان، أزرار بكل الحالات، حقول إدخال، بطاقات)
- ✅ متصل بنفس مشروع Firebase (نفس قاعدة البيانات والمستخدمين)
- ✅ **جرّبت `npm run build` بنفسي وشغّال بدون أي أخطاء**

## التشغيل محليًا
```bash
npm install
npm run dev
```

## قبل النشر - لازم تتأكد
تأكد إن `firestore.rules` بتاعت مشروع Flutter القديم منشورة بالفعل على
نفس مشروع Firebase (لو نشرتها قبل كده، مفيش داعي تعمل حاجة تانية - نفس
القواعد شغالة هنا كمان لأننا بنستخدم نفس قاعدة البيانات بالظبط).

## النشر على GitHub Pages
1. اعمل Repository جديد على GitHub
2. لو اسم الـ Repository مختلف عن `mosafer-web`، عدّل `base` في `vite.config.ts`
3. من Settings → Pages → Source: اختار **GitHub Actions**
4. ادفع الكود:
```bash
git init
git add .
git commit -m "أول نسخة React من مسافر"
git branch -M main
git remote add origin https://github.com/USERNAME/REPO.git
git push -u origin main
```

## الخطوات الجاية (Phase 2+)
- نتائج البحث + تفاصيل الرحلة
- الحجز والدفع
- لوحة السائق ولوحة الإدارة
- المحفظة والشات والإشعارات
- كل الميزات اللي كانت في نسخة Flutter، هتتنقل تدريجيًا
