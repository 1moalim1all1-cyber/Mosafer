import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import ar from '../locales/ar.json'
import en from '../locales/en.json'

const savedLang = localStorage.getItem('mosafer_lang') === 'en' ? 'en' : 'ar'

i18n.use(initReactI18next).init({
  resources: {
    ar: { translation: ar },
    en: { translation: en },
  },
  lng: savedLang,
  fallbackLng: 'ar',
  interpolation: { escapeValue: false },
})

/** بتغيّر اللغة وتحدّث اتجاه الصفحة (RTL/LTR) والخط تلقائيًا مع بعض */
export function changeLanguage(lang: 'ar' | 'en') {
  i18n.changeLanguage(lang)
  localStorage.setItem('mosafer_lang', lang)
  document.documentElement.lang = lang
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
}

// تطبيق الاتجاه الصحيح فور تحميل الصفحة أول مرة
document.documentElement.lang = savedLang
document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr'

export default i18n
