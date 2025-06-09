import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'

// Load Ubuntu fonts from public/fonts directory
const ubuntu = localFont({
  src: [
    {
      path: '../public/fonts/Ubuntu-L.ttf',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../public/fonts/Ubuntu-R.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/Ubuntu-M.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../public/fonts/Ubuntu-B.ttf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-ubuntu',
  display: 'swap',
})

const ubuntuMono = localFont({
  src: [
    {
      path: '../public/fonts/UbuntuMono-R.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/UbuntuMono-B.ttf',
      weight: '700',
      style: 'normal',
    },
  ],
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
    <html lang="en">
      <body className={`min-h-screen antialiased ${ubuntu.variable} ${ubuntuMono.variable} font-sans`}>
        {children}
      </body>
    </html>
  )
}