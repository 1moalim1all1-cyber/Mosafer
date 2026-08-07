import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

/**
 * لما بنرفع تحديث جديد للموقع، أسامي ملفات الكود بتتغيّر (Vite Code
 * Splitting). لو حد فاتح المتصفح من قبل التحديث ولسه الصفحة متفتحة،
 * محاولة تحميل صفحة جديدة (Lazy Load) هتفشل لأن اسم الملف القديم مبقاش
 * موجود (404). بدل ما نسيب المستخدم يشوف شاشة بيضا أو Error غريب،
 * بنعمل Refresh تلقائي مرة واحدة بس (عشان منلفش في حلقة لا نهائية).
 */
export class ChunkErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: unknown): State {
    const message = error instanceof Error ? error.message : String(error)
    const isChunkError =
      message.includes('Failed to fetch dynamically imported module') ||
      message.includes('error loading dynamically imported module') ||
      message.includes('Importing a module script failed')
    return { hasError: isChunkError }
  }

  componentDidCatch() {
    if (this.state.hasError) {
      const alreadyReloaded = sessionStorage.getItem('mosafer_chunk_reload')
      if (!alreadyReloaded) {
        sessionStorage.setItem('mosafer_chunk_reload', '1')
        window.location.reload()
      }
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-bg">
          <span className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      )
    }
    return this.props.children
  }
}
