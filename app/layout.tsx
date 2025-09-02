import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { CartProvider } from '@/contexts/CartContext'
import { ModalProvider } from '@/contexts/ModalContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { BottomTabBar } from '@/components/bottom-tab-bar'

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
        <ThemeProvider>
          <CartProvider>
            <ModalProvider>
              {children}
              <BottomTabBar />
            </ModalProvider>
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
