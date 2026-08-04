/**
 * نفس الحل اللي استخدمناه في نسخة Flutter: بما إن Firebase Auth بيتطلب
 * بريد إلكتروني، بنحوّل رقم الهاتف لمعرّف داخلي ثابت بصيغة إيميل، عشان
 * المستخدم يتعامل برقم موبايله بس من غير أي بنية تحتية لإرسال SMS حقيقي.
 */
export function syntheticEmailFromPhone(phone: string): string {
  const digitsOnly = phone.replace(/[^0-9]/g, '')
  return `${digitsOnly}@mosafer.app`
}
