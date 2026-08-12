'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import {
  ChevronDown,
  ChevronUp,
  Download,
  ExternalLink,
  Eye,
  FileText,
  Layers3,
  LoaderCircle,
  MonitorPlay,
  Play,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  X,
} from 'lucide-react'
import ResponsiveImage from '@/components/ResponsiveImage'
import PdfViewer from '@/components/PdfViewer'
import {
  getEmbeddableVideoUrl,
  isDirectVideoUrl,
  isImageUrl,
  isPdfUrl,
  isSafeResourceUrl,
  isSparkLabUrl,
} from '@/lib/media'
import { formatFileSize } from '@/lib/utils'
import type { Locale, Resource } from '@/types'

type PreviewKind = 'pdf' | 'video' | 'embedded-video' | 'sparkvue'
type ViewerPane = 'material' | 'sparkvue'
type SparkViewerStatus =
  | 'idle'
  | 'booting'
  | 'downloading'
  | 'loading'
  | 'opened'
  | 'retrying'
  | 'error'

const SPARK_OPEN_MESSAGE = 'pasco-lab:sparkvue-open'
const SPARK_STATUS_MESSAGE = 'pasco-lab:sparkvue-status'
const SPARK_BOOT_TIMEOUT_MS = 180000
const SPARK_MAX_AUTO_RETRIES = 2

interface ResourcePreview {
  kind: PreviewKind
  src: string
}

