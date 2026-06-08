import type { Metadata } from 'next'
import { Exo_2, Manrope } from 'next/font/google'
import AuthHashRouter from '@/components/AuthHashRouter'
import { getSiteDescription, siteConfig } from '@/lib/content'
import { getCurrentLocale } from '@/lib/locale-server'
import './globals.css'

const bodyFont = Manrope({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-sans',
})

const displayFont = Exo_2({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-display',
})

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getCurrentLocale()

  return {
    title: {
      default: siteConfig.name,
      template: `%s | ${siteConfig.name}`,
    },
    description: getSiteDescription(locale),
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getCurrentLocale()

  return (
    <html
      lang={locale}
      className={`${bodyFont.variable} ${displayFont.variable}`}
      data-scroll-behavior="smooth"
    >
      <body className="font-sans-app min-h-screen bg-[var(--background)] text-[var(--text)] antialiased">
        <AuthHashRouter />
        {children}
      </body>
    </html>
  )
}
