"use client"

import type React from "react"
import { useState } from "react"

import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { WebSocketProvider } from "@/components/providers/websocket-provider"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Get token from localStorage (set in sign-in-form.tsx after login)
  let token = "";
  if (typeof window !== "undefined") {
    token = localStorage.getItem("accessToken") || "";
  }
  return (
    <WebSocketProvider token={token}>
      <div className="min-h-screen bg-background">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <div className="lg:pl-72">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          <main className="min-h-screen">
            <div className="container-minimal py-8">
              <div className="animate-fade-in">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </WebSocketProvider>
  )
}
