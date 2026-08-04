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

export async function fetchStaticPage(pageId: string) {
  const snap = await getDoc(doc(db, 'pages', pageId))
  if (snap.exists()) {
    const data = snap.data()
    return { title: data.title ?? DEFAULT_PAGES[pageId]?.title, content: data.content ?? DEFAULT_PAGES[pageId]?.content }
  }
  return DEFAULT_PAGES[pageId] ?? { title: '', content: '' }
}
