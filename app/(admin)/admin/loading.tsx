// D:\pasco-lab-portal\app\(admin)\admin\loading.tsx
export default function AdminLoading() {
  return (
    <div className="animate-pulse">
      <div className="mb-8 h-14 w-72 rounded-[24px] bg-slate-200" />
      <div className="mb-8 grid gap-5 md:grid-cols-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-32 rounded-[28px] bg-slate-200" />)}</div>
      <div className="h-96 rounded-[30px] bg-slate-200" />
    </div>
  )
}