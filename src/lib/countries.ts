export type CountryCode = 'egypt' | 'saudi'

export interface CountryInfo {
  code: CountryCode
  nameAr: string
  nameEn: string
  flag: string
  currencyAr: string
  currencyEn: string
  regions: string[]
}

export const COUNTRIES: Record<CountryCode, CountryInfo> = {
  egypt: {
    code: 'egypt',
    nameAr: 'مصر',
    nameEn: 'Egypt',
    flag: '🇪🇬',
    currencyAr: 'ج.م',
    currencyEn: 'EGP',
    regions: [
      'القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'البحر الأحمر', 'البحيرة',
      'الفيوم', 'الغربية', 'الإسماعيلية', 'المنوفية', 'المنيا', 'القليوبية',
      'الوادي الجديد', 'السويس', 'أسوان', 'أسيوط', 'بني سويف', 'بورسعيد',
      'دمياط', 'الشرقية', 'جنوب سيناء', 'كفر الشيخ', 'مطروح', 'الأقصر',
      'قنا', 'شمال سيناء', 'سوهاج',
    ],
  },
  saudi: {
    code: 'saudi',
    nameAr: 'السعودية',
    nameEn: 'Saudi Arabia',
    flag: '🇸🇦',
    currencyAr: 'ر.س',
    currencyEn: 'SAR',
    regions: [
      'الرياض', 'مكة المكرمة', 'المدينة المنورة', 'المنطقة الشرقية', 'عسير',
      'تبوك', 'حائل', 'الحدود الشمالية', 'جازان', 'نجران', 'الباحة',
      'الجوف', 'القصيم',
    ],
  },
}

export const DEFAULT_COUNTRY: CountryCode = 'egypt'

export function getCountryInfo(code: string): CountryInfo {
  return COUNTRIES[code as CountryCode] ?? COUNTRIES[DEFAULT_COUNTRY]
}

/** رمز العملة المناسب لرحلة معيّنة حسب دولتها ولغة الواجهة الحالية */
export function formatCurrency(amount: number, country: string, lang: 'ar' | 'en' = 'ar'): string {
  const info = getCountryInfo(country)
  const symbol = lang === 'ar' ? info.currencyAr : info.currencyEn
  return `${amount.toFixed(0)} ${symbol}`
}
