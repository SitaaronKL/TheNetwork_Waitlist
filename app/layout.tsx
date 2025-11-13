import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'TheNetwork',
  description: "Meet the _____ your algorithm already knows you'll love.",
  icons: {
    icon: '/app_icon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  )
} 