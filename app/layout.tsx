import type { Metadata } from 'next'
import './globals.css'
import { CartProvider } from '@/contexts/CartContext'
import { ModalProvider } from '@/contexts/ModalContextV2'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { QueryProvider } from '@/providers/QueryProvider'
import { ToastProvider } from '@/shared/ui/ToastProvider'
import { BottomTabBarWrapper } from '@/components/ui/BottomTabBarWrapper'
import { ReportModalProvider } from '@/features/report/ReportModalContext'



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
      <body className="font-pretendard">
        <QueryProvider>
          <ThemeProvider>
            <CartProvider>
              <ModalProvider>
                <ReportModalProvider>
                  {children}
                  <BottomTabBarWrapper />
                  <ToastProvider />
                </ReportModalProvider>
              </ModalProvider>
            </CartProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
