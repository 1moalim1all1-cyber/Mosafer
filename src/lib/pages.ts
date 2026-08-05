import { doc, getDoc } from 'firebase/firestore'
import { db } from './firebase'

export const DEFAULT_PAGES: Record<string, { title: string; content: string }> = {
  about: {
    title: 'من نحن',
    content:
      'مسافر منصة مصرية لمشاركة الرحلات بين المحافظات، بتربط السائقين اللي عندهم مقاعد فاضية بالركاب اللي بيدوروا على وسيلة سفر آمنة ومريحة وبسعر مناسب.',
  },
  contact: {
    title: 'اتصل بنا',
    content: 'لأي استفسار أو مشكلة، تواصل معانا عبر البريد الإلكتروني أو واتساب الموجودين في إعدادات التطبيق.',
  },
  terms: {
    title: 'الشروط والأحكام',
    content:
      'باستخدامك تطبيق مسافر، إنت بتوافق على إن المنصة وسيط بين السائق والراكب مش شركة نقل، وإن كل رحلة بتتم على مسؤولية الطرفين.',
  },
  privacy: {
    title: 'سياسة الخصوصية',
    content: 'بنحترم خصوصيتك. بياناتك الشخصية بتُستخدم بس لتشغيل الخدمة وتحسين تجربتك، ومش بتتباع لأي طرف تالت.',
  },
}

export const DEFAULT_FAQ_ITEMS = [
  {
    question: 'إزاي أحجز رحلة؟',
    answer:
      'دوّر على رحلتك من الصفحة الرئيسية، اختار عدد المقاعد، وادفع نقدي أو من المحفظة. حجزك هيبقى بانتظار موافقة السائق.',
  },
  {
    question: 'إمتى أقدر أستخدم رصيد المحفظة؟',
    answer: 'بعد ما تودّع رصيد ويتم اعتماده من الإدارة، تقدر تستخدمه في دفع أي حجز مباشرة من غير ما تحتاج كاش.',
  },
  {
    question: 'إيه هي رحلات "راجع فاضي"؟',
    answer: 'رحلات بسعر مخفض بيعملها سائق راجع من مشوار من غير ركاب، عشان يستغل مقاعده الفاضية ويقلل تكلفة رجوعه.',
  },
  {
    question: 'إزاي أبقى سائق معتمد؟',
    answer: 'ارفع بطاقة الرقم القومي، رخصة القيادة، رخصة السيارة، صورة السيارة، وصورة تحقق شخصي. فريقنا بيراجعها خلال 24 ساعة عادةً.',
  },
]

export async function fetchStaticPage(pageId: string) {
  const snap = await getDoc(doc(db, 'pages', pageId))
  if (snap.exists()) {
    const data = snap.data()
    return { title: data.title ?? DEFAULT_PAGES[pageId]?.title, content: data.content ?? DEFAULT_PAGES[pageId]?.content }
  }
  return DEFAULT_PAGES[pageId] ?? { title: '', content: '' }
}

export async function fetchFaqItems() {
  const snap = await getDoc(doc(db, 'pages', 'faq'))
  if (snap.exists() && snap.data().items?.length > 0) {
    return snap.data().items as { question: string; answer: string }[]
  }
  return DEFAULT_FAQ_ITEMS
}
