// D:\pasco-lab-portal\app\(admin)\admin\loading.tsx
import { Skeleton } from '@/components/ui/skeleton'

export default function AdminLoading() {
  return (
    <div className="space-y-8" aria-label="Загрузка админ-панели">
      <div className="pro-page-header">
        <div className="w-full max-w-2xl">
          <Skeleton className="h-8 w-36" />
          <Skeleton className="mt-5 h-12 w-3/4" />
          <Skeleton className="mt-4 h-5 w-full" />
          <Skeleton className="mt-2 h-5 w-2/3" />
        </div>
        <Skeleton className="h-11 w-44" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-36 rounded-[24px]" />
        ))}
      </div>
      <Skeleton className="h-96 rounded-[28px]" />
    </div>
  )
}
