import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { LanguageProvider } from "@/components/providers/language-provider"
import { WebSocketProviderWrapper } from "@/components/providers/websocket-provider-wrapper"

const inter = Inter({ subsets: ["latin"] })

const appName = process.env.NEXT_PUBLIC_APP_NAME || "Flashpayshpay Module";
const appTitle = process.env.NEXT_PUBLIC_APP_TITLE || "Flashpayshpay Module - Admin Dashboard";
const appDescription = process.env.NEXT_PUBLIC_APP_DESCRIPTION || "Professional admin dashboard for Flashpayshpayshpay Module";
const primaryColor = process.env.NEXT_PUBLIC_PRIMARY_COLOR;

export const metadata: Metadata = {
  title: appTitle,
  description: appDescription,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {primaryColor && (
          <style dangerouslySetInnerHTML={{
            __html: `
              :root {
                --primary: ${primaryColor};
                --ring: ${primaryColor};
              }
              .dark {
                --primary: ${primaryColor};
                --ring: ${primaryColor};
              }
            `
          }} />
        )}
        <ThemeProvider>
          <LanguageProvider>
            <WebSocketProviderWrapper>
              {children}
            </WebSocketProviderWrapper>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
