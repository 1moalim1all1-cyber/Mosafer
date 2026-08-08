/**
 * شاشة بداية التطبيق - أول حاجة يشوفها أي حد يفتح مسافر، بملء الشاشة
 * تمامًا. بتفضل ظاهرة لحد ما Firebase يتأكد هل المستخدم مسجّل دخول
 * ولا لأ (بتاخد جزء من الثانية عادةً)، وبعدين تتحول تلقائيًا للصفحة
 * الصح (تسجيل الدخول أو الرئيسية).
 */
export function SplashScreen() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-tertiary">
      <img
        src={`${import.meta.env.BASE_URL}splash-web.jpeg`}
        alt="مسافر"
        className="h-full w-full object-cover"
      />
    </div>
  )
}
