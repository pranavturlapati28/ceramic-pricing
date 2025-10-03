import Navigation from '@/components/Navigation'
import './globals.css'

export const metadata = {
  title: 'Ceramic Pricer',
  description: 'AI-powered ceramic pricing tool',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Navigation />
        {children}
      </body>
    </html>
  )
}