import { useEffect, useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { fetchAppSettings } from '../lib/admin'

/**
 * زرار عائم ثابت في كل الصفحات - بيفتح واتساب مباشرة برسالة جاهزة.
 * الرقم بييجي من إعدادات الإدارة (appSettings/general -> whatsappNumber)،
 * يعني تقدر تغيّره في أي وقت من لوحة الإدارة من غير أي تعديل كود.
 */
export function WhatsAppButton() {
  const [whatsappNumber, setWhatsappNumber] = useState<string | null>(null)

  useEffect(() => {
    fetchAppSettings()
      .then((s) => setWhatsappNumber(s.whatsappNumber || null))
      .catch(() => setWhatsappNumber(null))
  }, [])

  if (!whatsappNumber) return null

  // تنظيف الرقم من أي مسافات أو رموز، والاحتفاظ بالأرقام بس
  const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '')
  const message = encodeURIComponent('محتاج أضيف رصيد لمحفظتي في تطبيق مسافر')
  const link = `https://wa.me/${cleanNumber}?text=${message}`

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="تواصل معنا على واتساب"
      className="fixed bottom-24 left-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-[#25D366]/40 transition-transform hover:scale-105 active:scale-95"
    >
      <MessageCircle size={26} fill="white" strokeWidth={0} />
    </a>
  )
}
