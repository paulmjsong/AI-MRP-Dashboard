import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI Dashboard',
  description: 'Created with v0',
  generator: 'v0.dev',
  icons: {
    icon: '/dashboard/favicon.ico',
    shortcut: '/dashboard/favicon.ico',
    apple: '/dashboard/favicon.ico',
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
