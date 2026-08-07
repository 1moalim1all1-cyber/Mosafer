import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { fetchStaticPage } from '../lib/pages'

export default function StaticPageView() {
  const { pageId } = useParams<{ pageId: string }>()
  const navigate = useNavigate()
  const [page, setPage] = useState<{ title: string; content: string } | null>(null)

  useEffect(() => {
    if (!pageId) return
    fetchStaticPage(pageId).then(setPage)
  }, [pageId])

  return (
    <div className="min-h-screen bg-bg">
      <header className="flex items-center gap-3 border-b border-border bg-card px-4 py-4">
        <button onClick={() => navigate(-1)} className="text-xl">
          ←
        </button>
        <h1 className="text-lg font-bold text-text-primary">{page?.title ?? ''}</h1>
      </header>
      <main className="mx-auto max-w-lg px-4 py-6 leading-8 text-text-primary">{page?.content}</main>
    </div>
  )
}
