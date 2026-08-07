/**
 * شاشة بداية التطبيق - أول حاجة يشوفها أي حد يفتح مسافر، بملء الشاشة
 * تمامًا. بتفضل ظاهرة لحد ما Firebase يتأكد هل المستخدم مسجّل دخول
 * ولا لأ (بتاخد جزء من الثانية عادةً)، وبعدين تتحول تلقائيًا للصفحة
 * الصح (تسجيل الدخول أو الرئيسية).
 */
export function SplashScreen() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-br from-primary to-secondary p-8">
      <img
        src="/Mosafer/logo.jpeg"
        alt="مسافر"
        className="max-h-full max-w-full rounded-3xl object-contain shadow-2xl"
      />
    </div>
  )
}
