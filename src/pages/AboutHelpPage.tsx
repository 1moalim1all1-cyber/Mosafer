import { useNavigate } from 'react-router-dom'

const ITEMS = [
  { path: '/how-it-works', icon: '🧭', label: 'إزاي يشتغل مسافر' },
  { path: '/page/about', icon: '📖', label: 'من نحن' },
  { path: '/faq', icon: '❓', label: 'الأسئلة الشائعة' },
  { path: '/page/contact', icon: '✉️', label: 'اتصل بنا' },
  { path: '/page/terms', icon: '📜', label: 'الشروط والأحكام' },
  { path: '/page/privacy', icon: '🔒', label: 'سياسة الخصوصية' },
]

export default function AboutHelpPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-bg">
      <header className="flex items-center gap-3 border-b border-border bg-card px-4 py-4">
        <button onClick={() => navigate(-1)} className="text-xl">
          ←
        </button>
        <h1 className="text-lg font-bold text-text-primary">عن مسافر ومساعدة</h1>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6">
        {ITEMS.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className="mb-2 flex w-full items-center gap-3 rounded-xl border border-border bg-card p-4 text-right"
          >
            <span className="text-xl">{item.icon}</span>
            <span className="flex-1 font-semibold text-text-primary">{item.label}</span>
            <span className="text-text-secondary">‹</span>
          </button>
        ))}
      </main>
    </div>
  )
}
