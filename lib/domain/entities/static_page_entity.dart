import 'package:equatable/equatable.dart';

class StaticPageEntity extends Equatable {
  final String id;
  final String title;
  final String content;

  const StaticPageEntity({
    required this.id,
    required this.title,
    required this.content,
  });

  @override
  List<Object?> get props => [id, title, content];
}

class FaqItemEntity extends Equatable {
  final String question;
  final String answer;

  const FaqItemEntity({required this.question, required this.answer});

  @override
  List<Object?> get props => [question, answer];
}

/// محتوى افتراضي يظهر لو الأدمن لسه معدّلش الصفحة من لوحة الإدارة،
/// عشان التطبيق يفضل فيه محتوى حقيقي من أول تشغيل بدل صفحة فاضية.
class DefaultPagesContent {
  DefaultPagesContent._();

  static const Map<String, StaticPageEntity> pages = {
    'about': StaticPageEntity(
      id: 'about',
      title: 'من نحن',
      content:
          'مسافر منصة مصرية لمشاركة الرحلات بين المحافظات، بتربط السائقين '
          'اللي عندهم مقاعد فاضية بالركاب اللي بيدوروا على وسيلة سفر آمنة '
          'ومريحة وبسعر مناسب. هدفنا نقلل تكلفة السفر، نزود دخل السائقين، '
          'ونوفّر بديل موثوق للمواصلات بين المدن المصرية.',
    ),
    'contact': StaticPageEntity(
      id: 'contact',
      title: 'اتصل بنا',
      content:
          'لأي استفسار أو مشكلة، تواصل معانا عبر البريد الإلكتروني أو '
          'واتساب الموجودين في إعدادات التطبيق. فريق الدعم بيرد خلال 24 ساعة.',
    ),
    'terms': StaticPageEntity(
      id: 'terms',
      title: 'الشروط والأحكام',
      content:
          'باستخدامك تطبيق مسافر، إنت بتوافق على إن المنصة وسيط بين السائق '
          'والراكب مش شركة نقل، وإن كل رحلة بتتم على مسؤولية الطرفين. '
          'المنصة بتحتفظ بحقها في تعليق أي حساب يخالف قواعد الاستخدام أو '
          'يسيء لباقي المستخدمين. الأسعار بيحددها السائق، والمنصة بتاخد '
          'عمولة على كل رحلة مكتملة زي ما هو موضح في التطبيق.',
    ),
    'privacy': StaticPageEntity(
      id: 'privacy',
      title: 'سياسة الخصوصية',
      content:
          'بنحترم خصوصيتك. بياناتك الشخصية (الاسم، الهاتف، الموقع أثناء '
          'الرحلة) بتُستخدم بس لتشغيل الخدمة وتحسين تجربتك، ومش بتتباع '
          'لأي طرف تالت. مستندات اعتماد السائقين بتتشاف من فريق المراجعة '
          'بس. تقدر تطلب حذف بياناتك في أي وقت من خلال التواصل مع الدعم.',
    ),
  };

  static const List<FaqItemEntity> faqItems = [
    FaqItemEntity(
      question: 'إزاي أحجز رحلة؟',
      answer: 'دوّر على رحلتك من الصفحة الرئيسية، اختار عدد المقاعد، وادفع '
          'نقدي أو من المحفظة. حجزك هيبقى بانتظار موافقة السائق.',
    ),
    FaqItemEntity(
      question: 'إمتى أقدر أستخدم رصيد المحفظة؟',
      answer: 'بعد ما تودّع رصيد ويتم اعتماده من الإدارة، تقدر تستخدمه في '
          'دفع أي حجز مباشرة من غير ما تحتاج كاش.',
    ),
    FaqItemEntity(
      question: 'إيه هي رحلات "راجع فاضي"؟',
      answer: 'رحلات بسعر مخفض بيعملها سائق راجع من مشوار من غير ركاب، '
          'عشان يستغل مقاعده الفاضية ويقلل تكلفة رجوعه.',
    ),
    FaqItemEntity(
      question: 'إزاي أبقى سائق معتمد؟',
      answer: 'ارفع بطاقة الرقم القومي، رخصة القيادة، رخصة السيارة، صورة '
          'السيارة، وصورة تحقق شخصي. فريقنا بيراجعها خلال 24 ساعة عادةً.',
    ),
  ];
}
