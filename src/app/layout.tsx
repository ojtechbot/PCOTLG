
"use client"
import type { Metadata } from 'next';
import { Toaster } from "@/components/ui/toaster"
import './globals.css';
import { AuthProvider } from '@/hooks/use-auth';
import { ThemeProvider } from '@/components/theme-provider';
import { Inter, Noto_Serif, EB_Garamond } from 'next/font/google';
import { cn } from '@/lib/utils';
import { SoundProvider } from '@/hooks/use-sound';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const notoSerif = Noto_Serif({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-noto-serif',
})

const ebGaramond = EB_Garamond({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-eb-garamond',
})


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Pentecostal Church of the Living God</title>
        <meta name="description" content="A place for faith-based connection, growth, and community engagement." />
        <meta name="keywords" content="church, pentecostal, community, faith, God, Jesus, Bible, worship, PCOTLG" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/images/logo.png"></link>
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body className={cn("font-body antialiased", inter.variable, notoSerif.variable, ebGaramond.variable)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <SoundProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </SoundProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
