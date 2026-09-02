'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, LoaderCircle, RefreshCw, ZoomIn, ZoomOut } from 'lucide-react'
import type {
  PDFDocumentLoadingTask,
  PDFDocumentProxy,
  OnProgressParameters,
  RenderTask,
} from 'pdfjs-dist'
import type { Locale } from '@/types'

type ViewerStatus = 'loading' | 'ready' | 'rendering' | 'error'

const MIN_ZOOM = 0.65
const MAX_ZOOM = 2.25
const ZOOM_STEP = 0.15

function getCopy(locale: Locale) {
  return locale === 'ky'
    ? {
        error: 'PDF файлын ачуу мүмкүн болгон жок.',
        loading: 'PDF жүктөлүп жатат…',
        next: 'Кийинки бет',
        of: '/',
        page: 'Бет',
        previous: 'Мурунку бет',
        retry: 'Кайра аракет кылуу',
        zoomIn: 'Чоңойтуу',
        zoomOut: 'Кичирейтүү',
      }
    : {
        error: 'Не удалось открыть PDF-файл.',
        loading: 'PDF загружается…',
        next: 'Следующая страница',
        of: 'из',
        page: 'Страница',
        previous: 'Предыдущая страница',
        retry: 'Повторить',
        zoomIn: 'Увеличить',
        zoomOut: 'Уменьшить',
      }
}

export function getSafePdfUrl(src: string) {
  const url = new URL(src, window.location.origin)

  if (url.origin !== window.location.origin || !url.pathname.toLowerCase().endsWith('.pdf')) {
    throw new Error('Only same-origin PDF files can be opened in the embedded viewer.')
  }

  url.searchParams.set('pdf-viewer', '1')

  return url.toString()
}

