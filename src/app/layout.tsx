import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SnapFit',
  description: 'SnapFit - Your Fashion Assistant',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-background">
        {children}
      </body>
    </html>
  )
}
