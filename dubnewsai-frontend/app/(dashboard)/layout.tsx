import type { ReactNode } from "react"

import { Navbar } from "@/components/layout/Navbar"
import { Sidebar } from "@/components/layout/Sidebar"
import { WebSocketProvider } from "@/lib/hooks/useWebSocket"

export default function DashboardLayout({
  children
}: {
  children: ReactNode
}) {
  return (
    <WebSocketProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 lg:ml-64">
            <div className="container mx-auto max-w-7xl px-4 py-8">{children}</div>
          </main>
        </div>
      </div>
    </WebSocketProvider>
  )
}