export default function PdfViewer({
  src,
  title,
  locale,
}: {
  src: string
  title: string
  locale: Locale
}) {
  const copy = getCopy(locale)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const renderTaskRef = useRef<RenderTask | null>(null)
  const [document, setDocument] = useState<PDFDocumentProxy | null>(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [pageCount, setPageCount] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [viewportWidth, setViewportWidth] = useState(900)
  const [status, setStatus] = useState<ViewerStatus>('loading')
  const [progress, setProgress] = useState(0)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [reloadVersion, setReloadVersion] = useState(0)

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    const updateWidth = () => setViewportWidth(Math.max(280, viewport.clientWidth - 32))
    updateWidth()

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', updateWidth)
      return () => window.removeEventListener('resize', updateWidth)
    }

    const observer = new ResizeObserver(updateWidth)
    observer.observe(viewport)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    let cancelled = false
    let loadingTask: PDFDocumentLoadingTask | null = null
    let loadedDocument: PDFDocumentProxy | null = null

    setDocument(null)
    setPageCount(0)
    setPageNumber(1)
    setZoom(1)
    setProgress(0)
    setErrorMessage(null)
    setStatus('loading')

    async function loadDocument() {
      try {
        const pdfjs = await import('pdfjs-dist')
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          'pdfjs-dist/build/pdf.worker.min.mjs',
          import.meta.url
        ).toString()

        loadingTask = pdfjs.getDocument({
          url: getSafePdfUrl(src),
          rangeChunkSize: 64 * 1024,
          withCredentials: false,
        })
        loadingTask.onProgress = ({ loaded, total }: OnProgressParameters) => {
          if (!cancelled && total > 0) {
            setProgress(Math.min(100, Math.round((loaded / total) * 100)))
          }
        }

        loadedDocument = await loadingTask.promise
        if (cancelled) {
          await loadedDocument.destroy()
          return
        }

        setDocument(loadedDocument)
        setPageCount(loadedDocument.numPages)
        setStatus('rendering')
      } catch (error) {
        if (cancelled) return

        setErrorMessage(error instanceof Error ? error.message : null)
        setStatus('error')
      }
    }

    void loadDocument()

    return () => {
      cancelled = true
      renderTaskRef.current?.cancel()
      void loadingTask?.destroy()
      if (loadedDocument) void loadedDocument.destroy()
    }
  }, [reloadVersion, src])

  useEffect(() => {
    if (!document) return

    let cancelled = false

    async function renderPage() {
      try {
        setStatus('rendering')
        const page = await document!.getPage(pageNumber)
        if (cancelled) return

        const baseViewport = page.getViewport({ scale: 1 })
        const fitScale = Math.min(1.6, viewportWidth / baseViewport.width)
        const viewport = page.getViewport({ scale: fitScale * zoom })
        const canvas = canvasRef.current
        if (!canvas) return

        const outputScale = Math.min(window.devicePixelRatio || 1, 2)
        canvas.width = Math.floor(viewport.width * outputScale)
        canvas.height = Math.floor(viewport.height * outputScale)
        canvas.style.width = `${Math.floor(viewport.width)}px`
        canvas.style.height = `${Math.floor(viewport.height)}px`

        renderTaskRef.current?.cancel()
        const renderTask = page.render({
          canvas,
          viewport,
          transform: outputScale === 1 ? undefined : [outputScale, 0, 0, outputScale, 0, 0],
        })
        renderTaskRef.current = renderTask
        await renderTask.promise

        if (!cancelled) {
          setErrorMessage(null)
          setStatus('ready')
        }
      } catch (error) {
        if (cancelled || (error instanceof Error && error.name === 'RenderingCancelledException')) return

        setErrorMessage(error instanceof Error ? error.message : null)
        setStatus('error')
      }
    }

    void renderPage()

    return () => {
      cancelled = true
      renderTaskRef.current?.cancel()
    }
  }, [document, pageNumber, viewportWidth, zoom])

  const loadingLabel = progress > 0 ? `${copy.loading} ${progress}%` : copy.loading

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 shadow-inner">
      <div className="flex min-h-12 flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white px-3 py-2 sm:px-4">
        <div className="flex items-center gap-1" aria-label={`${copy.page}: ${pageNumber} ${copy.of} ${pageCount || '—'}`}>
          <button
            type="button"
            onClick={() => setPageNumber((current) => Math.max(1, current - 1))}
            disabled={!document || pageNumber <= 1}
            aria-label={copy.previous}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-35"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="min-w-24 text-center text-xs font-semibold tabular-nums text-slate-700 sm:text-sm">
            {copy.page} {pageNumber} {copy.of} {pageCount || '—'}
          </span>
          <button
            type="button"
            onClick={() => setPageNumber((current) => Math.min(pageCount, current + 1))}
            disabled={!document || pageNumber >= pageCount}
            aria-label={copy.next}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-35"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setZoom((current) => Math.max(MIN_ZOOM, current - ZOOM_STEP))}
            disabled={!document || zoom <= MIN_ZOOM}
            aria-label={copy.zoomOut}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-35"
          >
            <ZoomOut size={17} />
          </button>
          <span className="min-w-12 text-center text-xs font-semibold tabular-nums text-slate-600">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoom((current) => Math.min(MAX_ZOOM, current + ZOOM_STEP))}
            disabled={!document || zoom >= MAX_ZOOM}
            aria-label={copy.zoomIn}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-35"
          >
            <ZoomIn size={17} />
          </button>
        </div>
      </div>

      <div
        ref={viewportRef}
        className="relative h-[min(64vh,720px)] min-h-[420px] overflow-auto bg-slate-300/70 p-4"
      >
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={`${title}: ${copy.page} ${pageNumber}`}
          className="mx-auto block bg-white shadow-xl"
        />

        {(status === 'loading' || status === 'rendering') && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-slate-100/90 text-sm font-semibold text-slate-700 backdrop-blur-sm"
            role="status"
            aria-live="polite"
          >
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <LoaderCircle size={19} className="animate-spin text-[#1647c5]" />
              {status === 'loading' ? loadingLabel : copy.loading}
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100 p-5 text-center">
            <div className="max-w-md rounded-2xl border border-red-200 bg-white p-5 shadow-sm">
              <p className="font-semibold text-red-900">{copy.error}</p>
              {errorMessage && <p className="mt-2 break-words text-xs leading-5 text-red-700">{errorMessage}</p>}
              <button
                type="button"
                onClick={() => setReloadVersion((current) => current + 1)}
                className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-xl bg-red-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700 focus-visible:ring-offset-2"
              >
                <RefreshCw size={15} />
                {copy.retry}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
