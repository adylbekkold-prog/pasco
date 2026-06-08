'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export default function BackButton({ label }: { label: string }) {
  const router = useRouter()

  return (
    <button
      onClick={() => router.back()}
      className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-950"
    >
      <ArrowLeft size={16} />
      {label}
    </button>
  )
}
