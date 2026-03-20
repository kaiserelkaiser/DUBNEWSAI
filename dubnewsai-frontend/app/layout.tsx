import type { Metadata } from "next"
import { Inter, JetBrains_Mono, Merriweather, Space_Grotesk } from "next/font/google"
import type { ReactNode } from "react"

import "./globals.css"
import { getDefaultAppUrl } from "@/lib/config/api"
import { Providers } from "./providers"
import { Toaster } from "react-hot-toast"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap"
})

const clashDisplay = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-clash",
  display: "swap"
})

const editorial = Merriweather({
  subsets: ["latin"],
  variable: "--font-editorial",
  display: "swap",
  weight: ["300", "400", "700"]
})

export const metadata: Metadata = {
  metadataBase: new URL(getDefaultAppUrl(process.env.NEXT_PUBLIC_APP_URL)),
  title: "DUBNEWSAI - Dubai Real Estate Intelligence Platform",
  description: "Advanced real-time intelligence for Dubai real estate market",
  keywords: ["Dubai", "Real Estate", "Market Intelligence", "AI", "Analytics"]
}

export default function RootLayout({
  children
}: {
  children: ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} ${clashDisplay.variable} ${editorial.variable} font-sans antialiased`}
      >
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              className: "glass-effect text-sm text-slate-900 dark:text-slate-100",
              duration: 3000
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
