import type { Metadata } from 'next'
import AuthHashRouter from '@/components/AuthHashRouter'
import { ThemeProvider } from '@/components/ThemeProvider'
import { ToastProvider } from '@/components/ui/toast'
import { getSiteDescription, siteConfig } from '@/lib/content'
import { getCurrentLocale } from '@/lib/locale-server'
import { getSiteUrl } from '@/lib/site-url'
import './globals.css'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getCurrentLocale()

  return {
    metadataBase: getSiteUrl(),
    title: {
      default: siteConfig.name,
      template: `%s | ${siteConfig.name}`,
    },
    description: getSiteDescription(locale),
    applicationName: siteConfig.name,
    keywords: ['PASCO', 'SPARKvue', 'STEM', 'physics labs', 'school labs'],
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title: siteConfig.name,
      description: getSiteDescription(locale),
      siteName: siteConfig.name,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: siteConfig.name,
      description: getSiteDescription(locale),
    },
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
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="font-sans-app min-h-screen bg-[var(--background)] text-[var(--text)] antialiased">
        <ThemeProvider>
          <ToastProvider>
            <AuthHashRouter />
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
