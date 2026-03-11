import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { LanguageProvider } from "@/components/providers/language-provider"
import { WebSocketProviderWrapper } from "@/components/providers/websocket-provider-wrapper"
import { CONFIG } from "@/lib/config"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: CONFIG.APP_TITLE,
  description: CONFIG.APP_DESCRIPTION,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{
          __html: `
            :root {
              --primary: ${CONFIG.PRIMARY_COLOR};
              --ring: ${CONFIG.PRIMARY_COLOR};
              --stat-card-rust: ${CONFIG.STAT_CARD_RUST};
              --stat-card-orange: ${CONFIG.STAT_CARD_ORANGE};
              --stat-card-dark: ${CONFIG.STAT_CARD_DARK};
              --stat-card-amber: ${CONFIG.STAT_CARD_AMBER};
              --stat-card-emerald: ${CONFIG.STAT_CARD_EMERALD};
              --stat-card-purple: ${CONFIG.STAT_CARD_PURPLE};
              --stat-card-rose: ${CONFIG.STAT_CARD_ROSE};
              --stat-card-cyan: ${CONFIG.STAT_CARD_CYAN};
              --chart-1: ${CONFIG.CHART_1};
              --chart-2: ${CONFIG.CHART_2};
              --chart-3: ${CONFIG.CHART_3};
              --chart-4: ${CONFIG.CHART_4};
              --chart-5: ${CONFIG.CHART_5};
            }
            .dark {
              --primary: ${CONFIG.PRIMARY_COLOR};
              --ring: ${CONFIG.PRIMARY_COLOR};
            }
          `
        }} />
      </head>
      <body className={inter.className}>
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
