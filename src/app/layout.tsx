
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
        <title>Pentecostal Church of the Living God</title>
        <meta name="description" content="A place for faith-based connection and growth." />
        <link rel="manifest" href="/manifest.json" />
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
