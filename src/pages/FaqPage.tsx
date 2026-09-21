import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { DEFAULT_FAQ_ITEMS, fetchFaqItems } from '../lib/pages'

export default function FaqPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [items, setItems] = useState<{ question: string; answer: string }[]>(DEFAULT_FAQ_ITEMS)
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  useEffect(() => {
    fetchFaqItems().then(setItems).catch(() => setItems(DEFAULT_FAQ_ITEMS))
  }, [])

  return (
    <div className="min-h-screen bg-bg">
      <header className="flex items-center gap-3 border-b border-border bg-card px-4 py-4">
        <button onClick={() => navigate(-1)} className="text-xl">
          ←
        </button>
        <h1 className="text-lg font-bold text-text-primary">{t('common.faqTitle')}</h1>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6">
        {items.map((item, index) => (
          <div key={index} className="mb-2 rounded-xl border border-border bg-card">
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="flex w-full items-center justify-between p-4 text-right font-semibold text-text-primary"
            >
              {item.question}
              <span>{openIndex === index ? '▲' : '▼'}</span>
            </button>
            {openIndex === index && <p className="border-t border-border p-4 text-text-secondary">{item.answer}</p>}
          </div>
        ))}
      </main>
    </div>
  )
}
