'use client'

import { useRef, useState, type ChangeEvent } from 'react'
import { AlertCircle, CheckCircle, Upload } from 'lucide-react'
import { createClientId } from '@/lib/client-id'

interface FileUploaderProps {
  labId: string
  accept: string
  label: string
  onUpload: (url: string, fileName: string) => void
}

export default function FileUploader({
  labId,
  accept,
  label,
  onUpload,
}: FileUploaderProps) {
  const [status, setStatus] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [progress, setProgress] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setStatus('uploading')
    setProgress(20)

    try {
      const formData = new FormData()
      formData.set('file', file)
      formData.set('scope', labId || createClientId('upload'))

      setProgress(55)

      const response = await fetch('/api/uploads', {
        method: 'POST',
        body: formData,
      })

      const data = (await response.json()) as
        | { url: string; fileName: string; size: number }
        | { error: string }

      if (!response.ok || !('url' in data)) {
        throw new Error('error' in data ? data.error : 'Не удалось загрузить файл')
      }

      setProgress(100)
      setStatus('done')
      setMessage(data.fileName)
      onUpload(data.url, data.fileName)
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'Не удалось загрузить файл')
    }
  }

  return (
    <div>
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={handleFile} />

      <div onClick={() => inputRef.current?.click()} className="uploader-zone">
        {status === 'idle' && (
          <>
            <div className="uploader-icon">
              <Upload size={24} className="mx-auto" />
            </div>
            <div className="uploader-label">{label}</div>
            <div className="uploader-hint">Нажмите, чтобы выбрать файл</div>
          </>
        )}

        {status === 'uploading' && (
          <>
            <div className="uploader-icon">Загрузка...</div>
            <div className="uploader-progress">
              <div className="uploader-progress-bar" style={{ width: `${progress}%` }} />
            </div>
            <div className="uploader-hint">{progress}%</div>
          </>
        )}

        {status === 'done' && (
          <>
            <div className="uploader-icon text-[var(--success)]">
              <CheckCircle size={22} className="mx-auto" />
            </div>
            <div className="uploader-label">{message}</div>
            <div className="uploader-hint">Файл загружен</div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="uploader-icon text-[var(--danger)]">
              <AlertCircle size={22} className="mx-auto" />
            </div>
            <div className="uploader-label">Ошибка загрузки</div>
            <div className="uploader-hint">{message}</div>
          </>
        )}
      </div>
    </div>
  )
}