function getCopy(locale: Locale) {
  return locale === 'ky'
      ? {
        closeMaterialPreview: 'Материалды көрүүнү жабуу',
        closeSparkVue: 'SPARKvue терезесин жабуу',
        downloadSparkLab: 'SPARKlab жүктөп алуу',
        emptyResources: 'Материалдар азырынча кошула элек.',
        hideResourceList: 'Тизмени жашыруу',
        materialViewerDescription: 'PDF жана видео материалдар ушул терезеде көрсөтүлөт.',
        openHere: 'Бул жерде ачуу',
        openRequiresHttps: 'HTTPS керек',
        openSparkVue: 'SPARKvue ичинде ачуу',
        openViaHttps: 'HTTPS аркылуу ачуу',
        openSeparate: 'Өзүнчө ачуу',
        previewLabel: 'Материалды көрүү терезеси',
        safeViewer: 'Коопсуз көрүү режими',
        showResourceList: 'Тизмени көрсөтүү',
        secureContextDescription:
          'SPARKlab файлы HTTP/IP дареги аркылуу туруктуу ачылбайт, анткени браузер SPARKvue үчүн SharedArrayBuffer функциясын бөгөттөйт. Ушул компьютерде localhost же 127.0.0.1 аркылуу ачыңыз, ал эми башка түзмөктөр үчүн HTTPS домен же ишенимдүү сертификат керек.',
        secureContextChecklist: [
          'Компьютерде http://localhost:3000 же http://127.0.0.1:3000 колдонуңуз.',
          'Планшеттен же башка түзмөктөн ачуу үчүн https://192.168...:3443 колдонуңуз.',
          'VPS же мектеп серверинде HTTPS жана ишенимдүү сертификат керек.',
        ],
        secureContextTitle: 'SPARKvue коопсуз туташууну талап кылат',
        showMaterial: 'Материалдын терезесин көрсөтүү',
        showSparkVue: 'SPARKvue терезесин көрсөтүү',
        sparkBooting: 'SPARKvue иштетилип жатат...',
        sparkDownloading: 'SPARKlab файлы жүктөлүп жатат...',
        sparkLoadError: 'SPARKlab файлын ачуу мүмкүн болгон жок.',
        sparkLoading: 'Лаборатория ачылып жатат...',
        sparkRetrying: 'Туташуу калыбына келтирилип, кайра аракет жасалууда...',
        retrySpark: 'Кайра аракет кылуу',
        sparkViewerDescription: 'Интерактивдүү SPARKlab файлы өзүнчө SPARKvue терезесинде иштейт.',
        sparkViewerLabel: 'Интерактивдүү SPARKvue лабораториясы',
        tabletHttpsBadge: 'Планшет үчүн HTTPS',
        unsafeResource: 'Коопсуз эмес шилтеме бөгөттөлдү.',
        unsupportedVideo: 'Браузер бул видеону көрсөтө албайт.',
        workspaceDescription: 'Бир убакта бир файл ачылат. Жаңы файлды ачканда мурунку терезе автоматтык жабылат.',
        workspaceEmptyDescription: 'PDF, видео же SPARKlab файлын сол жактагы тизмеден ачыңыз.',
        workspaceEmptyTitle: 'Көрүү үчүн материалды тандаңыз',
        workspaceLabel: 'Материалдар аймагы',
        resourceListLabel: 'Материалдардын тизмеси',
      }
    : {
        closeMaterialPreview: 'Закрыть просмотр материала',
        closeSparkVue: 'Закрыть окно SPARKvue',
        downloadSparkLab: 'Скачать SPARKlab',
        emptyResources: 'Материалы пока не добавлены.',
        hideResourceList: 'Скрыть список',
        materialViewerDescription: 'PDF- и видеоматериалы отображаются в этом отдельном окне.',
        openHere: 'Открыть здесь',
        openRequiresHttps: 'Нужен HTTPS',
        openSparkVue: 'Открыть в SPARKvue',
        openViaHttps: 'Открыть через HTTPS',
        openSeparate: 'Открыть отдельно',
        previewLabel: 'Окно просмотра материала',
        safeViewer: 'Безопасный режим просмотра',
        showResourceList: 'Показать список',
        secureContextDescription:
          'SPARKlab нестабильно открывается через HTTP/IP-адрес, потому что браузер блокирует SharedArrayBuffer для SPARKvue. На этом компьютере открывайте через localhost или 127.0.0.1, а для других устройств нужен HTTPS-домен или доверенный сертификат.',
        secureContextChecklist: [
          'На компьютере используйте http://localhost:3000 или http://127.0.0.1:3000.',
          'С планшета или другого устройства открывайте через https://192.168...:3443.',
          'На VPS или школьном сервере нужен HTTPS и доверенный сертификат.',
        ],
        secureContextTitle: 'SPARKvue требует безопасное соединение',
        showMaterial: 'Показать окно материала',
        showSparkVue: 'Показать окно SPARKvue',
        sparkBooting: 'Запускается SPARKvue...',
        sparkDownloading: 'Загружается файл SPARKlab...',
        sparkLoadError: 'Не удалось открыть файл SPARKlab.',
        sparkLoading: 'Открывается лаборатория...',
        sparkRetrying: 'Восстанавливаем соединение и повторяем попытку...',
        retrySpark: 'Повторить',
        sparkViewerDescription: 'Интерактивный файл SPARKlab работает в отдельном окне SPARKvue.',
        sparkViewerLabel: 'Интерактивная лаборатория SPARKvue',
        tabletHttpsBadge: 'Для планшета HTTPS',
        unsafeResource: 'Небезопасная ссылка заблокирована.',
        unsupportedVideo: 'Браузер не поддерживает воспроизведение этого видео.',
        workspaceDescription: 'Одновременно открывается один файл. При выборе нового предыдущий просмотрщик закрывается автоматически.',
        workspaceEmptyDescription: 'Откройте PDF, видео или SPARKlab из списка слева.',
        workspaceEmptyTitle: 'Выберите материал для просмотра',
        workspaceLabel: 'Рабочая область материалов',
        resourceListLabel: 'Список материалов',
      }
}

function getHttpsUpgradeUrl() {
  if (typeof window === 'undefined' || window.location.protocol !== 'http:') return '#'

  const url = new URL(window.location.href)
  url.protocol = 'https:'
  if (url.port === '3000') {
    url.port = process.env.NEXT_PUBLIC_PASCO_HTTPS_PORT || '3443'
  }
  return url.toString()
}

function getSparkVueLaunchUrl(fileUrl: string) {
  return `/sparkvue/index.html?file=${encodeURIComponent(fileUrl)}`
}

function getSparkRuntimeSupport() {
  if (typeof window === 'undefined') return true

  // SPARKvue opens in a fresh top-level page with its own COOP/COEP headers.
  // The lab page can be non-isolated after client-side navigation, so do not
  // gate the launch button on this document's crossOriginIsolated state.
  return (
    window.isSecureContext !== false &&
    typeof WebAssembly !== 'undefined' &&
    typeof Worker !== 'undefined' &&
    typeof fetch === 'function'
  )
}

