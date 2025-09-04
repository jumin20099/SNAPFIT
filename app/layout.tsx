import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { CartProvider } from '@/contexts/CartContext'
import { ModalProvider } from '@/contexts/ModalContextV2'
import { ThemeProvider } from 'next-themes'
import { QueryProvider } from '@/providers/QueryProvider'
import { ToastProvider } from '@/shared/ui/ToastProvider'


const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SNAPFIT',
  description: '패션을 더 스마트하게',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_ORIGIN || 'http://localhost:3000'),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <QueryProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
            <CartProvider>
              <ModalProvider>
                {children}
                <ToastProvider />
              </ModalProvider>
            </CartProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
