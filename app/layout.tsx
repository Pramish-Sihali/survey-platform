import type { Metadata } from 'next'
import { Ubuntu, Ubuntu_Mono } from 'next/font/google'
import './globals.css'

// Load Ubuntu fonts from Google Fonts
const ubuntu = Ubuntu({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-ubuntu',
  display: 'swap',
})

const ubuntuMono = Ubuntu_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-ubuntu-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'IXI Survey Platform',
  description: 'Professional employee survey and feedback collection platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${ubuntu.variable} ${ubuntuMono.variable}`}>
      <body className="min-h-screen antialiased font-sans">
        {children}
      </body>
    </html>
  )
}