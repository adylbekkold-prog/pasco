# QUICK FIX GUIDE - Точные решения для всех найденных проблем

## 🔧 ИСПРАВЛЕНИЯ ГОТОВЫЕ К ПРИМЕНЕНИЮ

---

## FIX #1: Мёртвые ссылки футера (Каталог)

**ФАЙЛ:** `app/(public)/layout.tsx`

**ЧТО НАЙДЕНО:**
```tsx
// Lines 57-62
<div>
  <div className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">
    {copy.catalog}
  </div>
  <div className="mt-5 grid gap-3">
    <Link href="/labs" className="text-sm text-slate-600 transition hover:text-[#1647c5]">
      {copy.catalogLinks[0]}  // ❌ Все три ведут на /labs
    </Link>
    <Link href="/labs" className="text-sm text-slate-600 transition hover:text-[#1647c5]">
      {copy.catalogLinks[1]}  // ❌ Тем же путём
    </Link>
    <Link href="/labs" className="text-sm text-slate-600 transition hover:text-[#1647c5]">
      {copy.catalogLinks[2]}  // ❌ Всё одинаково
    </Link>
  </div>
</div>
```

**ВАРИАНТ A - Использовать query параметры:**
```tsx
<div>
  <div className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">
    {copy.catalog}
  </div>
  <div className="mt-5 grid gap-3">
    <Link href="/labs?sort=new" className="text-sm text-slate-600 transition hover:text-[#1647c5]">
      {copy.catalogLinks[0]}  // Новые лаборатории
    </Link>
    <Link href="/subjects" className="text-sm text-slate-600 transition hover:text-[#1647c5]">
      {copy.catalogLinks[1]}  // Предметы (новая страница)
    </Link>
    <Link href="/grades" className="text-sm text-slate-600 transition hover:text-[#1647c5]">
      {copy.catalogLinks[2]}  // Классы (новая страница)
    </Link>
  </div>
</div>
```

**ВАРИАНТ B - Упростить (если страницы не нужны):**
```tsx
<div>
  <div className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">
    {copy.catalog}
  </div>
  <div className="mt-5 grid gap-3">
    <Link href="/labs" className="text-sm text-slate-600 transition hover:text-[#1647c5]">
      {copy.catalogLinks[0]}  // Весь каталог
    </Link>
    {/* Остальные удалить или переделать */}
  </div>
</div>
```

---

## FIX #2: Мёртвые ссылки футера (Система)

**ФАЙЛ:** `app/(public)/layout.tsx`

**ЧТО НАЙДЕНО:**
```tsx
// Lines 64-67
<div>
  <div className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">
    {copy.system}
  </div>
  <div className="mt-5 grid gap-3 text-sm text-slate-600">
    <div>{copy.systemLinks[0]}</div>  // ❌ Просто <div>, не <Link>
    <div>{copy.systemLinks[1]}</div>  // ❌ Просто <div>, не <Link>
    <div>{copy.systemLinks[2]}</div>  // ❌ Просто <div>, не <Link>
  </div>
</div>
```

**РЕШЕНИЕ - Вариант A (Удалить):**
```tsx
{/* Удалить весь раздел системных ссылок если они не нужны */}
```

**РЕШЕНИЕ - Вариант B (Сделать ссылками):**
```tsx
<div>
  <div className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">
    {copy.system}
  </div>
  <div className="mt-5 grid gap-3">
    <Link href="/status" className="text-sm text-slate-600 transition hover:text-[#1647c5]">
      {copy.systemLinks[0]}  // Hybrid режим
    </Link>
    <Link href="/docs" className="text-sm text-slate-600 transition hover:text-[#1647c5]">
      {copy.systemLinks[1]}  // Supabase mirror
    </Link>
    <Link href="/files" className="text-sm text-slate-600 transition hover:text-[#1647c5]">
      {copy.systemLinks[2]}  // Локальные файлы
    </Link>
  </div>
</div>
```

**РЕШЕНИЕ - Вариант C (Переформатировать как информацию):**
```tsx
<div>
  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
    {copy.system}
  </div>
  <div className="mt-3 text-xs text-slate-500 space-y-2">
    <p>✓ {copy.systemLinks[0]}</p>  {/* Просто информация */}
    <p>✓ {copy.systemLinks[1]}</p>
    <p>✓ {copy.systemLinks[2]}</p>
  </div>
</div>
```

---

## FIX #3: Неиспользуемый компонент NavbarLinks

**ФАЙЛ:** `components/NavbarLinks.tsx`

**РЕШЕНИЕ - Полностью удалить файл:**
```bash
# В терминале:
rm components/NavbarLinks.tsx
```

**Убедиться, что нигде не импортируется:**
```bash
grep -r "NavbarLinks" app/ components/ lib/
# Не должно быть результатов
```

---

## FIX #4: Отсутствует защита маршрута /admin

**ФАЙЛ:** `app/(admin)/layout.tsx`

**ЧТО НАЙДЕНО:**
```tsx
// У layout нет проверки авторизации
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Просто рендерит children без проверки
  return (...)
}
```

**РЕШЕНИЕ - Добавить проверку:**

```tsx
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/admin-access' // или то, что имеем

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Проверить авторизацию
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/admin/login')
  }

  return (...)
}
```

Или через middleware (`middleware.ts`):
```ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Здесь проверить авторизацию
    const auth = request.cookies.get('auth-token') // пример
    
    if (!auth && request.nextUrl.pathname !== '/admin/login') {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
```

---

## FIX #5: Фильтрация зависит от выбора предмета

**ФАЙЛ:** `app/(public)/labs/page.tsx`

