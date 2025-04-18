import type { Metadata } from 'next';
import '../globals.css';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { NextIntlClientProvider } from 'next-intl';
import { getTranslations, locales, defaultLocale } from '@/i18n/config';
import { cookies } from 'next/headers';

// Removed font declarations to avoid hydration issues

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  return {
    title: 'Nextflix',
    description: 'Watch the latest movies and TV shows online in HD quality',
    icons: {
      icon: '/favicon.svg',
      shortcut: '/favicon.svg',
      apple: '/favicon.svg',
      other: {
        rel: 'apple-touch-icon-precomposed',
        url: '/favicon.svg',
      },
    },
  };
}

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'vi' }];
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
  // Await params to avoid the "params should be awaited" warning
  const { locale: paramLocale } = await Promise.resolve(params);

  // Use the locale from params
  const locale = paramLocale || defaultLocale;

  // Get translations for the current locale
  const messages = getTranslations(locale);

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
      </head>
      <body
        className="antialiased bg-black text-white min-h-screen flex flex-col"
        suppressHydrationWarning
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Header />
          <main className="flex-grow">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
