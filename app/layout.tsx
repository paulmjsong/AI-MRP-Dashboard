import type { Metadata } from 'next'
import './globals.css'

const IS_DEMO = true; // Set to true for demo mode

export const metadata: Metadata = IS_DEMO ? {
  title: 'Celltrion Dashboard',
  description: 'Created with v0',
  generator: 'v0.dev',
  icons: {
    icon: '/dashboard/favicon.ico',
    shortcut: '/dashboard/favicon.ico',
    apple: '/dashboard/favicon.ico',
  },
} : {
  title: 'AI Dashboard',
  description: 'Created with v0',
  generator: 'v0.dev',
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
