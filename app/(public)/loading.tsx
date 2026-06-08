// D:\pasco-lab-portal\app\(public)\loading.tsx
export default function Loading() {
  return (
    <div className="py-12"><div className="mx-auto w-[min(1180px,calc(100%-32px))] animate-pulse space-y-8"><div className="h-12 bg-[var(--background-2)] rounded-lg w-32" /><div className="h-16 bg-[var(--background-2)] rounded-lg w-full max-w-2xl" /><div className="h-6 bg-[var(--background-2)] rounded-lg w-full max-w-3xl" /><div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-12">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-64 bg-[var(--background-2)] rounded-lg border border-[var(--border)]" />)}</div></div></div>
  )
}