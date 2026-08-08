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
      className="fixed bottom-20 left-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-md transition-transform hover:scale-105 active:scale-95"
    >
      <MessageCircle size={22} fill="white" strokeWidth={0} />
    </a>
  )
}