function subscribeToSecureContext(onStoreChange: () => void) {
  window.addEventListener('focus', onStoreChange)
  window.addEventListener('pageshow', onStoreChange)

  return () => {
    window.removeEventListener('focus', onStoreChange)
    window.removeEventListener('pageshow', onStoreChange)
  }
}

function getSecureContextSnapshot() {
  return getSparkRuntimeSupport()
}

function getServerSecureContextSnapshot() {
  return true
}

function getPreview(resource: Resource): ResourcePreview | null {
  if (!isSafeResourceUrl(resource.url)) return null

  if (isSparkLabUrl(resource.url)) {
    return { kind: 'sparkvue', src: resource.url }
  }

  if (resource.resource_type === 'pdf' || isPdfUrl(resource.url)) {
    return { kind: 'pdf', src: resource.url }
  }

  const videoResource = resource.resource_type === 'video' || isDirectVideoUrl(resource.url)
  if (!videoResource) return null

  if (isDirectVideoUrl(resource.url)) {
    return { kind: 'video', src: resource.url }
  }

  const embeddedVideoUrl = getEmbeddableVideoUrl(resource.url)
  return embeddedVideoUrl ? { kind: 'embedded-video', src: embeddedVideoUrl } : null
}

function getResourceTypeLabel(resourceType: Resource['resource_type'], locale: Locale) {
  const labels: Record<Resource['resource_type'], string> =
    locale === 'ky'
      ? { pdf: 'PDF', image: 'Сүрөт', video: 'Видео', worksheet: 'Иш барагы', link: 'Шилтеме' }
      : { pdf: 'PDF', image: 'Изображение', video: 'Видео', worksheet: 'Рабочий лист', link: 'Ссылка' }
  return labels[resourceType]
}

function getSparkStatusText(status: SparkViewerStatus, copy: ReturnType<typeof getCopy>) {
  if (status === 'downloading') return copy.sparkDownloading
  if (status === 'loading') return copy.sparkLoading
  if (status === 'retrying') return copy.sparkRetrying
  if (status === 'error') return copy.sparkLoadError
  return copy.sparkBooting
}