**ЧТО НАЙДЕНО:**
```tsx
// Lines 65-70
const [labs, subjects, grades] = await Promise.all([
  getLabs({
    subjectSlug: params.subject,
    gradeLevel: params.subject ? undefined : params.grade ? Number(params.grade) : undefined,
    search: params.subject ? undefined : params.search,
    locale,
  }),
  // ...
])
```

**ПРОБЛЕМА:** 
- Класс работает ТОЛЬКО если выбран предмет
- Поиск не работает если выбран предмет
- Логика странная и запутанная

**РЕШЕНИЕ - Сделать фильтры независимыми:**

```tsx
const [labs, subjects, grades] = await Promise.all([
  getLabs({
    subjectSlug: params.subject,
    gradeLevel: params.grade ? Number(params.grade) : undefined,
    search: params.search,
    locale,
  }),
  // ...
])
```

Также обновить в `lib/queries.ts` функцию `getLabs()`:
```ts
// Убедиться, что функция принимает все параметры одновременно
export async function getLabs({
  subjectSlug,      // может быть задан
  gradeLevel,       // может быть задан
  search,           // может быть задан
  locale,
}: {
  subjectSlug?: string
  gradeLevel?: number
  search?: string
  locale: Locale
}): Promise<Lab[]> {
  // Фильтровать по всем параметрам ОДНОВРЕМЕННО
  return labs.filter(lab => {
    const matchSubject = !subjectSlug || lab.subjects?.slug === subjectSlug
    const matchGrade = !gradeLevel || lab.grade_level === gradeLevel
    const matchSearch = !search || lab.title.toLowerCase().includes(search.toLowerCase())
    
    return matchSubject && matchGrade && matchSearch
  })
}
```

---

## FIX #6: Создать страницу /subjects

**НОВЫЙ ФАЙЛ:** `app/(public)/subjects/page.tsx`

```tsx
import Link from 'next/link'
import { getCurrentLocale } from '@/lib/locale-server'
import { getSubjects } from '@/lib/queries'

export default async function SubjectsPage() {
  const locale = await getCurrentLocale()
  const subjects = await getSubjects(locale)
  
  const copy = locale === 'ky' ? {
    title: 'Бардык предметтер',
    subtitle: 'Предметти тандап, ал боюнча лабораториялык иштерди көрүңүз',
  } : {
    title: 'Все предметы',
    subtitle: 'Выберите предмет, чтобы увидеть все лабораторные работы',
  }

  return (
    <div className="pb-20 pt-8">
      <section className="mx-auto w-[min(1180px,calc(100%-32px))]">
        <h1 className="text-4xl font-semibold">{copy.title}</h1>
        <p className="mt-4 text-base text-slate-600">{copy.subtitle}</p>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => (
            <Link
              key={subject.id}
              href={`/labs?subject=${subject.slug}`}
              className="rounded-2xl border border-slate-200 p-6 hover:border-blue-500"
            >
              <div className="text-3xl mb-4">{subject.icon}</div>
              <h3 className="text-xl font-semibold">{subject.name}</h3>
              {/* Добавить счётчик лабораторий */}
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
```

---

## FIX #7: Создать страницу /grades

**НОВЫЙ ФАЙЛ:** `app/(public)/grades/page.tsx`

```tsx
import Link from 'next/link'
import { getCurrentLocale } from '@/lib/locale-server'
import { getGrades } from '@/lib/queries'

export default async function GradesPage() {
  const locale = await getCurrentLocale()
  const grades = await getGrades(locale)
  
  const copy = locale === 'ky' ? {
    title: 'Класстар боюнча каталог',
    subtitle: 'Окуучулардын возрастына ылайыктуу лабораториялар',
  } : {
    title: 'Каталог по классам',
    subtitle: 'Лабораторные работы, подходящие для каждого класса',
  }

  return (
    <div className="pb-20 pt-8">
      <section className="mx-auto w-[min(1180px,calc(100%-32px))]">
        <h1 className="text-4xl font-semibold">{copy.title}</h1>
        <p className="mt-4 text-base text-slate-600">{copy.subtitle}</p>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {grades.map((grade) => (
            <Link
              key={grade.level}
              href={`/labs?grade=${grade.level}`}
              className="rounded-xl border border-slate-200 p-6 text-center hover:border-blue-500"
            >
              <h3 className="text-2xl font-semibold">{grade.label}</h3>
              {/* Добавить информацию о возрасте */}
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
```

---

## 📋 ЧЕКЛИСТ ИСПРАВЛЕНИЙ

- [ ] **FIX #1:** Исправить каталог ссылки в футере
- [ ] **FIX #2:** Исправить/удалить системные ссылки
- [ ] **FIX #3:** Удалить NavbarLinks компонент
- [ ] **FIX #4:** Добавить защиту /admin маршрута
- [ ] **FIX #5:** Сделать фильтры независимыми
- [ ] **FIX #6:** Создать /subjects страницу
- [ ] **FIX #7:** Создать /grades страницу

---

## ⏱️ ПРИМЕРНОЕ ВРЕМЯ

| Fix | Время | Сложность |
|-----|-------|----------|
| #1 | 5 мин | 🟢 |
| #2 | 5 мин | 🟢 |
| #3 | 3 мин | 🟢 |
| #4 | 10 мин | 🟡 |
| #5 | 15 мин | 🟡 |
| #6 | 20 мин | 🟡 |
| #7 | 20 мин | 🟡 |
| **ИТОГО** | **~78 мин** | **🟡** |

**Рекомендуемый порядок:**
1. Начать с FIX #1, #2, #3 (быстрых)
2. Затем FIX #4 (безопасность)
3. Потом FIX #5 (логика)
4. Наконец FIX #6, #7 (новые маршруты)