export default function LabResources({ resources, locale }: { resources: Resource[]; locale: Locale }) {
  const copy = getCopy(locale)
  const [activeMaterialResourceId, setActiveMaterialResourceId] = useState<string | null>(null)
  const [activeSparkResourceId, setActiveSparkResourceId] = useState<string | null>(null)
  const [activePane, setActivePane] = useState<ViewerPane | null>(null)
  const [resourceListVisible, setResourceListVisible] = useState(true)
  const [sparkFrameVersion, setSparkFrameVersion] = useState(0)
  const [sparkViewerStatus, setSparkViewerStatus] = useState<SparkViewerStatus>('idle')
  const [sparkViewerError, setSparkViewerError] = useState<string | null>(null)
  const sparkVueSecureContext = useSyncExternalStore(
    subscribeToSecureContext,
    getSecureContextSnapshot,
    getServerSecureContextSnapshot
  )
  const workspaceRef = useRef<HTMLElement>(null)
  const sparkFrameRef = useRef<HTMLIFrameElement>(null)
  const sparkRetryCountRef = useRef(0)
  const activeMaterialResource =
    resources.find((resource) => resource.id === activeMaterialResourceId) ?? null
  const activeSparkResource = resources.find((resource) => resource.id === activeSparkResourceId) ?? null
  const materialPreviewCandidate = activeMaterialResource ? getPreview(activeMaterialResource) : null
  const activeMaterialPreview =
    materialPreviewCandidate?.kind === 'sparkvue' ? null : materialPreviewCandidate
  const sparkPreviewCandidate = activeSparkResource ? getPreview(activeSparkResource) : null
  const activeSparkPreview = sparkPreviewCandidate?.kind === 'sparkvue' ? sparkPreviewCandidate : null
  const activeSparkFileUrl = activeSparkPreview?.src ?? null
  const activeSparkResourceKey = activeSparkResource?.id ?? null
  const httpsUpgradeUrl = getHttpsUpgradeUrl()
  const selectedPane: ViewerPane | null =
    activePane === 'material' && activeMaterialPreview
      ? 'material'
      : activePane === 'sparkvue' && activeSparkPreview
        ? 'sparkvue'
        : activeMaterialPreview
          ? 'material'
          : activeSparkPreview
            ? 'sparkvue'
            : null

  useEffect(() => {
    if (!selectedPane) return

    const animationFrame = window.requestAnimationFrame(() => {
      const compactLayout =
        typeof window.matchMedia !== 'function' || window.matchMedia('(max-width: 1023px)').matches

      if (compactLayout) {
        workspaceRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' })
      }
    })

    return () => window.cancelAnimationFrame(animationFrame)
  }, [activeMaterialResourceId, activeSparkResourceId, selectedPane])

  useEffect(() => {
    if (!activeSparkResourceKey || !activeSparkFileUrl || !sparkVueSecureContext) return

    let retryTimer: number | null = null
    let watchdogTimer: number | null = null
    let opened = false
    const expectedFilePath = new URL(activeSparkFileUrl, window.location.origin).pathname

    function postOpenMessage(force = false) {
      sparkFrameRef.current?.contentWindow?.postMessage(
        {
          type: SPARK_OPEN_MESSAGE,
          fileUrl: activeSparkFileUrl,
          force,
        },
        window.location.origin
      )
    }

    function setProgressStatus(status: SparkViewerStatus) {
      setSparkViewerStatus((currentStatus) =>
        currentStatus === 'opened' ? currentStatus : status
      )
    }

    function scheduleRetry(message: string | null) {
      if (opened || retryTimer !== null) return

      if (sparkRetryCountRef.current >= SPARK_MAX_AUTO_RETRIES) {
        setSparkViewerError(message)
        setSparkViewerStatus('error')
        return
      }

      sparkRetryCountRef.current += 1
      setSparkViewerError(null)
      setSparkViewerStatus('retrying')
      retryTimer = window.setTimeout(() => {
        retryTimer = null
        setSparkFrameVersion((version) => version + 1)
      }, sparkRetryCountRef.current * 1000)
    }

    function handleSparkStatus(event: MessageEvent) {
      if (
        event.origin !== window.location.origin ||
        event.source !== sparkFrameRef.current?.contentWindow ||
        !event.data ||
        event.data.type !== SPARK_STATUS_MESSAGE
      ) {
        return
      }

      const status = String(event.data.status || '')
      const fileUrl = event.data.fileUrl ? String(event.data.fileUrl) : null

      // Dev/test hook: expose the latest bridge status so Playwright (and
      // a developer with the console open) can wait for "opened" without
      // polling UI state.  No-op in production builds.
      if (process.env.NODE_ENV !== 'production') {
        ;(window as unknown as { __lastSparkStatus?: string }).__lastSparkStatus = status
      }

      if (fileUrl && fileUrl !== expectedFilePath) return

      if (status === 'ready') {
        setProgressStatus('loading')
        postOpenMessage()
        return
      }

      if (status === 'booting') {
        setProgressStatus('booting')
        return
      }

      if (status === 'downloading') {
        setProgressStatus('downloading')
        return
      }

      if (status === 'retrying-download') {
        setProgressStatus('retrying')
        return
      }

      if (status === 'loading') {
        setProgressStatus('loading')
        return
      }

      if (status === 'opened') {
        opened = true
        if (watchdogTimer !== null) window.clearTimeout(watchdogTimer)
        setSparkViewerError(null)
        setSparkViewerStatus('opened')
        return
      }

      if (status === 'error') {
        scheduleRetry(event.data.message ? String(event.data.message) : null)
      }
    }

    window.addEventListener('message', handleSparkStatus)
    watchdogTimer = window.setTimeout(() => {
      scheduleRetry('SPARKvue did not confirm that the workbook opened.')
    }, SPARK_BOOT_TIMEOUT_MS)

    return () => {
      window.removeEventListener('message', handleSparkStatus)
      if (retryTimer !== null) window.clearTimeout(retryTimer)
      if (watchdogTimer !== null) window.clearTimeout(watchdogTimer)
    }
  }, [activeSparkFileUrl, activeSparkResourceKey, sparkFrameVersion, sparkVueSecureContext])

  function openMaterialViewer(resourceId: string) {
    setActiveSparkResourceId(null)
    setSparkViewerStatus('idle')
    setSparkViewerError(null)
    setActiveMaterialResourceId(resourceId)
    setActivePane('material')
  }

  function openSparkViewer(resourceId: string) {
    setActiveMaterialResourceId(null)
    sparkRetryCountRef.current = 0
    setSparkFrameVersion(0)
    setSparkViewerStatus('booting')
    setSparkViewerError(null)
    setActiveSparkResourceId(resourceId)
    setActivePane('sparkvue')
  }

  function closeMaterialViewer() {
    setActiveMaterialResourceId(null)
    setActivePane(null)
  }

  function closeSparkViewer() {
    setActiveSparkResourceId(null)
    setSparkViewerStatus('idle')
    setSparkViewerError(null)
    setActivePane(null)
  }

  function retrySparkViewer() {
    sparkRetryCountRef.current = 0
    setSparkViewerError(null)
    setSparkViewerStatus('booting')
    setSparkFrameVersion((version) => version + 1)
  }

  if (resources.length === 0) {
    return (
      <div className="rounded-[22px] border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center">
        <p className="text-sm leading-7 text-slate-600">{copy.emptyResources}</p>
      </div>
    )
  }

  return (
    <div
      className={`grid items-start gap-4 lg:gap-6 ${
        resourceListVisible
          ? 'xl:grid-cols-[minmax(320px,0.52fr)_minmax(0,1.48fr)]'
          : 'xl:grid-cols-[minmax(180px,auto)_minmax(0,1fr)]'
      }`}
    >
      <div className="order-1 min-w-0">
        <div className="mb-2 flex min-h-11 items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
          <span className="truncate text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">
            {copy.resourceListLabel}
          </span>
          <button
            type="button"
            onClick={() => setResourceListVisible((visible) => !visible)}
            aria-expanded={resourceListVisible}
            aria-controls="lab-resource-list"
            className="inline-flex min-h-8 shrink-0 items-center gap-1.5 rounded-xl px-2.5 text-xs font-semibold text-[#1647c5] transition hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1647c5]"
          >
            {resourceListVisible ? copy.hideResourceList : copy.showResourceList}
            {resourceListVisible ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        </div>

        {resourceListVisible && (
          <div id="lab-resource-list" className="space-y-2">
            {resources.map((resource) => {
          const safeResource = isSafeResourceUrl(resource.url)
          const preview = getPreview(resource)
          const sparkLab = isSparkLabUrl(resource.url)
          const pane: ViewerPane = sparkLab ? 'sparkvue' : 'material'
          const typeLabel = sparkLab ? 'SPARKlab' : getResourceTypeLabel(resource.resource_type, locale)
          const active = sparkLab
            ? resource.id === activeSparkResourceId
            : resource.id === activeMaterialResourceId
          const selected = active && selectedPane === pane
          const viewerId = sparkLab ? 'sparkvue-resource-viewer' : 'material-resource-viewer'

          return (
            <article
              key={resource.id}
              className={`overflow-hidden rounded-2xl border bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition ${
                selected
                  ? sparkLab
                    ? 'border-indigo-400 ring-2 ring-indigo-100'
                    : 'border-blue-300 ring-2 ring-blue-100'
                  : active
                    ? 'border-slate-300 bg-slate-50/70'
                    : 'border-slate-200 hover:border-slate-300 hover:shadow-[0_16px_38px_rgba(15,23,42,0.07)]'
              }`}
            >
              <div className="grid grid-cols-[64px_minmax(0,1fr)] gap-0">
                <div className={`min-h-[88px] ${sparkLab ? 'bg-slate-950' : 'bg-slate-100'}`}>
                  {safeResource && isImageUrl(resource.url) ? (
                    <div className="relative h-full min-h-[88px]">
                      <ResponsiveImage
                        src={resource.url}
                        alt={resource.title}
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                  ) : (
                    <div className="flex h-full min-h-[88px] flex-col items-center justify-center gap-1.5 p-2 text-center">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl shadow-sm ${
                          sparkLab
                            ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white ring-1 ring-white/15'
                            : 'bg-white text-slate-500'
                        }`}
                      >
                        {resource.resource_type === 'video' ? (
                          <Play size={19} />
                        ) : resource.resource_type === 'link' ? (
                          <ExternalLink size={19} />
                        ) : sparkLab ? (
                          <MonitorPlay size={19} />
                        ) : (
                          <FileText size={19} />
                        )}
                      </div>
                      <div
                        className={`max-w-full truncate text-[9px] font-semibold uppercase tracking-[0.08em] ${
                          sparkLab ? 'text-blue-200' : 'text-slate-500'
                        }`}
                      >
                        {typeLabel}
                      </div>
                    </div>
                  )}
                </div>

                <div className="min-w-0 p-3 sm:p-3.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] ${
                        sparkLab ? 'bg-indigo-50 text-indigo-700' : 'bg-blue-50 text-[#1647c5]'
                      }`}
                    >
                      {typeLabel}
                    </span>
                    {sparkLab && !sparkVueSecureContext && (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-amber-700">
                        {copy.tabletHttpsBadge}
                      </span>
                    )}
                    {resource.file_size != null && (
                      <span className="text-xs text-slate-500">{formatFileSize(resource.file_size)}</span>
                    )}
                  </div>

                  <h3 className="mt-1.5 line-clamp-2 break-words text-sm font-semibold leading-5 tracking-[-0.02em] text-slate-950">
                    {resource.title}
                  </h3>

                  {resource.description && (
                    <p className="mt-1 line-clamp-1 text-xs leading-5 text-slate-600">
                      {resource.description}
                    </p>
                  )}

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {preview && sparkLab && sparkVueSecureContext && (
                      <a
                        href={getSparkVueLaunchUrl(preview.src)}
                        target="_blank"
                        rel="noopener noreferrer"
                        referrerPolicy="same-origin"
                        className="inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-[#1647c5] px-3.5 py-2 text-xs font-semibold text-white transition hover:from-indigo-700 hover:to-[#123ba5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 sm:min-h-10"
                      >
                        {copy.openSparkVue}
                        <MonitorPlay size={14} />
                      </a>
                    )}

                    {preview && (!sparkLab || !sparkVueSecureContext) && (
                      <button
                        type="button"
                        onClick={() =>
                          sparkLab
                            ? openSparkViewer(resource.id)
                            : openMaterialViewer(resource.id)
                        }
                        aria-expanded={selected}
                        aria-controls={viewerId}
                        className={`inline-flex min-h-11 items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 sm:min-h-10 ${
                          sparkLab
                            ? sparkVueSecureContext
                              ? 'bg-gradient-to-r from-indigo-600 to-[#1647c5] hover:from-indigo-700 hover:to-[#123ba5] focus-visible:ring-indigo-600'
                              : 'bg-amber-600 hover:bg-amber-700 focus-visible:ring-amber-600'
                            : 'bg-[#1647c5] hover:bg-[#123ba5] focus-visible:ring-[#1647c5]'
                        }`}
                      >
                        {sparkLab && !sparkVueSecureContext
                          ? copy.openRequiresHttps
                          : active
                          ? sparkLab
                            ? copy.showSparkVue
                            : copy.showMaterial
                          : sparkLab
                            ? copy.openSparkVue
                            : copy.openHere}
                        {sparkLab ? <MonitorPlay size={14} /> : <Eye size={14} />}
                      </button>
                    )}

                    {safeResource ? (
                      <a
                        href={resource.url}
                        target={sparkLab ? undefined : '_blank'}
                        rel={sparkLab ? undefined : 'noopener noreferrer'}
                        download={sparkLab || undefined}
                        referrerPolicy="no-referrer"
                        aria-label={sparkLab ? copy.downloadSparkLab : copy.openSeparate}
                        title={sparkLab ? copy.downloadSparkLab : copy.openSeparate}
                        className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xs font-semibold transition sm:h-10 sm:w-10 ${
                          preview
                            ? 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:text-slate-950'
                            : 'bg-[#1647c5] text-white hover:bg-[#123ba5]'
                        }`}
                      >
                        {sparkLab ? <Download size={15} /> : <ExternalLink size={15} />}
                      </a>
                    ) : (
                      <span className="inline-flex min-h-9 items-center gap-2 rounded-xl bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700">
                        <ShieldAlert size={14} />
                        {copy.unsafeResource}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </article>
          )
            })}
          </div>
        )}
      </div>

      <aside
        ref={workspaceRef}
        id="resource-workspace"
        aria-label={copy.workspaceLabel}
        className="order-2 min-w-0 scroll-mt-24 xl:sticky xl:top-[112px]"
      >
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_22px_60px_rgba(15,23,42,0.10)]">
          <div className="border-b border-slate-200 bg-slate-950 px-4 py-4 text-white sm:px-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-blue-200 ring-1 ring-white/10">
                  <Layers3 size={21} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold sm:text-base">{copy.workspaceLabel}</h3>
                  <p className="mt-1 max-w-xl text-xs leading-5 text-slate-300">
                    {copy.workspaceDescription}
                  </p>
                </div>
              </div>
              <span className="hidden shrink-0 items-center gap-1.5 rounded-full bg-emerald-400/10 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-300 ring-1 ring-emerald-300/20 sm:inline-flex">
                <ShieldCheck size={13} />
                {copy.safeViewer}
              </span>
            </div>
          </div>

          {!selectedPane && (
            <div className="flex min-h-[300px] flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-white px-6 py-10 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-blue-50 text-[#1647c5] ring-1 ring-blue-100">
                <Layers3 size={28} />
              </div>
              <h4 className="mt-5 text-base font-semibold text-slate-950">
                {copy.workspaceEmptyTitle}
              </h4>
              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                {copy.workspaceEmptyDescription}
              </p>
            </div>
          )}

          {activeMaterialResource && activeMaterialPreview && (
            <section
              id="material-resource-viewer"
              role="region"
              aria-labelledby="material-resource-viewer-title"
              aria-describedby="material-resource-viewer-description"
            >
              <div className="flex items-start justify-between gap-4 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-white px-4 py-4 sm:px-5">
                <div className="min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#1647c5]">
                    {copy.previewLabel}
                  </div>
                  <h3
                    id="material-resource-viewer-title"
                    className="mt-1 truncate text-sm font-semibold text-slate-950 sm:text-base"
                  >
                    {activeMaterialResource.title}
                  </h3>
                  <p
                    id="material-resource-viewer-description"
                    className="mt-1 text-xs leading-5 text-slate-500"
                  >
                    {copy.materialViewerDescription}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeMaterialViewer}
                  aria-label={copy.closeMaterialPreview}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-blue-200 bg-white text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1647c5] focus-visible:ring-offset-2"
                >
                  <X size={17} />
                </button>
              </div>

              {activeMaterialPreview.kind === 'pdf' && (
                <div className="bg-slate-100 p-2 sm:p-3">
                  <PdfViewer
                    key={activeMaterialResource.id}
                    src={activeMaterialPreview.src}
                    title={activeMaterialResource.title}
                    locale={locale}
                  />
                </div>
              )}

              {activeMaterialPreview.kind === 'video' && (
                <div className="bg-slate-950 p-2 sm:p-3">
                  <video
                    key={activeMaterialResource.id}
                    src={activeMaterialPreview.src}
                    title={activeMaterialResource.title}
                    controls
                    controlsList="nodownload"
                    playsInline
                    preload="metadata"
                    className="mx-auto max-h-[70vh] w-full rounded-2xl bg-black"
                  >
                    {copy.unsupportedVideo}
                  </video>
                </div>
              )}

              {activeMaterialPreview.kind === 'embedded-video' && (
                <div className="bg-slate-950 p-2 sm:p-3">
                  <iframe
                    key={activeMaterialResource.id}
                    src={activeMaterialPreview.src}
                    title={activeMaterialResource.title}
                    sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
                    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                    className="aspect-video w-full rounded-2xl border-0 bg-black"
                  />
                </div>
              )}
            </section>
          )}

          {activeSparkResource && activeSparkPreview && (
            <section
              id="sparkvue-resource-viewer"
              role="region"
              aria-labelledby="sparkvue-resource-viewer-title"
              aria-describedby="sparkvue-resource-viewer-description"
            >
              <div className="flex items-start justify-between gap-4 border-b border-white/10 bg-gradient-to-r from-slate-950 via-[#10235f] to-[#1647c5] px-4 py-4 text-white sm:px-5">
                <div className="min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-200">
                    {copy.sparkViewerLabel}
                  </div>
                  <h3
                    id="sparkvue-resource-viewer-title"
                    className="mt-1 truncate text-sm font-semibold text-white sm:text-base"
                  >
                    {activeSparkResource.title}
                  </h3>
                  <p
                    id="sparkvue-resource-viewer-description"
                    className="mt-1 max-w-2xl text-xs leading-5 text-blue-100/80"
                  >
                    {copy.sparkViewerDescription}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeSparkViewer}
                  aria-label={copy.closeSparkVue}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:border-white/35 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#10235f]"
                >
                  <X size={17} />
                </button>
              </div>

              {sparkVueSecureContext ? (
                <div className="bg-slate-950 p-2 sm:p-3">
                  {sparkViewerStatus !== 'opened' && (
                    <div
                      role={sparkViewerStatus === 'error' ? 'alert' : 'status'}
                      aria-live="polite"
                      className={`mb-2 flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${
                        sparkViewerStatus === 'error'
                          ? 'border-red-400/30 bg-red-950/70 text-red-50'
                          : 'border-blue-300/20 bg-blue-950/70 text-blue-50'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {sparkViewerStatus === 'error' ? (
                          <ShieldAlert size={18} />
                        ) : (
                          <LoaderCircle size={18} className="animate-spin" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">
                          {getSparkStatusText(sparkViewerStatus, copy)}
                        </p>
                        {sparkViewerStatus === 'error' && sparkViewerError && (
                          <p className="mt-1 break-words text-xs leading-5 text-red-100/80">
                            {sparkViewerError}
                          </p>
                        )}
                      </div>
                      {sparkViewerStatus === 'error' && (
                        <button
                          type="button"
                          onClick={retrySparkViewer}
                          className="inline-flex min-h-9 shrink-0 items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-red-800 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                        >
                          <RefreshCw size={14} />
                          {copy.retrySpark}
                        </button>
                      )}
                    </div>
                  )}
                  <iframe
                    ref={sparkFrameRef}
                    key={`${activeSparkResource.id}:${sparkFrameVersion}`}
                    src={`/sparkvue/index.html?file=${encodeURIComponent(activeSparkPreview.src)}&attempt=${sparkFrameVersion}`}
                    title={`SPARKvue: ${activeSparkResource.title}`}
                    allow="cross-origin-isolated; bluetooth; usb; serial"
                    allowFullScreen
                    referrerPolicy="same-origin"
                    onLoad={() => {
                      setSparkViewerStatus((currentStatus) =>
                        currentStatus === 'opened' ? currentStatus : 'booting'
                      )
                      sparkFrameRef.current?.contentWindow?.postMessage(
                        {
                          type: SPARK_OPEN_MESSAGE,
                          fileUrl: activeSparkPreview.src,
                          force: false,
                        },
                        window.location.origin
                      )
                    }}
                    className="h-[min(78svh,860px)] min-h-[560px] w-full touch-pan-y rounded-2xl border-0 bg-white md:min-h-[620px] xl:h-[min(72vh,820px)]"
                  />
                </div>
              ) : (
                <div className="bg-slate-50 p-4 sm:p-6">
                  <div className="rounded-[22px] border border-amber-200 bg-amber-50 p-5 text-amber-950 shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                        <ShieldAlert size={22} />
                      </div>
                      <div>
                        <h4 className="text-base font-semibold">{copy.secureContextTitle}</h4>
                        <p className="mt-2 text-sm leading-6 text-amber-900">
                          {copy.secureContextDescription}
                        </p>
                        <ul className="mt-3 space-y-2 text-sm leading-6 text-amber-900">
                          {copy.secureContextChecklist.map((item) => (
                            <li key={item} className="flex gap-2">
                              <span aria-hidden="true">&bull;</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                        {httpsUpgradeUrl !== '#' && (
                          <a
                            href={httpsUpgradeUrl}
                            className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-amber-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-800"
                          >
                            {copy.openViaHttps}
                            <ExternalLink size={15} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}
        </div>
      </aside>
    </div>
  )
}


